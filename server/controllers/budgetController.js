const { Budget, User, Entity, Vendor, PaymentRequest } = require('../models');
const { Op } = require('sequelize');
const approvalService = require('../services/approvalService');

// Mock FX Rate (e.g., Local to Reporting)
const FX_RATE = 1.1;

exports.createBudget = async (req, res) => {
    try {
        const {
            entity_id, expense_category, expense_type, nature, budget_source,
            one_time_or_recurring, frequency, product_service_name, deal_name,
            vendor_id, vendor_name, vendor_country,
            country, currency, total_budget_local, attachments, status
        } = req.body;

        // Handle Vendor
        let finalVendorId = vendor_id;
        if ((!finalVendorId || finalVendorId === '') && vendor_name) {
            let vendor = await Vendor.findOne({ where: { name: vendor_name } });
            if (!vendor) {
                vendor = await Vendor.create({
                    name: vendor_name,
                    country: vendor_country || country,
                    default_currency: currency
                });
            }
            finalVendorId = vendor.id;
        } else if (finalVendorId === '') {
            finalVendorId = null;
        }

        // Calculate Reporting Amount
        let total_budget_reporting = null;
        if (total_budget_local) {
            total_budget_reporting = parseFloat(total_budget_local) * FX_RATE;
        }

        // Create Budget
        const budget = await Budget.create({
            entity_id,
            initiator_id: req.user.id,
            expense_category,
            expense_type,
            nature,
            budget_source,
            one_time_or_recurring,
            frequency,
            product_service_name,
            deal_name,
            vendor_id: finalVendorId,
            country,
            currency,
            total_budget_local: total_budget_local || null,
            total_budget_reporting,
            status: status || 'DRAFT'
        });

        // If status is SUBMITTED, trigger approval workflow
        if (status === 'SUBMITTED') {
            await approvalService.submitForApproval('Budget', budget.id, entity_id, req.user.id);
        }

        res.status(201).json(budget);
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ message: 'Error creating budget', error: error.message });
    }
};

// Submit budget for approval
exports.submitBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findByPk(id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (budget.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Only draft budgets can be submitted' });
        }

        // Trigger approval workflow
        const result = await approvalService.submitForApproval(
            'Budget',
            budget.id,
            budget.entity_id,
            budget.initiator_id
        );

        res.json(result);
    } catch (error) {
        console.error('Error submitting budget:', error);
        res.status(500).json({ message: 'Error submitting budget', error: error.message });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        console.log('=== getBudgets called ===');
        console.log('User:', req.user);
        console.log('Query:', req.query);

        const { entity_id, status, search } = req.query;
        const where = {};

        if (entity_id) where.entity_id = entity_id;
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { product_service_name: { [Op.like]: `%${search}%` } },
                { deal_name: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter by initiator for non-admin users
        if (req.user.role === 'initiator') {
            where.initiator_id = req.user.id;
        }

        console.log('Where clause:', where);

        const budgets = await Budget.findAll({
            where,
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'] },
                { model: User, as: 'Initiator', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log('Budgets found:', budgets.length);

        // Compute aggregations
        const totalAmount = budgets.reduce((sum, b) => sum + parseFloat(b.total_budget_local || 0), 0);

        // Compute total_paid and remaining_budget for each
        const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
            const payments = await PaymentRequest.findAll({
                where: { linked_budget_id: budget.id }
            });
            const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_local || 0), 0);
            const remainingBudget = parseFloat(budget.total_budget_local || 0) - totalPaid;

            return {
                ...budget.toJSON(),
                total_paid: totalPaid,
                remaining_budget: remainingBudget
            };
        }));

        console.log('Sending response...');
        res.json({
            data: enrichedBudgets,
            aggregations: {
                total_amount: totalAmount,
                count: budgets.length
            }
        });
    } catch (error) {
        console.error('!!! Error in getBudgets !!!');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findByPk(id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Only allow updates if status is DRAFT
        if (budget.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Only draft budgets can be updated' });
        }

        const {
            entity_id, expense_category, expense_type, nature, budget_source,
            one_time_or_recurring, frequency, product_service_name, deal_name,
            vendor_id, country, currency, total_budget_local
        } = req.body;

        // Calculate Reporting Amount
        let total_budget_reporting = null;
        if (total_budget_local) {
            total_budget_reporting = parseFloat(total_budget_local) * FX_RATE;
        }

        await budget.update({
            entity_id,
            expense_category,
            expense_type,
            nature,
            budget_source,
            one_time_or_recurring,
            frequency,
            product_service_name,
            deal_name,
            vendor_id: vendor_id === '' ? null : vendor_id,
            country,
            currency,
            total_budget_local: total_budget_local || null,
            total_budget_reporting
        });

        res.json(budget);
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ message: 'Error updating budget', error: error.message });
    }
};

exports.getBudgetDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findByPk(id, {
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'] },
                { model: User, as: 'Initiator', attributes: ['username'] }
            ]
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.json(budget);
    } catch (error) {
        console.error('Error fetching budget details:', error);
        res.status(500).json({ message: 'Error fetching budget details', error: error.message });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findByPk(id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Delete related records (cascade)
        await PaymentRequest.destroy({ where: { linked_budget_id: id } });
        await budget.destroy();

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Error deleting budget', error: error.message });
    }
};
