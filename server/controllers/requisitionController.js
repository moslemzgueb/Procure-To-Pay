const { Requisition, User, PurchaseOrder, Budget } = require('../models');
const { Op } = require('sequelize');

exports.createRequisition = async (req, res) => {
    try {
        const { title, description, amount, budgetId } = req.body;
        const invoiceAttachment = req.file ? req.file.path : null;

        // 1. Validate Budget Existence
        const budget = await Budget.findByPk(budgetId);
        if (!budget) {
            return res.status(404).json({ message: 'Selected budget not found' });
        }

        // 2. Calculate Remaining Budget
        const requisitions = await Requisition.findAll({
            where: {
                budgetId: budgetId,
                status: { [Op.ne]: 'rejected' } // Count all except rejected
            }
        });

        const totalSpent = requisitions.reduce((sum, req) => sum + parseFloat(req.amount), 0);
        const requestedAmount = parseFloat(amount);
        const remainingBudget = parseFloat(budget.amountLCY) - totalSpent;

        if (requestedAmount > remainingBudget) {
            return res.status(400).json({
                message: `Insufficient budget funds. Remaining: $${remainingBudget.toFixed(2)}, Requested: $${requestedAmount.toFixed(2)}`
            });
        }

        // 3. Create Requisition
        const requisition = await Requisition.create({
            title,
            description,
            amount: requestedAmount,
            budgetId,
            invoiceAttachment,
            userId: req.user.id,
            status: 'pending'
        });

        res.status(201).json(requisition);
    } catch (error) {
        res.status(500).json({ message: 'Error creating requisition', error: error.message });
    }
};

exports.getRequisitions = async (req, res) => {
    try {
        const where = {};
        if (req.user.role === 'initiator') {
            where.userId = req.user.id;
        }
        // Approvers and Admins see all

        const requisitions = await Requisition.findAll({
            where,
            include: [{ model: User, attributes: ['username'] }]
        });
        res.json(requisitions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requisitions', error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const requisition = await Requisition.findByPk(id);
        if (!requisition) {
            return res.status(404).json({ message: 'Requisition not found' });
        }

        requisition.status = status;
        await requisition.save();

        if (status === 'approved') {
            // Auto-create Purchase Order
            const po = await PurchaseOrder.create({
                poNumber: `PO-${Date.now()}`,
                requisitionId: requisition.id,
                status: 'issued'
            });
            return res.json({ message: 'Requisition approved and PO created', requisition, po });
        }

        res.json({ message: `Requisition ${status}`, requisition });
    } catch (error) {
        res.status(500).json({ message: 'Error updating requisition', error: error.message });
    }
};
