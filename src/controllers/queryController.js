const Query = require("../models/query");

const createQuery = async (req, res) => {
  console.log("Query Data", req.body);
  try {
    const exist = await Query.find({ queryType: req.body.queryType });
    if (exist) {
      console.log(exist.length);
      return res.status(409).json({
        success: false,
        message: "Already submitted the query",
      });
    }
    const query = new Query({ ...req.body });
    const savedQuery = await query.save();
    console.log("Saved Query", savedQuery);
    res.status(201).json({
      success: true,
      data: savedQuery,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all queries
const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find();
    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single query by ID
const getQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }
    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update query
const updateQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }
    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete query
const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createQuery,
  getAllQueries,
  getQuery,
  updateQuery,
  deleteQuery,
};
