const MythosComment = require("../models/mythosComment");

const createMythosComment = async (req, res) => {
  const { comment, name, email } = req.body;
  try {
    const existingComment = await MythosComment.findOne({ email });
    if (!comment || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (existingComment) {
      existingComment.comment = comment;
      existingComment.name = name;
      await existingComment.save();

      return res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: existingComment,
      });
    }
    const mythosComment = new MythosComment({ comment, name, email });
    await mythosComment.save();
    res.status(201).json({
      success: true,
      data: mythosComment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllMythosComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const sort = {};
    sort[sortBy] = sortOrder;

    const total = await MythosComment.countDocuments();

    const mythosComments = await MythosComment.find()
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: mythosComments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: mythosComments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMythosCommentById = async (req, res) => {
  const { id } = req.params;
  try {
    const mythosComment = await MythosComment.findById(id);
    if (!mythosComment) {
      return res.status(404).json({
        success: false,
        message: "Mythos comment not found",
      });
    }
    res.status(200).json({
      success: true,
      data: mythosComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMythosComment = async (req, res) => {
  const { id } = req.params;
  const { comment, name, email } = req.body;
  try {
    const mythosComment = await MythosComment.findByIdAndUpdate(
      id,
      {
        comment,
        name,
        email,
      },
      { new: true }
    );
    if (!mythosComment) {
      return res.status(404).json({
        success: false,
        message: "Mythos comment not found",
      });
    }
    res.status(200).json({
      success: true,
      data: mythosComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMythosComment = async (req, res) => {
  const { id } = req.params;
  try {
    const mythosComment = await MythosComment.findByIdAndDelete(id);
    if (!mythosComment) {
      return res.status(404).json({
        success: false,
        message: "Mythos comment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Mythos comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMythosComment,
  getAllMythosComments,
  getMythosCommentById,
  updateMythosComment,
  deleteMythosComment,
};
