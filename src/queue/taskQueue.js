const Queue = require('bull');
const taskQueue = new Queue('taskQueue');

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

// Rate limiter configuration for 1 task per second
const rateLimiterPerSecond = new RateLimiterMemory({
    points: 1,
    duration: 1,
    keyPrefix: 'user-per-second',
});

// Process tasks
taskQueue.process(async (job) => {
    const { userId } = job.data;

    try {
        await rateLimiterPerSecond.consume(userId);
        await task(userId);
    } catch (err) {
        // Re-add the job to the queue if rate limit exceeded
        taskQueue.add(job.data, { delay: 1000 });
    }
});

// Task function
async function task(userId) {
    const logMessage = `${userId} - task completed at - ${new Date().toISOString()}`;
    logger.info(logMessage);
    console.log(logMessage);
}

module.exports = { taskQueue };
