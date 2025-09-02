const mongoose = require("mongoose");
const image =
  "https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=2048x2048&w=is&k=20&c=d1b4VHqWm1Gt8V148JOvaYSnyIvsFZEpGRCxLK-hGU4=";
const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Please add a job title"],
    },
    jobDescription: {
      type: String,
      required: [true, "Please add a job description"],
    },
    skillsRequired: {
      type: [String],
      required: [true, "Please add skills required"],
    },
    location: {
      type: String,
      default: "On-site",
    },
    jobType: {
      type: String,
      enum: ["FULLTIME", "PARTTIME", "CONTRACT", "INTERNSHIP"],
      default: "FULLTIME",
    },
    thumbnail: {
      type: String,
      default: image,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed", "pause"],
      default: "open",
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    whatWeOffer: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
