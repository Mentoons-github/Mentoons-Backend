const { saveQuiztoDB } = require("../helpers/quizHelper");
const { off } = require("../models/email");
const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
    createQuiz:asyncHandler(async(req,res,next)=>{
        const {quizCategory,quizDifficulty,subCategory,questions} = req.body

        if(!quizCategory && !quizDifficulty && !subCategory && !questions){
            return errorResponse(res,404,messageHelper.BAD_REQUEST)
        }
        for (const question of questions) {
            if (!question.questionBg || !question.question) {
                return errorResponse(res, 400, 'Each question must have a background and a text.');
            }
            const imageCount = question.additionalDetails.filter(a => a.image).length;
            const textCount = question.additionalDetails.length;

            if (imageCount > 5) {
                return errorResponse(res, 400, 'A question can have a maximum of 5 images.');
            }

            if (textCount > 5) {
                return errorResponse(res, 400, 'A question can have a maximum of 5 text entries.');
            }
        }
   
        const data = await saveQuiztoDB( 
            quizCategory,
            quizDifficulty,
            subCategory,
            questions)
        if(!data){
            return errorResponse(res,404,messageHelper.BAD_REQUEST)
        }
        successResponse(res,200,messageHelper.QUIZ_CREATED,data)
    })
}