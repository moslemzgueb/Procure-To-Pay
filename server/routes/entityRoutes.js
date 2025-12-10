const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

router.get('/', authMiddleware, entityController.getEntities);
router.post('/', authMiddleware, entityController.createEntity);
router.put('/:id', authMiddleware, entityController.updateEntity);
router.delete('/:id', authMiddleware, adminAuth, entityController.deleteEntity);

module.exports = router;
