const express = require('express');
const router = express.Router();
const codeRunner = require('../services/code-runner');

router.post('/', async (req, res) => {
    try {
        const { code, language, dependencies } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                error: 'Code and language are required'
            });
        }

        const output = await codeRunner.runCode(code, language, dependencies);
        
        res.json({
            success: true,
            output
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 