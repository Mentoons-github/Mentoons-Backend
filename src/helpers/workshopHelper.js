const requestCall = require("../models/requestCall");
const User = require("../models/user");
const workshopEnquiries = require("../models/workshopEnquiries");
const mongoose = require("mongoose");
module.exports = {
  saveWorkshopEnquiriesToDB: async ({
    firstname,
    lastname,
    email,
    phone,
    message,
    workshop,
  }) => {
    try {
      if (
        !firstname ||
        !lastname ||
        !email ||
        !phone ||
        !message ||
        !workshop
      ) {
        throw new Error("All fields are required to save workshop enquiry");
      }
      const enquiry = new workshopEnquiries({
        firstname,
        lastname,
        email,
        phone,
        message,
        workshop,
      });
      const savedEnquiry = await enquiry.save();
      return savedEnquiry;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getWorkshopEnquiriesFromDB: async (search, page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(search, "i");
      const enquiryData = await workshopEnquiries.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: searchRegex } },
              { workshop: { $regex: searchRegex } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            age: 1,
            guardianName: 1,
            guardianContact: 1,
            guardianEmail: 1,
            city: 1,
            duration: 1,
            workshop: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]);
      const totalEnquiries = await workshopEnquiries.countDocuments({
        $or: [
          {
            name: {
              $regex: searchRegex,
            },
          },
        ],
      });
      console.log(enquiryData, "oooooo");
      return {
        enquiryData,
        currentPage: page,
        totalPages: Math.ceil(totalEnquiries / limit),
        totalEnquiries,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getWorkshopEnquiriesByIdFromDB: async (workshopId) => {
    try {
      const objectId = new mongoose.Types.ObjectId(workshopId);
      const enquiryData = await workshopEnquiries.aggregate([
        {
          $match: {
            _id: objectId,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            age: 1,
            guardianName: 1,
            guardianContact: 1,
            guardianEmail: 1,
            city: 1,
            duration: 1,
            workshop: 1,
          },
        },
      ]);
      if (enquiryData.length === 0) {
        return null;
      }
      return enquiryData[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },
  saveCallRequestToDB: async ({ name, phone }) => {
    try {
      const callRequest = new requestCall({ name, phone });
      const savedCallRequest = await callRequest.save();
      return savedCallRequest;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getAllCallRequestFromDB: async (search, page = 1, limit = 10, id) => {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(search, "i");
      const callRequestData = await requestCall.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: searchRegex } },
              { phone: { $regex: searchRegex } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            status: 1,
            assignedTo: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]);
      const totalCallRequests = await requestCall.countDocuments({
        $or: [
          {
            name: {
              $regex: searchRegex,
            },
          },
        ],
      });
      return {
        callRequestData,
        currentPage: page,
        totalPages: Math.ceil(totalCallRequests / limit),
        totalCallRequests,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCallRequestByIdFromDB: async (id) => {
    try {
      const callRequestData = await requestCall.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            status: 1,
            assignedTo: 1,
          },
        },
      ]);
      if (callRequestData.length === 0) {
        return null;
      }
      return callRequestData[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },
  editCallRequestStatusFromDB: async (id, status) => {
    try {
      const callRequestData = await requestCall.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      return callRequestData;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  assignCallsToUserFromDB: async (userId, callId, superAdminId) => {
    try {
      const superAdmin = await User.findOne({ clerkId: superAdminId });
      if (!superAdmin) {
        throw new Error("Super admin not found");
      }
      if (superAdmin.role !== "SUPER-ADMIN") {
        throw new Error("Super admin is not authorized to assign calls");
      }
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.role !== "ADMIN") {
        throw new Error("User is not an admin");
      }
      console.log(callId, "callId");
      const call = await requestCall.findById(callId);
      if (!call) {
        throw new Error("Call not found");
      }
      if (call.assignedTo) {
        throw new Error("Call already assigned to a user");
      }
      const updatedCall = await requestCall.findByIdAndUpdate(
        callId,
        { assignedTo: userId },
        { new: true }
      );
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { assignedCalls: callId } },
        { new: true }
      );
      return { updatedUser, updatedCall };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  reallocateCallFromDB: async (callId, userId, superAdminId) => {
    try {
      const superAdmin = await User.findOne({ clerkId: superAdminId });
      if (!superAdmin) {
        throw new Error("Super admin not found");
      }
      if (superAdmin.role !== "SUPER-ADMIN") {
        throw new Error("Super admin is not authorized to reassign calls");
      }
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.role !== "ADMIN") {
        throw new Error("User is not an admin");
      }
      const call = await requestCall.findById(callId);
      if (!call) {
        throw new Error("Call not found");
      }
      if (!call.assignedTo) {
        throw new Error("Call is not currently assigned to anyone");
      }

      // Remove call from previous user's assignedCalls
      await User.findByIdAndUpdate(call.assignedTo, {
        $pull: { assignedCalls: callId },
      });

      // Update call and new user
      const updatedCall = await requestCall.findByIdAndUpdate(
        callId,
        { assignedTo: userId },
        { new: true }
      );
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { assignedCalls: callId } },
        { new: true }
      );

      return { updatedUser, updatedCall };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
