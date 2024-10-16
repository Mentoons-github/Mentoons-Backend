const { addJob, getJobById, getJobs, applyJob, editJob, deleteJob, getAppliedJobs } = require('../helpers/careerHelper');
const asyncHandler = require('../utils/asyncHandler');
const messageHelper = require('../utils/messageHelper');
const { errorResponse, successResponse } = require('../utils/responseHelper');


module.exports = {
    addJob: asyncHandler(async (req, res, next) => {{
        const {jobTitle, jobDescription, skillsRequired, location, jobType, thumbnail} = req.body;
        if(!jobTitle || !jobDescription || !skillsRequired || !thumbnail){
            console.log(req.body);
            return errorResponse(res,400, messageHelper.BAD_REQUEST);
        }
        const job = await addJob(jobTitle, jobDescription, skillsRequired, location, jobType, thumbnail);
        return successResponse(res,200, messageHelper.JOB_CREATED, job);
    }}),

    getJobs:asyncHandler(async (req, res, next) => {{
        const {page, limit, search} = req.query;
        const {jobs, currentPage, totalPages, totalJobs} = await getJobs(page, limit, search);
        if(!jobs){
           return errorResponse(res,404, messageHelper.JOB_NOT_FOUND);
        }
        return successResponse(res,200, messageHelper.JOB_FETCHED, {jobs, currentPage, totalPages, totalJobs});
    }}),

    getJobById: asyncHandler(async (req, res, next) => {{
        const job = await getJobById(req.params.id);
        if(!job){
            return errorResponse(res,404, messageHelper.JOB_NOT_FOUND);
        }
        return successResponse(res,200, messageHelper.JOB_FETCHED, job);
    }}),

    editJob: asyncHandler(async (req, res, next) => {
        const {jobTitle, jobDescription, skillsRequired, location, jobType, thumbnail} = req.body;
        const id = req.params.id;
        if(!jobTitle || !jobDescription || !skillsRequired || !location || !jobType || !thumbnail || !id){
            return errorResponse(res,400, messageHelper.BAD_REQUEST);
        }
        const job = await editJob(id, jobTitle, jobDescription, skillsRequired, location, jobType, thumbnail);
        if(!job){
            return errorResponse(res,404, messageHelper.JOB_NOT_FOUND);     
        }
        return successResponse(res,200, messageHelper.JOB_UPDATED, job);
    }),

    deleteJob: asyncHandler(async (req, res, next) => {
        const job = await deleteJob(req.params.id);
        if(!job){
            return errorResponse(res,404, messageHelper.JOB_NOT_FOUND);
        }
        return successResponse(res,200, messageHelper.JOB_DELETED, job);
    }),

    applyJob: asyncHandler(async (req, res, next) => {
        const {name, email, phone, gender, portfolioLink, coverNote, resume} = req.body;
        const jobId = req.params.id;
        if(!jobId || !name || !email || !phone || !gender || !portfolioLink || !coverNote || !resume){
            return errorResponse(res,404, messageHelper.BAD_REQUEST);
        }
        const job = await applyJob(jobId, name, email, phone, gender, portfolioLink, coverNote, resume);
        if(!job){
            return errorResponse(res,404, messageHelper.JOB_NOT_FOUND);    
        }
        return successResponse(res,200, messageHelper.JOB_APPLIED, job);
    }),

    getAppliedJobs: asyncHandler(async (req, res, next) => {
        const {search, page, limit} = req.query;
       const jobs = await getAppliedJobs(search, page, limit);
       if(!jobs){
        return errorResponse(res,404, messageHelper.JOB_NOT_FOUND);
       }
        return successResponse(res,200, messageHelper.JOB_FETCHED, jobs);
    })
    
}

