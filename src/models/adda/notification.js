const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "message",
        "alert",
        "reminder",
        "friend_request_accepted",
        "friend_request_rejected",
        "like",
        "comment",
        "share",
        "friend_request",
        "mention",
        "follow",
        "tagged_in_photo",
        "post_update",
        "group_invite",
        "event_invite",
        "birthday",
        "new_follower",
        "story_viewed",
        "post_reported",
        "post_approved",
        "post_rejected",
        "system_update",
        "promotion",
        "privacy_update",
        "content_approval",
        "content_rejected",
      ],
    },
    message: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      required: false,
    },
    referenceModel: {
      type: String,
      required: false,
      enum: ["User", "Post", "FriendRequest", "Comment", "Meme"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
