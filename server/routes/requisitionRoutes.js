const express = require('express');
const router = express.Router();
const requisitionController = require('../controllers/requisitionController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});

const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('invoice'), requisitionController.createRequisition);
router.get('/', authMiddleware, requisitionController.getRequisitions);
router.put('/:id/status', authMiddleware, requisitionController.updateStatus);

module.exports = router;
