const { Combo } = require("../models/combo");
const asyncHandler = require("../utils/asyncHandler");

const getCombos = asyncHandler(async (req, res) => {
  const combos = await Combo.find({}).lean();

  res.status(200).json({ data: combos });
});

const getComboByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const combo = await Combo.findOne({ "details.comboKey": key }).lean();
  if (!combo) {
    return res.status(404).json({ message: "Combo not found" });
  }

  res.status(200).json({ data: combo });
});

const upsertCombo = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { key } = req.params;

  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin can manage combos" });
  }

  const {
    title,
    description,
    tag,
    discountPercent,
    bundleItems,
    productImages,
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
    return res
      .status(400)
      .json({ message: "bundleItems must be a non-empty array" });
  }

  const invalidItem = bundleItems.find(
    (item) => !item.title || typeof item.price !== "number" || item.price < 0,
  );
  if (invalidItem) {
    return res
      .status(400)
      .json({ message: "Each bundle item needs a title and a valid price" });
  }

  const discount = discountPercent ?? 50;
  if (typeof discount !== "number" || discount < 0 || discount > 90) {
    return res
      .status(400)
      .json({ message: "discountPercent must be between 0 and 90" });
  }

  let combo = await Combo.findOne({ "details.comboKey": key });
  const isNew = !combo;
  if (isNew) combo = new Combo({ details: { comboKey: key } });

  combo.title = title;
  combo.description = description;
  combo.productImages = productImages || [];
  combo.set("details.tag", tag);
  combo.set("details.discountPercent", discount);
  combo.set("details.bundleItems", bundleItems);

  try {
    await combo.save();
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    throw error;
  }

  res.status(isNew ? 201 : 200).json({
    message: isNew
      ? "Combo created successfully"
      : "Combo updated successfully",
    data: combo,
  });
});

module.exports = {
  getCombos,
  getComboByKey,
  upsertCombo,
};
