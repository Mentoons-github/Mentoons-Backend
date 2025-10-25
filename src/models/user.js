const { Schema } = require("mongoose");
const mongoose = require("mongoose");

//Remove phone number from the user schema because its clerk pro feature.
const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["ADMIN", "SUPER-ADMIN", "USER", "EMPLOYEE"],
      required: true,
      default: "USER",
    },
    socketIds: {
      type: [String],
      default: [],
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    picture: {
      type: String,
      required: false,
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
      required: false,
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
    subscriptionLimits: {
      freeTrialEndDate: {
        type: Date,
        default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      comicsReadThisMonth: {
        type: Number,
        default: 0,
      },
      monthlyReset: {
        type: Date,
        default: Date.now,
      },
      audioComicsListenedThisMonth: {
        type: Number,
        default: 0,
      },
      freeFollowerCount: { type: Number, default: 0 },
      freeFollowingCount: { type: Number, default: 0 },
    },
    accessed: {
      comics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }],
      audioComics: [
        { type: mongoose.Schema.Types.ObjectId, ref: "AudioComic" },
      ],
      podcasts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Podcast" }],
    },
    lastReset: { type: Date, default: Date.now },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    activeSession: {
      type: Date,
      required: true,
      default: Date.now,
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
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-update subscription status middleware
// This runs before any find query
UserSchema.pre("find", async function () {
  const now = new Date();

  // First update any expired subscriptions in the database
  await mongoose.model("User").updateMany(
    {
      "subscription.validUntil": { $lt: now },
      "subscription.status": "active",
    },
    {
      $set: {
        "subscription.status": "cancelled",
        "subscription.plan": "free",
      },
    }
  );
});

// Also run before findOne, findById, etc.
UserSchema.pre("findOne", async function () {
  const now = new Date();

  await mongoose.model("User").updateMany(
    {
      "subscription.validUntil": { $lt: now },
      "subscription.status": "active",
    },
    {
      $set: {
        "subscription.status": "cancelled",
        "subscription.plan": "free",
      },
    }
  );
});

// Pre-save hook to ensure subscription status is correct before saving
UserSchema.pre("save", function (next) {
  const now = new Date();

  if (
    now > this.subscription.validUntil &&
    this.subscription.status === "active"
  ) {
    this.subscription.status = "cancelled";
    this.subscription.plan = "free";
  }

  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
