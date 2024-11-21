const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs').promises;

router.post('/', async (req, res) => {
    try {
        const { description, generationType, filename } = req.body;

        // Check for required fields
        if (!description || !generationType) {
            process.stderr.write('Error: Missing required fields\n');
            return res.status(400).json({
                success: false,
                message: 'Description and generation type are required'
            });
        }

        // Check Python environment
        const pythonPath = process.env.PYTHON_PATH || (
            process.platform === 'win32' 
                ? 'venv\\Scripts\\python.exe'
                : './venv/bin/python3'
        );

        try {
            await fs.access(pythonPath);
        } catch (error) {
            process.stderr.write(`Error: Python environment not found at ${pythonPath}\n`);
            process.stderr.write('Please set up your Python virtual environment first\n');
            return res.status(500).json({
                success: false,
                message: 'Python environment not found'
            });
        }

        // Check API key
        if (!process.env.GROK_API_KEY) {
            process.stderr.write('Error: GROK_API_KEY not found in environment variables\n');
            return res.status(500).json({
                success: false,
                message: 'API key not configured'
            });
        }

        let options = {
            mode: 'json',
            pythonPath,
            scriptPath: path.join(__dirname, '../services'),
            args: [
                JSON.stringify({
                    description,
                    type: generationType,
                    api_key: process.env.GROK_API_KEY,
                    filename: filename || ''
                })
            ]
        };

        // Log execution details to Cursor AI terminal
        process.stderr.write('\nExecuting code generation:\n');
        process.stderr.write(`Python Path: ${options.pythonPath}\n`);
        process.stderr.write(`Script Path: ${options.scriptPath}\n`);
        process.stderr.write(`Generation Type: ${generationType}\n`);
        process.stderr.write(`Filename: ${filename || 'not specified'}\n\n`);

        try {
            const results = await PythonShell.run('grok_service.py', options);
            
            if (!results || !results.length) {
                process.stderr.write('Error: No response from code generation service\n');
                throw new Error('No response from code generation service');
            }

            const result = results[0];
            
            if (!result) {
                process.stderr.write('Error: Invalid response format from code generation service\n');
                throw new Error('Invalid response format from code generation service');
            }

            if (result.success && result.code) {
                process.stderr.write('Code generation successful\n');
                return res.json({
                    success: true,
                    code: result.code,
                    language: result.language || 'plaintext'
                });
            }
            
            // Log detailed error information
            process.stderr.write(`Generation failed: ${result.error}\n`);
            if (result.details) {
                process.stderr.write('Error details:\n');
                process.stderr.write(JSON.stringify(result.details, null, 2) + '\n');
            }

            throw new Error(result.error || 'Failed to generate code');

        } catch (pythonError) {
            // Log Python execution errors
            process.stderr.write('Python execution error:\n');
            process.stderr.write(pythonError.stack + '\n');
            
            if (pythonError.traceback) {
                process.stderr.write('Python Traceback:\n');
                process.stderr.write(pythonError.traceback + '\n');
            }

            throw pythonError;
        }
    } catch (error) {
        // Log any other errors
        process.stderr.write(`\nError in code generation route:\n${error.stack}\n`);
        
        return res.status(500).json({
            success: false,
            message: 'Error generating code',
            error: error.message
        });
    }
});

module.exports = router; 