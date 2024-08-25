const express = require('express');
const taskRoute = require('./routes/taskRoute');
const cluster = require('cluster');
const os = require('os');

const app = express();

app.use(express.json());
app.use('/api/v1', taskRoute);

const port = process.env.PORT || 7000;

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
