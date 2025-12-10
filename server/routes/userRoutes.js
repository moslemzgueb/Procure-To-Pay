const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

router.get('/', authMiddleware, userController.getUsers);
router.delete('/:id', authMiddleware, adminAuth, userController.deleteUser);

module.exports = router;
