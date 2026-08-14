const { Schema, model } = require("mongoose");

const candidateEmailSchema = new Schema(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: { type: String, trim: true },
    body: { type: String, required: true },
    linkUrl: { type: String, trim: true },
    attachments: [
      {
        url: String,
        originalName: String,
        mimetype: String,
      },
    ],
    sentBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
      index: true,
    },
  },
  { timestamps: true },
);

candidateEmailSchema.index({ email: 1, createdAt: -1 });

const CandidateEmailModel = model("CandidateEmail", candidateEmailSchema);

module.exports = { CandidateEmailModel };
