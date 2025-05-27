const mongoose = require("mongoose");

//Remove phone number from the user schema because its clerk pro feature.
const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["ADMIN", "SUPER-ADMIN", "USER"],
      required: true,
      default: "USER",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    picture: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    dateOfBirth: {
      type: Date,
      default: "",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        role: {
          type: String,
          enum: ["member", "admin", "moderator"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    interests: [String],
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      messagePermission: {
        type: String,
        enum: ["everyone", "friends", "none"],
        default: "everyone",
      },
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ["like", "comment", "follow", "message", "friendRequest"],
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subscription: {
      plan: {
        type: String,
        enum: ["prime", "platinum", "free"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "cancelled"],
        default: "active",
      },
      startDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
      validUntil: {
        type: Date,
        required: true,
        default: function () {
          return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        },
      },
    },
    activeSession: {
      type: Date,
      required: true,
      default: Date,
    },
    userActivityPerDay: {
      type: Number,
      default: 0,
    },
    assignedCalls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "requestCall",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
