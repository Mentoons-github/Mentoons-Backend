const Feedback = require('../models/EvaluationForm');
const mongoose = require('mongoose');

module.exports = {
    addFeedbackToDb: async(data) => {
        try {
            const feedback = await Feedback.create(data);
            return feedback;
        } catch(error) {
            throw new Error(error.message);
        }
    },
    
    getAllFeedbacksFromDb: async(search = '', sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10) => {
        try {
            const skip = (page - 1) * limit;
            const searchRegex = new RegExp(search, 'i');
            
            const feedbacks = await Feedback.aggregate([
                {
                    $match: {
                        $or: [
                            { childName: { $regex: searchRegex } },
                            { 'parentNames.mother': { $regex: searchRegex } },
                            { 'parentNames.father': { $regex: searchRegex } },
                            { 'parentNames.carer': { $regex: searchRegex } }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        childName: 1,
                        childAge: 1,
                        parentNames: 1,
                        easeOfUseRating: 1,
                        learnings: 1,
                        favoriteFeature: 1,
                        issues: 1,
                        monitoringEaseRating: 1,
                        wouldRecommend: 1,
                        recommendationReason: 1,
                        overallExperience: 1,
                        createdAt: 1
                    }
                },
                { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: Number(limit) }
            ]);

            const totalFeedbacks = await Feedback.countDocuments({
                $or: [
                    { childName: { $regex: searchRegex } },
                    { 'parentNames.mother': { $regex: searchRegex } },
                    { 'parentNames.father': { $regex: searchRegex } },
                    { 'parentNames.carer': { $regex: searchRegex } }
                ]
            });

            return {
                feedbacks,
                currentPage: page,
                totalPages: Math.ceil(totalFeedbacks / limit),
                totalFeedbacks
            };
        } catch(error) {
            throw new Error(error.message);
        }
    },
    updateFeedbackInDb: async(id,data) => {
        try{
            const feedbackObject = await Feedback.findById(id);
            if(!feedbackObject){
                throw new Error("Feedback not found");
            }
            const feedback = await Feedback.findByIdAndUpdate(id,data);
            return feedback;
        }catch(error){
            console.log(error);
            throw new Error(error.message);
        }
    }
}