const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
    try {
        const { description, generationType } = req.body;

        if (!description || !generationType) {
            return res.status(400).json({
                success: false,
                message: 'Description and generation type are required'
            });
        }

        console.log('Starting code generation with:', { description, generationType });

        let options = {
            mode: 'json',
            pythonPath: process.env.PYTHON_PATH || 'python3',
            scriptPath: path.join(__dirname, '../services'),
            args: [
                JSON.stringify({
                    description,
                    type: generationType
                })
            ]
        };

        try {
            const results = await PythonShell.run('grok_service.py', options);
            
            if (!results || !results.length) {
                throw new Error('No response from code generation service');
            }

            const result = results[0];
            
            if (!result) {
                throw new Error('Invalid response format from code generation service');
            }

            if (result.success && result.code) {
                console.log('Code generated successfully');
                return res.json({
                    success: true,
                    code: result.code
                });
            }
            
            throw new Error(result.error || 'Failed to generate code');

        } catch (pythonError) {
            console.error('Python script error:', pythonError);
            return res.status(500).json({
                success: false,
                message: 'Error generating code',
                error: pythonError.message
            });
        }
    } catch (error) {
        console.error('Route error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router; 