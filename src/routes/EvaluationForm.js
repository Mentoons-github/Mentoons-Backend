const express = require('express');
const router = express.Router();
const {createFeedback, getAllFeedbacks, editFeedback} = require('../controllers/Evaluation');
// 
router.route('/').post(createFeedback).get(getAllFeedbacks);
router.route('/:id').put(editFeedback);
module.exports = router;