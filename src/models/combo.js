const mongoose = require("mongoose");

const ComboSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    mrp: { type: Number },
    price: { type: Number },
    productImages: [
      {
        imageUrl: { type: String, required: true },
      },
    ],
    details: {
      comboKey: { type: String, required: true },
      tag: { type: String },
      discountPercent: { type: Number, default: 50, min: 0, max: 90 },
      bundleItems: {
        type: [
          {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            title: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            image: { type: String, default: "" },
          },
        ],
        validate: [(v) => v.length > 0, "Combo needs at least one item"],
      },
    },
  },
  { timestamps: true },
);

ComboSchema.index({ "details.comboKey": 1 }, { unique: true });

ComboSchema.pre("validate", function (next) {
  const items = this.details?.bundleItems || [];
  const pct = this.details?.discountPercent ?? 50;
  const mrp = items.reduce((sum, i) => sum + i.price, 0);
  this.mrp = mrp;
  this.price = Math.round(mrp * (1 - pct / 100));
  next();
});

const Combo = mongoose.models.Combo || mongoose.model("Combo", ComboSchema);

module.exports = { Combo };
