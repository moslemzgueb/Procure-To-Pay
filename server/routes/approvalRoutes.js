const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/approve', authMiddleware, approvalController.approve);
router.post('/reject', authMiddleware, approvalController.reject);
router.post('/request-info', authMiddleware, approvalController.requestInfo);
router.get('/history', authMiddleware, approvalController.getHistory);

router.get('/qa', authMiddleware, approvalController.getQA);
router.post('/qa', authMiddleware, approvalController.postQA);

router.get('/rules', authMiddleware, approvalController.getRules);
router.post('/rules', authMiddleware, approvalController.saveRules);

module.exports = router;
