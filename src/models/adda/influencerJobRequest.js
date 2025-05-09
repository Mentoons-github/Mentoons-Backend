const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const influencerJobRequestSchema = new Schema(
  {
    // Personal Information
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },

    // Social Media Profiles
    instagram: {
      handle: { type: String, required: true },
      followers: { type: Number, required: true },
    },
    youtube: {
      channel: { type: String },
      subscribers: { type: Number },
    },
    twitter: {
      handle: { type: String },
      followers: { type: Number },
    },
    tiktok: {
      handle: { type: String },
      followers: { type: Number },
    },
    linkedin: {
      profile: { type: String },
      connections: { type: Number },
    },

    // Experience and Motivation
    niche: {
      type: String,
      required: true,
      enum: [
        "education",
        "parenting",
        "children_entertainment",
        "family_lifestyle",
        "mental_health",
        "other",
      ],
    },
    experience: { type: String, required: true },
    motivation: { type: String, required: true },
    mentorshipInterest: { type: Boolean, default: false },
    agreeTerms: { type: Boolean, required: true },

    // Application Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Additional fields for admin use
    notes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InfluencerJobRequest",
  influencerJobRequestSchema
);
