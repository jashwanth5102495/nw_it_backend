const express = require('express');
const Project = require('../models/Project');
const auth = require('./auth');
const { authenticateToken } = auth;
const router = express.Router();

// GET /api/projects - Get all projects (public for project tracking)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ created_at: -1 });
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// GET /api/projects/stats - Get project statistics (public for project tracking)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Project.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
});

// GET /api/projects/:id - Get project by ID (public for project tracking)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// POST /api/projects - Create new project (protected - admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validate required fields
    if (!projectData.project_id || !projectData.title || !projectData.client_name) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, title and client name are required'
      });
    }

    const project = new Project(projectData);
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// PUT /api/projects/:id - Update project (protected - admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// DELETE /api/projects/:id - Delete project (protected - admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// GET /api/projects/track/:project_id - Get project by project_id for tracking (public)
router.get('/track/:project_id', async (req, res) => {
  try {
    const project = await Project.findOne({ project_id: req.params.project_id.toUpperCase() });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found with this Project ID'
      });
    }
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project by project_id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

module.exports = router;