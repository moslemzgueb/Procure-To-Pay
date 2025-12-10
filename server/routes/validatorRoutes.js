const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validatorController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

router.post('/', authMiddleware, validatorController.createValidator);
router.get('/', authMiddleware, validatorController.getValidators);
router.put('/:id', authMiddleware, validatorController.updateValidator);
router.delete('/:id', authMiddleware, adminAuth, validatorController.deleteValidator);

module.exports = router;
