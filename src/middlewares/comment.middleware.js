const Comment = require('../models/comment');
const mongoose = require('mongoose');

/**
 * Middleware to validate comment creation and check for inappropriate content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateCommentCreation = (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    // Check if content exists
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if content exceeds maximum length
    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot exceed 1000 characters'
      });
    }

    // Check if postId is valid
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid post ID is required'
      });
    }

    // Check if parentCommentId is valid if provided
    if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parent comment ID'
      });
    }

    // Check for inappropriate language and adult content
    const inappropriateWords = [
      'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cunt', 
      'asshole', 'bastard', 'whore', 'slut', 'motherfucker',
      'cock', 'bullshit', 'damn', 'hell', 'piss', 'crap',
      // Add more inappropriate words as needed
    ];
    
    // Adult content filter words
    const adultContentWords = [
      'porn', 'xxx', 'sex', 'nude', 'naked', 'boobs', 'tits',
      'penis', 'vagina', 'masturbate', 'orgasm', 'blowjob',
      'handjob', 'anal', 'dildo', 'vibrator', 'hentai',
      'nsfw', 'onlyfans', 'escort', 'hooker', 'stripper',
      'erotic', 'fetish', 'bdsm', 'kinky', 'horny', 'cum',
      // Add more adult content words as needed
    ];

    const contentLowerCase = content.toLowerCase();
    
    // Check for inappropriate language
    const foundInappropriateWords = inappropriateWords.filter(word => 
      new RegExp(`\\b${word}\\b`).test(contentLowerCase)
    );

    if (foundInappropriateWords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment contains inappropriate language'
      });
    }
    
    // Check for adult content
    const foundAdultContentWords = adultContentWords.filter(word => 
      new RegExp(`\\b${word}\\b`).test(contentLowerCase)
    );
    
    if (foundAdultContentWords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment contains adult content which is not allowed'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Middleware to validate comment ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateCommentId = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  validateCommentCreation,
  validateCommentId
};
