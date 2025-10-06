const mongoose = require("mongoose");

const platformDomains = {
  "Google Meet": "meet.google.com",
  Zoom: "zoom.us",
  "Microsoft Teams": "teams.microsoft.com",
  "Cisco Webex": "webex.com",
  Discord: "discord.gg",
};

const MeetupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, "Date and time are required"],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "Date must be today or in the future",
      },
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      enum: {
        values: [
          "1/2 hour",
          "1 hour",
          "2 hours",
          "3 hours",
          "4 hours",
          "5 hours",
        ],
        message: "Invalid duration",
      },
    },
    maxCapacity: {
      type: Number,
      required: [true, "Max capacity is required"],
      min: [1, "Max capacity must be a positive number"],
      max: [10, "Max capacity cannot exceed 10"],
      validate: {
        validator: Number.isInteger,
        message: "Max capacity must be an integer",
      },
    },
    platform: {
      type: String,
      required: [
        function () {
          return this.isOnline;
        },
        "Platform is required for online meetups",
      ],
      enum: {
        values: [
          "Google Meet",
          "Zoom",
          "Microsoft Teams",
          "Cisco Webex",
          "Discord",
        ],
        message: "Invalid platform",
      },
    },
    meetingLink: {
      type: String,
      required: [
        function () {
          return this.isOnline;
        },
        "Meeting link is required for online meetups",
      ],
      validate: {
        validator: function (value) {
          if (!this.isOnline || !this.platform) return true;
          return value.includes(platformDomains[this.platform]);
        },
        message: "Invalid platform URL",
      },
    },
    place: {
      type: String,
      required: [
        function () {
          return !this.isOnline;
        },
        "Place is required for offline meetups",
      ],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    detailedDescription: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
    },
    speakerName: {
      type: String,
      required: [true, "Speaker name is required"],
      trim: true,
    },
    speakerImage: {
      type: String,
      default: null,
    },
    topics: {
      type: [String],
      required: [true, "Topics are required"],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one topic is required",
      },
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one tag is required",
      },
    },
    isOnline: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

MeetupSchema.pre("save", function (next) {
  if (typeof this.topics === "string") {
    this.topics = this.topics
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0);
  }
  if (typeof this.tags === "string") {
    this.tags = this.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
  next();
});

MeetupSchema.pre("save", function (next) {
  if (this.dateTime) {
    if (!(this.dateTime instanceof Date) || isNaN(this.dateTime.getTime())) {
      return next(new Error("Invalid date and time"));
    }
  }
  next();
});

module.exports = mongoose.model("Meetup", MeetupSchema);
