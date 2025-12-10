const { User, Validator } = require('../models');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role'],
            include: [{
                model: Validator,
                attributes: ['id', 'name', 'level', 'isActive'],
                required: false
            }],
            order: [['username', 'ASC']]
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting system_admin if it's the only one
        if (user.role === 'system_admin') {
            const adminCount = await User.count({ where: { role: 'system_admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({
                    message: 'Cannot delete the only system administrator'
                });
            }
        }

        // Deactivate associated validator if exists
        await Validator.update(
            { isActive: false },
            { where: { user_id: id } }
        );

        await user.destroy();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
