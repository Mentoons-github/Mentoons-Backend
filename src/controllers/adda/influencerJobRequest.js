const InfluencerJobRequest = require("../../models/adda/influencerJobRequest");
const mongoose = require("mongoose");

// Create a new influencer job request
const createInfluencerJobRequest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      age,
      city,
      state,
      instagramHandle,
      instagramFollowers,
      youtubeChannel,
      youtubeSubscribers,
      twitterHandle,
      twitterFollowers,
      tiktokHandle,
      tiktokFollowers,
      linkedinProfile,
      linkedinConnections,
      niche,
      experience,
      motivation,
      mentorshipInterest,
      agreeTerms,
    } = req.body;

    // Create new document with restructured data
    const newRequest = new InfluencerJobRequest({
      fullName,
      email,
      phone,
      age,
      city,
      state,
      instagram: {
        handle: instagramHandle,
        followers: instagramFollowers,
      },
      youtube: {
        channel: youtubeChannel,
        subscribers: youtubeSubscribers,
      },
      twitter: {
        handle: twitterHandle,
        followers: twitterFollowers,
      },
      tiktok: {
        handle: tiktokHandle,
        followers: tiktokFollowers,
      },
      linkedin: {
        profile: linkedinProfile,
        connections: linkedinConnections,
      },
      niche,
      experience,
      motivation,
      mentorshipInterest,
      agreeTerms,
    });

    const savedRequest = await newRequest.save();
    res.status(201).json({
      success: true,
      message: "Influencer job request submitted successfully",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating influencer job request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit influencer job request",
      error: error.message,
    });
  }
};

// Get all influencer job requests with optional filtering
const getAllInfluencerJobRequests = async (req, res) => {
  try {
    const { status, niche } = req.query;
    let query = {};

    // Apply filters if provided
    if (status) query.status = status;
    if (niche) query.niche = niche;

    const requests = await InfluencerJobRequest.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching influencer job requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch influencer job requests",
      error: error.message,
    });
  }
};

// Get a single influencer job request by ID
const getInfluencerJobRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const request = await InfluencerJobRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Influencer job request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching influencer job request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch influencer job request",
      error: error.message,
    });
  }
};

// Update the status of an influencer job request
const updateInfluencerJobRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Must be 'pending', 'approved', or 'rejected'",
      });
    }

    const updatedRequest = await InfluencerJobRequest.findByIdAndUpdate(
      id,
      {
        status,
        notes: notes || undefined,
        reviewedBy: req.user?._id || undefined,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Influencer job request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating influencer job request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// Delete an influencer job request
const deleteInfluencerJobRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const request = await InfluencerJobRequest.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Influencer job request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Influencer job request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting influencer job request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete influencer job request",
      error: error.message,
    });
  }
};

module.exports = {
  createInfluencerJobRequest,
  getAllInfluencerJobRequests,
  getInfluencerJobRequestById,
  updateInfluencerJobRequestStatus,
  deleteInfluencerJobRequest,
};