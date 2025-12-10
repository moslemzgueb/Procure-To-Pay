const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/my-tasks', authMiddleware, taskController.getMyTasks);

module.exports = router;
