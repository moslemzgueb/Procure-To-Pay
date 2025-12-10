const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, vendorController.getVendors);
router.post('/', authMiddleware, vendorController.createVendor);
router.put('/:id', authMiddleware, vendorController.updateVendor);

module.exports = router;
