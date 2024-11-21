const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ProjectMonitor = require('./project-monitor');
const codeRunner = require('./services/code-runner');

const app = express();

// Initialize code runner
(async () => {
    try {
        await codeRunner.init();
    } catch (error) {
        throw new Error(`Code Runner Init Error: ${error.message}`);
    }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Connect to MongoDB
(async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected');
    } catch (error) {
        throw new Error(`MongoDB Connection Error: ${error.message}`);
    }
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/run', require('./routes/run'));

// Error handling middleware
app.use((err, req, res, next) => {
    // This will make the error appear in Cursor AI's terminal
    throw new Error(`Server Error at ${req.method} ${req.path}: ${err.message}`);
});

// Handle 404
app.use((req, res) => {
    // This will make 404 errors appear in Cursor AI's terminal
    throw new Error(`404 Not Found: ${req.method} ${req.path}`);
});

const PORT = process.env.PORT || 3000;
const projectMonitor = new ProjectMonitor(path.join(__dirname, '..'));

const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await projectMonitor.monitorProject();
    } catch (error) {
        throw new Error(`Project Monitor Error: ${error.message}`);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    throw err; // This will make it appear in Cursor AI's terminal
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    // Log the error and exit
    console.error(err);
    process.exit(1);
});

module.exports = app;
 