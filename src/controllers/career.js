const {
  addJob,
  getJobById,
  getJobs,
  applyJob,
  editJob,
  deleteJob,
  getAppliedJobs,
  getAppliedJobById,
  deleteApplication,
  getSlugJob,
} = require("../helpers/careerHelper");
const JobApplication = require("../models/jobApplication");
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
        applicationSource = ["INTERNAL"],
      } = req.body;

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
        applicationSource,
      });
      return successResponse(res, 200, messageHelper.JOB_CREATED, job);
    }
  }),

  getJobs: asyncHandler(async (req, res, next) => {
    {
      const { page, limit, search, source, sort } = req.query;
      const { jobs, currentPage, totalPages, totalJobs } = await getJobs(
        page,
        limit,
        search,
        source,
        sort
      );
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

  getJobBySlug: asyncHandler(async (req, res) => {
    const slug = req.params.slug;

    const job = await getSlugJob(slug);
    if (!job) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }
    return successResponse(res, 200, messageHelper.JOB_FETCHED, job);
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
    const {
      name,
      email,
      phone,
      gender,
      portfolioLink,
      coverNote,
      resume,
      source,
    } = req.body;
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
      resume,
      source,
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
            <p>Best regards,<br>Team Mentoons</p>
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
    const { search, page, limit, sortField, sortOrder } = req.query;

    const jobs = await getAppliedJobs(
      search,
      page,
      limit,
      parseInt(sortOrder) || -1,
      sortField || "createdAt",
    );

    if (!jobs || jobs.jobs.length === 0) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }

    return successResponse(res, 200, messageHelper.JOB_FETCHED, jobs);
  }),

  getAppliedJobById: asyncHandler(async (req, res, next) => {
    const job = await getAppliedJobById(req.params.id);
    console.log(job);
    if (!job) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }
    return successResponse(res, 200, messageHelper.JOB_FETCHED, job);
  }),

  deleteJobApplication: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    const job = await deleteApplication(req.params.id);

    if (!job) {
      return errorResponse(res, 404, messageHelper.JOB_NOT_FOUND);
    }

    return successResponse(
      res,
      200,
      messageHelper.JOB_APPLICATION_DELETED,
      job,
    );
  }),

  sendApplicationToAdmin: asyncHandler(async (req, res) => {
    const jobId = req.params.id;

    const application = await JobApplication.findById(jobId).populate("jobId");
    if (!application) {
      return errorResponse(res, 404, "No job application found");
    }

    const jobDetails = application.jobId;

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPER_ADMIN_EMAIL,
      subject: `🚀 New Job Application - ${jobDetails.jobTitle}`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #4F46E5; padding: 25px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .header p { color: #c7d2fe; margin: 5px 0 0; font-size: 14px; }
        .body { padding: 30px; }
        .badge { display: inline-block; background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 20px; }
        .section-title { font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 8px; }
        .info-card { background: #F9FAFB; border-radius: 8px; padding: 15px 20px; margin-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #6B7280; font-size: 14px; }
        .info-value { color: #111827; font-size: 14px; font-weight: 600; }
        .cover-note { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 0 8px 8px 0; font-size: 14px; color: #374151; line-height: 1.6; }
        .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px; }
        .btn-outline { background: white; color: #4F46E5; border: 2px solid #4F46E5; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; }
        .source-tag { background: #D1FAE5; color: #065F46; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">

        <!-- Header -->
        <div class="header">
          <h1>📬 New Application Just Dropped!</h1>
          <p>${application.name} wants to join the Mentoons team</p>
        </div>

        <!-- Body -->
        <div class="body">
          <span class="badge">🎯 ${jobDetails.jobTitle}</span>

          <!-- Applicant Info -->
          <div class="section-title">👤 Applicant Details</div>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Full Name</span>
              <span class="info-value">${application.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${application.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">${application.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Gender</span>
              <span class="info-value">${application.gender}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Applied Via</span>
              <span class="info-value"><span class="source-tag">${application.applicationSource}</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">Applied On</span>
              <span class="info-value">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          <!-- Cover Note -->
          <div class="section-title">💬 Cover Note</div>
          <div class="cover-note">
            "${application.coverNote ?? "No Cover note"}"
          </div>

          <!-- Quick Actions -->
          <div class="section-title">⚡ Quick Actions</div>
          <div style="text-align: center; margin-top: 10px;">
            <a href="${application.portfolioLink}" class="btn" target="_blank">🌐 View Portfolio</a>
            <a href="${application.resume}" class="btn btn-outline" target="_blank">📄 Download Resume</a>
          </div>

        </div>

        <!-- Footer -->
        <div class="footer">
          <p>This is an automated notification from <strong>Mentoons Hiring System</strong></p>
          <p>© ${new Date().getFullYear()} Mentoons.</p>
        </div>

      </div>
    </body>
    </html>
  `,
    };

    await sendEmail(adminMailOptions);

    return successResponse(res, 200, "Job Application send to Super Admin");
  }),
};
