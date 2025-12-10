const { Validator, User } = require('../models');
const bcrypt = require('bcryptjs');

exports.createValidator = async (req, res) => {
    try {
        const { name, email, address, phone, department, level, role } = req.body;

        // 1. Create User account for the validator
        // Default password: 'password123' (In production, send email invite)
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Check if user exists
        let user = await User.findOne({ where: { username: email } });
        if (!user) {
            user = await User.create({
                username: email, // Use email as username
                password: hashedPassword,
                role: role || 'approver'
            });
        } else {
            // If user exists, ensure they have approver role? 
            // For now, just link them.
        }

        // 2. Create Validator profile linked to User
        const validator = await Validator.create({
            name,
            email,
            address,
            phone,
            department,
            level: level || 'Level 1',
            isActive: true,
            user_id: user.id
        });

        // Return validator with login credentials info
        res.status(201).json({
            ...validator.toJSON(),
            loginCredentials: {
                username: email,
                password: 'password123',
                message: 'User account created. Please share these credentials with the validator.'
            }
        });
    } catch (error) {
        console.error('Error creating validator:', error);
        res.status(500).json({ message: 'Error creating validator', error: error.message });
    }
};

exports.getValidators = async (req, res) => {
    try {
        const validators = await Validator.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });
        res.json(validators);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching validators', error: error.message });
    }
};

exports.updateValidator = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, phone, department, level, isActive } = req.body;

        const validator = await Validator.findByPk(id);
        if (!validator) {
            return res.status(404).json({ message: 'Validator not found' });
        }

        await validator.update({ name, email, address, phone, department, level, isActive });

        // Also update User email/username if changed? 
        // For simplicity, keeping them separate for now or assuming email doesn't change often.

        res.json(validator);
    } catch (error) {
        res.status(500).json({ message: 'Error updating validator', error: error.message });
    }
};

exports.deleteValidator = async (req, res) => {
    try {
        const { id } = req.params;

        const validator = await Validator.findByPk(id);
        if (!validator) {
            return res.status(404).json({ message: 'Validator not found' });
        }

        // Soft delete
        await validator.update({ isActive: false });

        // Deactivate User?
        if (validator.user_id) {
            // await User.destroy({ where: { id: validator.user_id } }); // Or set inactive
        }

        res.json({ message: 'Validator deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting validator', error: error.message });
    }
};
