const { addFeedbackToDb, getAllFeedbacksFromDb, updateFeedbackInDb } = require('../helpers/EvaluationFormHelper');
const Feedback = require('../models/EvaluationForm');
const asyncHandler = require('../utils/asyncHandler');
const { BAD_REQUEST } = require('../utils/messageHelper');
const { errorResponse, successResponse } = require('../utils/responseHelper');

module.exports = {
    createFeedback:asyncHandler(async(req,res)=>{
        const {
            childName, childAge, parentNames, easeOfUseRating, learnings,
            overallExperience, monitoringEaseRating, wouldRecommend,
            recommendationReason, favoriteFeature, issues
        } = req.body;
        
        if(!childName || !childAge || 
           !parentNames || !parentNames.mother || !parentNames.father || !parentNames.carer ||
           !easeOfUseRating || !learnings || !overallExperience || 
           !monitoringEaseRating || typeof wouldRecommend !== 'boolean' || 
           !recommendationReason || !favoriteFeature || !issues){
            return errorResponse(res, 400, BAD_REQUEST);
        }

        const feedback = await addFeedbackToDb(req.body);
        
        if(!feedback){
            console.log('Failed to add feedback to DB');
            return errorResponse(res, 400, BAD_REQUEST);
        }
        return successResponse(res,201,"Feedback added successfully",feedback);
    }),
    getAllFeedbacks:asyncHandler(async(req,res)=>{
      const feedbacks = await getAllFeedbacksFromDb();
      if(!feedbacks){
        return errorResponse(res,400,BAD_REQUEST);
      }
      return successResponse(res,200,"Feedbacks fetched successfully",feedbacks);
    }),
    editFeedback:asyncHandler(async(req,res)=>{
      const {id} = req.params;
      const feedback = await updateFeedbackInDb(id,req.body);
      if(!feedback){
        return errorResponse(res,400,BAD_REQUEST);
      }
      return successResponse(res,200,"Feedback updated successfully",feedback);
    })  
}
