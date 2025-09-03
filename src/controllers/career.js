const {
  addJob,
  getJobById,
  getJobs,
  applyJob,
  editJob,
  deleteJob,
  getAppliedJobs,
  getAppliedJobById,
} = require("../helpers/careerHelper");
const { sendEmail } = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  addJob: asyncHandler(async (req, res, next) => {
    {
      const {
        jobTitle,
        jobDescription,
        skillsRequired,
        location,
        jobType,
        thumbnail,
        responsibilities,
        requirements,
        whatWeOffer,
      } = req.body;
      console.log("data from :", req.body);
      if (!jobTitle || !jobDescription || !skillsRequired || !thumbnail) {
        console.log(req.body);
        return errorResponse(res, 400, messageHelper.BAD_REQUEST);
      }
      const job = await addJob({
        jobTitle,
        jobDescription,
        skillsRequired,
        location,
        jobType,
        thumbnail,
        responsibilities: responsibilities || [],
        requirements: requirements || [],
        whatWeOffer: whatWeOffer || [],
      });
      return successResponse(res, 200, messageHelper.JOB_CREATED, job);
    }
  }),

  getJobs: asyncHandler(async (req, res, next) => {
    {
      const { page, limit, search } = req.query;

      console.log("reached get jobs controller", page, limit, search);

      const { jobs, currentPage, totalPages, totalJobs } = await getJobs(
        page,
        limit,
        search
      );

      console.log("jobs got :", jobs.length);
      if (!jobs) {
        return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
      }
      return successResponse(res, 200, messageHelper.JOB_FETCHED, {
        jobs,
        currentPage,
        totalPages,
        totalJobs,
      });
    }
  }),

  getJobById: asyncHandler(async (req, res, next) => {
    {
      const job = await getJobById(req.params.id);
      if (!job) {
        return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
      }
      return successResponse(res, 200, messageHelper.JOB_FETCHED, job);
    }
  }),

  editJob: asyncHandler(async (req, res, next) => {
    {
      const {
        jobTitle,
        jobDescription,
        skillsRequired,
        location,
        jobType,
        thumbnail,
        responsibilities,
        requirements,
        whatWeOffer,
      } = req.body;
      const id = req.params.id;
      if (
        !jobTitle ||
        !jobDescription ||
        !skillsRequired ||
        !location ||
        !jobType ||
        !thumbnail ||
        !id
      ) {
        return errorResponse(res, 400, messageHelper.BAD_REQUEST);
      }
      const job = await editJob({
        _id: id,
        jobTitle,
        jobDescription,
        skillsRequired,
        location,
        jobType,
        thumbnail,
        responsibilities: responsibilities || [],
        requirements: requirements || [],
        whatWeOffer: whatWeOffer || [],
      });
      if (!job) {
        return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
      }
      return successResponse(res, 200, messageHelper.JOB_UPDATED, job);
    }
  }),

  deleteJob: asyncHandler(async (req, res, next) => {
    const job = await deleteJob(req.params.id);
    if (!job) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }
    return successResponse(res, 200, messageHelper.JOB_DELETED, job);
  }),

  applyJob: asyncHandler(async (req, res, next) => {
    const { name, email, phone, gender, portfolioLink, coverNote, resume } =
      req.body;
    const jobId = req.params.id;

    if (
      !jobId ||
      !name ||
      !email ||
      !phone ||
      !gender ||
      !portfolioLink ||
      !coverNote ||
      !resume
    ) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }

    const jobTitle = await getJobById(jobId);

    const job = await applyJob(
      jobId,
      name,
      email,
      phone,
      gender,
      portfolioLink,
      coverNote,
      resume
    );

    if (!job) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank You for Your Application!",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
          .header { background-color: #4a90e2; padding: 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; line-height: 1.6; color: #333333; }
          .content h3 { color: #4a90e2; }
          .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666666; }
          .button { display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #4a90e2; color: #ffffff; text-decoration: none; border-radius: 5px; }
          @media only screen and (max-width: 600px) {
            .container { width: 100%; margin: 10px; }
            .header h1 { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You, ${name}!</h1>
          </div>
          <div class="content">
            <h3>Your Application Has Been Received</h3>
            <p>Thank you for applying for the ${
              jobTitle.jobTitle
            } position at Mentoons. We appreciate your interest and the time you’ve taken to submit your application.</p>
            <p>Our team is currently reviewing your application. If your qualifications align with our needs, we’ll reach out to schedule the next steps.</p>
            <p>In the meantime, feel free to explore our website to learn more about our mission and values.</p>
            <a href="${portfolioLink}" class="button" style="color: #ffffff;">Visit Your Portfolio</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>Mentoons</p>
            <p>&copy; ${new Date().getFullYear()} Mentoons. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await sendEmail(mailOptions);

    return successResponse(res, 200, messageHelper.JOB_APPLIED, job);
  }),

  getAppliedJobs: asyncHandler(async (req, res, next) => {
    const { search, page, limit } = req.query;
    const jobs = await getAppliedJobs(search, page, limit);
    if (!jobs) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }
    return successResponse(res, 200, messageHelper.JOB_FETCHED, jobs);
  }),

  getAppliedJobById: asyncHandler(async (req, res, next) => {
    const job = await getAppliedJobById(req.params.id);
    if (!job) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }
    return successResponse(res, 200, messageHelper.JOB_FETCHED, job);
  }),
};
