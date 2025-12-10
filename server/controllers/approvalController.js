const approvalService = require('../services/approvalService');
const { ApprovalStep, QAThread, User, ApprovalRule, Validator } = require('../models');

console.log('LOADING APPROVAL CONTROLLER V2');
console.log('IMPORTED SERVICE KEYS:', Object.keys(Object.getPrototypeOf(approvalService)));

exports.approve = async (req, res) => {
    try {
        let { objectType, objectId } = req.body;
        objectType = objectType.toUpperCase();

        // Find validator for this user
        const validator = await Validator.findOne({ where: { user_id: req.user.id } });
        if (!validator) {
            return res.status(403).json({ message: 'User is not a validator' });
        }

        console.log('DEBUG: Controller found validator:', validator.id);
        const result = await approvalService.approveV2(objectType, objectId, validator.id);
        res.json(result);
    } catch (error) {
        console.error('Error approving:', error);
        if (error.original) console.error('Original error:', error.original);
        if (error.sql) console.error('SQL:', error.sql);
        res.status(500).json({
            message: 'Error approving',
            error: error.message,
            stack: error.stack,
            original: error.original ? error.original.toString() : null
        });
    }
};

exports.reject = async (req, res) => {
    try {
        let { objectType, objectId, comment } = req.body;
        objectType = objectType.toUpperCase();

        // Find validator for this user
        const validator = await Validator.findOne({ where: { user_id: req.user.id } });
        if (!validator) {
            return res.status(403).json({ message: 'User is not a validator' });
        }

        const result = await approvalService.reject(objectType, objectId, validator.id, comment);
        res.json(result);
    } catch (error) {
        console.error('Error rejecting:', error);
        res.status(500).json({ message: 'Error rejecting', error: error.message });
    }
};

exports.requestInfo = async (req, res) => {
    try {
        let { objectType, objectId, comment } = req.body;
        objectType = objectType.toUpperCase();

        // Find validator for this user
        const validator = await Validator.findOne({ where: { user_id: req.user.id } });
        if (!validator) {
            return res.status(403).json({ message: 'User is not a validator' });
        }

        const result = await approvalService.requestInfo(objectType, objectId, validator.id, comment);
        res.json(result);
    } catch (error) {
        console.error('Error requesting info:', error);
        res.status(500).json({ message: 'Error requesting info', error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { objectType, objectId } = req.query;
        const history = await ApprovalStep.findAll({
            where: { object_type: objectType, object_id: objectId },
            include: [{ model: User, as: 'Approver', attributes: ['username'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

// Q&A
exports.getQA = async (req, res) => {
    try {
        const { objectType, objectId } = req.query;
        const threads = await QAThread.findAll({
            where: { object_type: objectType, object_id: objectId },
            include: [{ model: User, as: 'Author', attributes: ['username'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(threads);
    } catch (error) {
        console.error('Error fetching QA:', error);
        res.status(500).json({ message: 'Error fetching QA', error: error.message });
    }
};

exports.postQA = async (req, res) => {
    try {
        const { objectType, objectId, content } = req.body;
        const thread = await QAThread.create({
            object_type: objectType,
            object_id: objectId,
            author_id: req.user.id,
            content
        });

        // Return with author info for immediate display
        const fullThread = await QAThread.findByPk(thread.id, {
            include: [{ model: User, as: 'Author', attributes: ['username'] }]
        });

        res.status(201).json(fullThread);
    } catch (error) {
        console.error('Error posting QA:', error);
        res.status(500).json({ message: 'Error posting QA', error: error.message });
    }
};

// Rules Management
exports.getRules = async (req, res) => {
    try {
        const { entityId } = req.query;
        const rules = await ApprovalRule.findAll({
            where: { entity_id: entityId },
            order: [['group_number', 'ASC']]
        });
        res.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ message: 'Error fetching rules', error: error.message });
    }
};

exports.saveRules = async (req, res) => {
    try {
        const { entityId, rules } = req.body;

        // Transactional replace would be better, but simple delete-create for now
        await ApprovalRule.destroy({ where: { entity_id: entityId } });

        const createdRules = await Promise.all(rules.map(rule => {
            return ApprovalRule.create({
                entity_id: entityId,
                workflow_type: rule.workflow_type || 'BUDGET',
                group_number: rule.group_number,
                approvers: rule.approvers, // Array of IDs
                logic: rule.logic || 'OR'
            });
        }));

        res.json(createdRules);
    } catch (error) {
        console.error('Error saving rules:', error);
        res.status(500).json({ message: 'Error saving rules', error: error.message });
    }
};
