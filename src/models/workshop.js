const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    workshopName: {
      type: String,
      required: true,
    },
    whyChooseUs: [
      {
        heading: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    ageGroups: [
      {
        ageRange: { type: String, required: true },
        image: { type: String, required: true },
        serviceOverview: {
          type: String,
          required: true,
        },
        benefits: [
          {
            title: { type: String, required: true },
            description: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;
