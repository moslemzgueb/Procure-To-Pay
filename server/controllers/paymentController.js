const { PaymentRequest, Budget, Entity, Vendor, User, Attachment } = require('../models');
const { Op } = require('sequelize');

// Mock FX Rate
const FX_RATE = 1.1;

exports.getPaymentById = async (req, res) => {
    try {
        console.log(`[getPaymentById] Fetching payment ID: ${req.params.id}`);

        const payment = await PaymentRequest.findByPk(req.params.id, {
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'], required: false },
                { model: Budget, attributes: ['product_service_name', 'deal_name', 'status', 'id'], required: false },
                { model: User, as: 'Initiator', attributes: ['username'], required: false }
            ]
        });

        if (!payment) {
            console.log(`[getPaymentById] Payment ${req.params.id} not found`);
            return res.status(404).json({ message: 'Payment not found' });
        }

        console.log(`[getPaymentById] Successfully retrieved payment ${req.params.id}`);
        res.status(200).json({ data: payment });
    } catch (error) {
        console.error(`[getPaymentById] Error fetching payment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error fetching payment', error: error.message });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const {
            linked_budget_id, entity_id, vendor_id,
            product_service_description, invoice_date, invoice_number,
            period_start, period_end, currency, amount_local
        } = req.body;

        const invoiceAttachment = req.file ? req.file.path : null;

        // Calculate Reporting Amount
        const amount_reporting = parseFloat(amount_local) * FX_RATE;

        // Sanitize inputs
        const sanitizedData = {
            linked_budget_id: linked_budget_id === '' ? null : linked_budget_id,
            entity_id: entity_id === '' ? null : entity_id,
            vendor_id: vendor_id === '' ? null : vendor_id,
            period_start: period_start === '' ? null : period_start,
            period_end: period_end === '' ? null : period_end,
            amount_local: amount_local === '' ? 0 : amount_local
        };

        // Create Payment
        const payment = await PaymentRequest.create({
            linked_budget_id: sanitizedData.linked_budget_id,
            entity_id: sanitizedData.entity_id,
            initiator_id: req.user.id,
            vendor_id: sanitizedData.vendor_id,
            product_service_description,
            invoice_date,
            invoice_number,
            period_start: sanitizedData.period_start,
            period_end: sanitizedData.period_end,
            currency,
            amount_local: sanitizedData.amount_local,
            amount_reporting,
            status: 'DRAFT'
        });

        // Handle Attachment if file exists
        if (invoiceAttachment) {
            const { Attachment } = require('../models');
            await Attachment.create({
                object_type: 'PAYMENT',
                object_id: payment.id,
                file_path: invoiceAttachment
            });
        }

        res.status(201).json(payment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { entity_id, vendor_id, budget_id, status } = req.query;
        const where = {};

        if (entity_id) where.entity_id = entity_id;
        if (vendor_id) where.vendor_id = vendor_id;
        if (budget_id) where.linked_budget_id = budget_id;
        if (status) where.status = status;

        // Filter by initiator for non-admin users
        if (req.user.role === 'initiator') {
            where.initiator_id = req.user.id;
        }

        const payments = await PaymentRequest.findAll({
            where,
            include: [
                { model: Entity, attributes: ['name'] },
                { model: Vendor, attributes: ['name'], required: false },
                { model: Budget, attributes: ['deal_name', 'product_service_name'], required: false },
                { model: User, as: 'Initiator', attributes: ['username'], required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Aggregations
        const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount_local), 0);
        const count = payments.length;

        res.json({
            data: payments,
            aggregations: {
                total_amount: totalAmount,
                count: count
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

exports.createBatchPayments = async (req, res) => {
    try {
        const files = req.files; // Array of files
        const createdPayments = [];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        for (const file of files) {
            // Create a skeleton Draft Payment for each file
            const payment = await PaymentRequest.create({
                entity_id: 1, // Default or require selection? For now, maybe null or strict? 
                // Actually, model requires entity_id. 
                // We might need to relax constraints for Drafts or pass default entity.
                // For now, let's assume the user passes entity_id in the body for the batch.
                entity_id: req.body.entity_id,
                initiator_id: req.user.id,
                vendor_id: 1, // Placeholder, user must update
                product_service_description: 'Batch Upload - Pending Details',
                invoice_date: new Date(),
                invoice_number: 'PENDING',
                currency: 'USD',
                amount_local: 0,
                status: 'DRAFT'
            });

            // Create Attachment
            const { Attachment } = require('../models');
            await Attachment.create({
                object_type: 'PAYMENT',
                object_id: payment.id,
                file_path: file.path
            });

            createdPayments.push(payment);
        }

        res.status(201).json({ message: `${createdPayments.length} drafts created`, data: createdPayments });
    } catch (error) {
        console.error('Error batch creating payments:', error);
        res.status(500).json({ message: 'Error batch creating payments', error: error.message });
    }
};

exports.submitPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentRequest.findByPk(id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Only DRAFT payments can be submitted' });
        }

        // Trigger approval workflow
        const approvalService = require('../services/approvalService');
        const result = await approvalService.submitForApproval(
            'PaymentRequest',
            payment.id,
            payment.entity_id,
            payment.initiator_id
        );

        res.json({ message: 'Payment submitted for approval', payment, result });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ message: 'Error submitting payment', error: error.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentRequest.findByPk(id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Only allow deleting DRAFT payments or if admin
        // For "cleaning", admin should be able to delete almost anything? 
        // Let's restrict to DRAFT for non-admins, but allow admins to delete anything.
        if (req.user.role !== 'system_admin' && payment.status !== 'DRAFT') {
            return res.status(403).json({ message: 'Only DRAFT payments can be deleted' });
        }

        // Hard delete or soft link removal? Budget uses hard delete.
        // Let's hard delete to thoroughly "clean" as requested.
        await payment.destroy();

        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
};
