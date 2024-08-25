const express = require('express');
const { processTask } = require('../controllers/taskController');

const router = express.Router();

router.post('/task', processTask);

module.exports = router;
