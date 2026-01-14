const mongoose = require("mongoose");

const ageGroupSchema = new mongoose.Schema({
  ageRange: { type: String, required: true },
  image: { type: String, required: true },
  serviceOverview: { type: String, required: true },
  benefits: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
});

const individualWorkshopSchema = new mongoose.Schema({
  workshopName: { type: String, required: true },
  overview: { type: String, required: true },
  whyChooseUs: [
    {
      heading: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  ageGroups: [ageGroupSchema],
});

const workshopSchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    workshops: [individualWorkshopSchema],
  },
  { timestamps: true }
);

const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;
