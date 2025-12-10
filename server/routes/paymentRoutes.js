const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/', authMiddleware, paymentController.getPayments);
router.post('/', authMiddleware, upload.single('invoice'), paymentController.createPayment);
router.post('/:id/submit', authMiddleware, paymentController.submitPayment);
router.post('/batch', authMiddleware, upload.array('invoices', 10), paymentController.createBatchPayments);
// Get single payment
router.get('/:id', authMiddleware, paymentController.getPaymentById);
router.delete('/:id', authMiddleware, paymentController.deletePayment);

module.exports = router;
