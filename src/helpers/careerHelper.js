const Job = require("../models/jobs");
const JobApplication = require("../models/jobApplication");
const messageHelper = require("../utils/messageHelper");
const mongoose = require("mongoose");

const addJob = async ({
  jobTitle,
  jobDescription,
  skillsRequired,
  location,
  jobType,
  thumbnail,
  responsibilities = [],
  requirements = [],
  whatWeOffer = [],
}) => {
  try {
    const job = await Job.create({
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      thumbnail,
      responsibilities,
      requirements,
      whatWeOffer,
    });
    return job;
  } catch (error) {
    throw error;
  }
};
const getJobs = async (page = 1, limit = 10, search = "") => {
  try {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;
    const searchRegex = new RegExp(search, "i");

    console.log("Fetching jobs with:", { pageNum, limitNum, skip, search });

    const jobs = await Job.aggregate([
      {
        $match: {
          $or: [
            { jobTitle: { $regex: searchRegex } },
            { jobDescription: { $regex: searchRegex } },
            { skillsRequired: { $in: [searchRegex] } },
            { location: { $regex: searchRegex } },
          ],
        },
      },
      {
        $project: {
          jobTitle: 1,
          jobDescription: 1,
          skillsRequired: 1,
          location: 1,
          jobType: 1,
          thumbnail: 1,
          applications: 1,
          status: 1,
          responsibilities: 1,
          requirements: 1,
          whatWeOffer: 1,
          createdAt: 1,
          updatedAt: 1,
          applicationCount: { $size: { $ifNull: ["$applications", []] } },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ]);

    const totalJobs = await Job.countDocuments({
      $or: [
        { jobTitle: { $regex: searchRegex } },
        { jobDescription: { $regex: searchRegex } },
        { skillsRequired: { $in: [searchRegex] } },
        { location: { $regex: searchRegex } },
      ],
    });

    console.log("Fetched jobs:", {
      jobCount: jobs.length,
      jobIds: jobs.map((job) => job._id),
      currentPage: pageNum,
      totalPages: Math.ceil(totalJobs / limitNum),
      totalJobs,
    });

    return {
      jobs,
      currentPage: pageNum,
      totalPages: Math.ceil(totalJobs / limitNum),
      totalJobs,
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

const getJobById = async (id) => {
  try {
    const job = await Job.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "jobapplications",
          localField: "applications",
          foreignField: "_id",
          as: "applicationDetails",
        },
      },
    ]);

    return job[0];
  } catch (error) {
    throw error;
  }
};

const editJob = async ({
  _id,
  jobTitle,
  jobDescription,
  skillsRequired,
  location,
  jobType,
  thumbnail,
  responsibilities = [],
  requirements = [],
  whatWeOffer = [],
}) => {
  try {
    const jobListing = await Job.findById(_id);
    if (!jobListing) {
      throw new Error(messageHelper.JOB_NOT_FOUND);
    }
    const job = await Job.findByIdAndUpdate(_id, {
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      thumbnail,
      responsibilities,
      requirements,
      whatWeOffer,
    });
    return job;
  } catch (error) {
    throw error;
  }
};

const deleteJob = async (id) => {
  try {
    const jobListing = await Job.findById(id);
    if (!jobListing) {
      throw new Error(messageHelper.JOB_NOT_FOUND);
    }
    const job = await Job.findByIdAndDelete(id);
    return job;
  } catch (error) {
    throw error;
  }
};

const applyJob = async (
  jobId,
  name,
  email,
  phone,
  gender,
  portfolioLink,
  coverNote,
  resume
) => {
  try {
    const jobListing = await Job.findById(jobId);
    if (!jobListing) {
      throw new Error(messageHelper.JOB_NOT_FOUND);
    }

    const application = await JobApplication.create({
      jobId,
      name,
      email,
      phone,
      gender,
      portfolioLink,
      coverNote,
      resume,
    });
    jobListing.applications.push(application._id);
    await jobListing.save();

    return application;
  } catch (error) {
    throw error;
  }
};

const getAppliedJobs = async (
  search = "",
  page = 1,
  limit = 10,
  sortOrder = -1,
  sortField = "createdAt"
) => {
  try {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.max(1, parseInt(limit) || 10);
    const skip = (validPage - 1) * validLimit;

    const searchRegex = new RegExp(search, "i");

    const matchStage = {
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { "jobDetails.jobTitle": { $regex: searchRegex } },
        { "jobDetails.jobDescription": { $regex: searchRegex } },
        { "jobDetails.company": { $regex: searchRegex } },
      ],
    };

    const allowedSortFields = ["createdAt", "name", "email", "jobTitle"];
    const validSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "createdAt";

    const sortStage = {};
    if (validSortField === "jobTitle") {
      sortStage["jobDetails.jobTitle"] = sortOrder;
    } else {
      sortStage[validSortField] = sortOrder;
    }

    const jobs = await JobApplication.aggregate([
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: "$jobDetails",
      },
      {
        $match: matchStage,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          gender: 1,
          portfolioLink: 1,
          coverNote: 1,
          resume: 1,
          coverLetterLink: 1,
          jobTitle: "$jobDetails.jobTitle",
          createdAt: 1,
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: validLimit },
    ]);

    const totalJobs = await JobApplication.aggregate([
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: "$jobDetails",
      },
      {
        $match: matchStage,
      },
      { $count: "total" },
    ]);

    const totalCount = totalJobs.length > 0 ? totalJobs[0].total : 0;

    return {
      jobs,
      currentPage: validPage,
      totalPages: Math.ceil(totalCount / validLimit),
      totalJobs: totalCount,
    };
  } catch (error) {
    throw new Error(`Failed to fetch applied jobs: ${error.message}`);
  }
};

const getAppliedJobById = async (id) => {
  try {
    const jobApplication = await JobApplication.findById(id);
    return jobApplication;
  } catch (error) {
    throw error;
  }
};

const deleteApplication = async (id) => {
  console.log("added changes");
  return await JobApplication.findByIdAndDelete(id);
};
module.exports = {
  addJob,
  getJobs,
  getJobById,
  applyJob,
  editJob,
  deleteJob,
  getAppliedJobs,
  getAppliedJobById,
  deleteApplication,
};
