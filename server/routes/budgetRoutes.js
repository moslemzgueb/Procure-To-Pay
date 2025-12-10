const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

router.post('/', authMiddleware, budgetController.createBudget);
router.put('/:id', authMiddleware, budgetController.updateBudget);
router.post('/:id/submit', authMiddleware, budgetController.submitBudget);
router.get('/', authMiddleware, budgetController.getBudgets);
router.get('/:id', authMiddleware, budgetController.getBudgetDetails);
router.delete('/:id', authMiddleware, adminAuth, budgetController.deleteBudget);

module.exports = router;
