const express = require('express');
const router = express.Router();
const { 
  createShare, 
  deleteShare, 
  getSharesByPost, 
  getSharesByUser,
  getShareStats
} = require('../controllers/share.controller');
const { conditionalAuth } = require('../middlewares/auth.middleware');

// Public routes
router.get('/posts/:postId/shares', getSharesByPost);
router.get('/posts/:postId/shares/stats', getShareStats);
router.get('/users/:userId/shares', getSharesByUser);

// Protected routes
router.post('/shares', conditionalAuth, createShare);
router.delete('/shares/:shareId', conditionalAuth, deleteShare);

module.exports = router; 