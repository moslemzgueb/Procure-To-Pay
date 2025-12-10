// Middleware to verify system_admin role
const adminAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'system_admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

module.exports = adminAuth;
