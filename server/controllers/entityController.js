const { Entity } = require('../models');

exports.getEntities = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const entities = await Entity.findAll({ where });
        res.json(entities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching entities', error: error.message });
    }
};

exports.createEntity = async (req, res) => {
    try {
        const entity = await Entity.create(req.body);
        res.status(201).json(entity);
    } catch (error) {
        console.error('Error creating entity:', error);
        res.status(500).json({ message: 'Error creating entity', error: error.message });
    }
};

exports.updateEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Entity.update(req.body, { where: { id } });
        if (updated) {
            const updatedEntity = await Entity.findByPk(id);
            res.json(updatedEntity);
        } else {
            res.status(404).json({ message: 'Entity not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating entity', error: error.message });
    }
};

exports.deleteEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const { Budget, PaymentRequest, ApprovalRule } = require('../models');

        // Check if entity has budgets or payments
        const budgetCount = await Budget.count({ where: { entity_id: id } });
        const paymentCount = await PaymentRequest.count({ where: { entity_id: id } });

        if (budgetCount > 0 || paymentCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete entity with existing budgets or payments',
                budgetCount,
                paymentCount
            });
        }

        const entity = await Entity.findByPk(id);
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        // Delete related approval rules
        await ApprovalRule.destroy({ where: { entity_id: id } });
        await entity.destroy();

        res.json({ message: 'Entity deleted successfully' });
    } catch (error) {
        console.error('Error deleting entity:', error);
        res.status(500).json({ message: 'Error deleting entity', error: error.message });
    }
};
