const { Schema, model } = require("mongoose");

const skillRatingSchema = new Schema(
  {
    skill: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 5 },
  },
  { _id: false },
);

const educationDetailSchema = new Schema(
  {
    degree: { type: String, trim: true },
    specialization: { type: String, trim: true },
    institute: { type: String, trim: true },
    graduationYear: { type: Number },
    performance: { type: String, trim: true },
  },
  { _id: false },
);

const performanceSchema = new Schema(
  {
    tenth: { type: String, trim: true },
    twelfth: { type: String, trim: true },
    underGraduate: { type: String, trim: true },
    postGraduate: { type: String, trim: true },
  },
  { _id: false },
);

const candidateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    mobileVerified: { type: Boolean, default: false },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    maritalStatus: { type: String, trim: true },
    nationality: { type: String, trim: true },
    workAuthorization: { type: String, trim: true },
    workPermitUSA: { type: String, trim: true },

    currentLocation: { type: String, trim: true, index: true },
    preferredLocations: { type: [String], default: [] },
    homeTown: { type: String, trim: true },
    pinCode: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },

    totalExperienceYears: { type: Number, default: 0 },
    currentEmployer: { type: String, trim: true },
    currentDesignation: { type: String, trim: true },
    previousEmployers: { type: [String], default: [] },
    department: { type: String, trim: true },
    role: { type: String, trim: true },
    industry: { type: String, trim: true },
    category: { type: String, trim: true },

    keySkills: { type: [String], default: [], index: true },
    skillRatings: { type: [skillRatingSchema], default: [] },
    otherSkills: { type: String, trim: true },

    annualSalary: { type: String, trim: true },
    noticePeriod: { type: String, trim: true },
    availability: { type: String, trim: true },

    resumeTitle: { type: String, trim: true },
    resumeHeadline: { type: String, trim: true },
    summary: { type: String, trim: true },
    whyHireMe: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },

    education: {
      underGraduate: { type: educationDetailSchema },
      postGraduate: { type: educationDetailSchema },
      doctorate: { type: educationDetailSchema },
    },
    performance: { type: performanceSchema, default: {} },

    appliedForJob: { type: Schema.Types.ObjectId, ref: "Job" },
    jobTitle: { type: String, trim: true, index: true },
    applicationLink: { type: String, trim: true },
    chatLink: { type: String, trim: true },

    source: {
      type: String,
      enum: [
        "Naukri",
        "Internshala",
        "Job Posting",
        "LinkedIn",
        "Referral",
        "Direct",
        "Other",
      ],
      default: "Other",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "Inbox",
        "Shortlisted",
        "In Review",
        "Interview Scheduled",
        "Selected",
        "Rejected",
        "On Hold",
        "Hired",
      ],
      default: "Inbox",
      index: true,
    },

    emailed: { type: Boolean, default: false, index: true },
    lastEmailedAt: { type: Date },
    emailCount: { type: Number, default: 0 },

    unsubscribed: { type: Boolean, default: false, index: true },
    unsubscribedAt: { type: Date },

    receivedDate: { type: Date },
    lastActive: { type: Date },
  },
  { timestamps: true },
);

candidateSchema.index({ email: 1, appliedForJob: 1 }, { unique: true });
candidateSchema.index({ status: 1, source: 1, createdAt: -1 });

const CandidateModel = model("Candidate", candidateSchema);

module.exports = { CandidateModel };
