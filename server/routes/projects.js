const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Get all projects for user
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id });
        res.json({
            success: true,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Save a project
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, code, type } = req.body;

        const project = await Project.create({
            title,
            description,
            code,
            type,
            user: req.user._id
        });

        // Add project to user's projects array
        await req.user.projects.push(project._id);
        await req.user.save();

        res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a project
router.delete('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user owns the project
        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await project.remove();
        res.json({
            success: true,
            message: 'Project removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 