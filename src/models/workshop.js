const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    age: {
      type: String,
      required: [true, "Age is required"],
    },
    guardianName: {
      type: String,
      required: [true, "Guardian's name is required"],
    },
    guardianContact: {
      type: String,
      required: [true, "Guardian's phone no is required"],
    },
    guardianEmail: {
      type: String,
      required: [true, "Guardian's email is required!"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    mobileUsageLevel: {
      type: String,
      // time < 2 = (Low)
      // time >= 2 && time <=4 (Medium)
      // time > 4
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: [true, "Mobile usage level is required"],
    },
    mobileUsageHours: {
      type: Number,
      required: [true, "Mobile usage hours is required"],
    },
    primaryActivityOnMobile: {
      type: String,
      enum: ["WATCHING_VIDEOS", "PLAYING_GAMES", "CHATTING", "OTHERS"],
      required: [true, "Primary activity user performs on mobile is required"],
    },
    isTimeRestricted: {
      type: Boolean,
      required: [true, "If user is being restricted to time limit is required"],
    },
    restrictionType: {
      type: String,
      enum: ["TIME_LIMIT", "SPECIFIC TIME", "TYPE_OF_ACTIVITY", "OTHERS"],
    },
    concernsUser: {
      type: String,
      enum: [
        "EXCESSIVE_SCREEN_TIME",
        "IMPACT_ON_SOCIAL_SKILLS",
        "LACK_OF_PHYSICAL_ACTIVITY",
        "OTHERS",
      ],
      required: [true, "Concern about user is required"],
    },
    behavioralChanges: {
      type: String,
      enum: [
        "CONCENTRATION",
        "IRRITABILITY",
        "SLEEPING",
        "LESS_INTEREST",
        "OTHERS",
      ],
      required: [true, "Behavioral changes of user is required"],
    },
    physicalActivityHours: {
      type: Number,
      required: [true, "Physical Activity time is required!"],
    },
    physicalActivityFrequency: {
      type: String,
      // time < 1H = (Low)
      // time > 1H && time<= 2H = (Medium)
      // time > 2H = (High)
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: [true, "Physical Activity time is required!"],
    },
    confessionFrequency: {
      type: String,
      enum: ["FREQUENTLY", "OCCASIONALLY", "RARELY"],
      required: [true, "confession frequency with user is required!"],
    },
    message: {
      type: String,
    },
    appliedWorkshop: {
      type: String,
      enum: [
        "BUDDY CAMP",
        "TEEN CAMP",
        "FAMILY CAMP",
        "INSTANT BUDDY CAMP",
        "INSTANT TEEN CAMP",
      ],
      required: [true, "Applied workshop is required"],
    },
  },
  { timestamps: true }
);

const WorkshopData = mongoose.model("WorkshopData", workshopSchema);

module.exports = WorkshopData;
