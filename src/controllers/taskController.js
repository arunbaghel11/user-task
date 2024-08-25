const { taskQueue } = require('../queue/taskQueue');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const winston = require('winston');
const path = require('path');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/tasks.log') })
    ]
});

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
    points: 20, // 20 tasks per minute
    duration: 60,
    keyPrefix: 'user',
});

const processTask = async (req, res) => {
    const userId = req.body.user_id;

    try {
        // Consume 1 point (task) per request
        await rateLimiter.consume(userId, 1);

        taskQueue.add({ userId });
        res.status(200).send('Task received and queued.');
    } catch (err) {
        res.status(429).send('Rate limit exceeded. Task queued for later processing.');
    }
};

module.exports = { processTask };
