const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const Workshop = require("../models/workshop");
const {
  saveWorkshopEnquiriesToDB,
  getWorkshopEnquiriesFromDB,
  getWorkshopEnquiriesByIdFromDB,
  saveCallRequestToDB,
  getAllCallRequestFromDB,
  editCallRequestStatusFromDB,
  getCallRequestByIdFromDB,
  assignCallsToUserFromDB,
  reallocateCallFromDB,
  saveWorkshop,
} = require("../helpers/workshopHelper");

module.exports = {
  submitWorkshopForm: asyncHandler(async (req, res, next) => {
    const { firstname, lastname, email, phone, message, workshop } = req.body;
    if (!firstname || !lastname || !email || !phone || !message || !workshop) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    const EnquiryData = await saveWorkshopEnquiriesToDB({
      firstname,
      lastname,
      email,
      phone,
      message,
      workshop,
    });
    if (!EnquiryData) {
      return errorResponse(res, 500, messageHelper.SOMETHING_WENT_WRONG);
    }
    return successResponse(res, 200, messageHelper.FORM_SUBMITTED);
  }),

  getWorkshopEnquiries: asyncHandler(async (req, res, next) => {
    const { search, page, limit } = req.query;
    const EnquiryData = await getWorkshopEnquiriesFromDB(search, page, limit);
    console.log(EnquiryData, "oooooo");
    if (!EnquiryData) {
      return errorResponse(res, 500, messageHelper.SOMETHING_WENT_WRONG);
    }
    return successResponse(
      res,
      200,
      messageHelper.ENQUIRY_DATA_FETCHED,
      EnquiryData
    );
  }),

  getWorkshopEnquiriesById: asyncHandler(async (req, res, next) => {
    const { workshopId } = req.params;
    const EnquiryData = await getWorkshopEnquiriesByIdFromDB(workshopId);
    if (!EnquiryData) {
      return errorResponse(res, 404, messageHelper.ENQUIRY_NOT_FOUND);
    }
    return successResponse(
      res,
      200,
      messageHelper.ENQUIRY_DATA_FETCHED,
      EnquiryData
    );
  }),

  submitCallRequest: asyncHandler(async (req, res, next) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    const callRequestData = await saveCallRequestToDB({ name, phone });
    if (!callRequestData) {
      return errorResponse(res, 500, messageHelper.SOMETHING_WENT_WRONG);
    }
    return successResponse(
      res,
      200,
      messageHelper.CALL_SUBMITTED,
      callRequestData
    );
  }),

  getAllCallRequests: asyncHandler(async (req, res, next) => {
    const { search, page, limit } = req.query;
    const callRequestData = await getAllCallRequestFromDB(search, page, limit);
    if (!callRequestData) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND);
    }
    return successResponse(
      res,
      200,
      messageHelper.CALL_DATA_FETCHED,
      callRequestData
    );
  }),

  getCallRequestById: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const callRequestData = await getCallRequestByIdFromDB(id);
    if (!callRequestData) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND);
    }
    return successResponse(
      res,
      200,
      messageHelper.CALL_DATA_FETCHED,
      callRequestData
    );
  }),

  editCallRequestStatus: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const callRequestData = await editCallRequestStatusFromDB(id, status);
    if (!callRequestData) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND);
    }
    return successResponse(
      res,
      200,
      messageHelper.CALL_STATUS_UPDATED,
      callRequestData
    );
  }),
  assignCallsToUser: asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { callId } = req.body;
    const superAdminId = req.auth.userId;
    const assignedCalls = await assignCallsToUserFromDB(
      userId,
      callId,
      superAdminId
    );
    if (!assignedCalls) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND);
    }
    return successResponse(
      res,
      200,
      messageHelper.CALL_ALLOCATED,
      assignedCalls
    );
  }),
  reallocateCallFromUser: asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { callId } = req.body;
    const superAdminId = req.auth.userId;
    const reallocatedCall = await reallocateCallFromDB(
      callId,
      userId,
      superAdminId
    );
    if (!reallocatedCall) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND);
    }
    return successResponse(
      res,
      200,
      messageHelper.CALL_REALLOCATED,
      reallocatedCall
    );
  }),

  addWorkshop: asyncHandler(async (req, res) => {
    try {
      const data = req.body;
      const { workshop } = await saveWorkshop(data);
      return successResponse(
        res,
        201,
        "Workshop created successfully",
        workshop
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message || "Failed to create workshop",
      });
    }
  }),

  getWorkshopById: asyncHandler(async (req, res) => {
    try {
      const { workshopId } = req.params;

      const workshop = await Workshop.findById({ _id: workshopId });
      return res.status(200).json({
        success: true,
        message: "Workshop fetched successfully",
        workshop,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }),

  editWorkshop: asyncHandler(async (req, res) => {
    const { workshopId } = req.params;
    console.log("reached edit workshop");
    const updateContent = req.body;

    const workshop = await Workshop.findByIdAndUpdate(
      { _id: workshopId },
      { $set: updateContent },
      { new: true, runValidators: true }
    );

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Workshop updated successfully",
      data: workshop,
    });
  }),

  deleteWorkshopImage: asyncHandler(async (req, res) => {
    const { workshopId, ageRange } = req.params;

    const updatedWorkshop = await Workshop.findOneAndUpdate(
      { _id: workshopId, "ageGroups.ageRange": ageRange },
      { $set: { "ageGroups.$.image": null } },
      { new: true }
    );

    if (!updatedWorkshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop or age group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: updatedWorkshop,
    });
  }),

  getAllWorkshops: asyncHandler(async (req, res) => {
    try {
      let { page, limit, sortBy, sortOrder, search, ...filters } = req.query;

      const noParams =
        !page &&
        !limit &&
        !sortBy &&
        !sortOrder &&
        !search &&
        Object.keys(filters).length === 0;

      if (noParams) {
        const workshops = await Workshop.find().lean();

        if (!workshops || workshops.length === 0) {
          return res.status(404).json({
            success: false,
            error: "No workshops found",
          });
        }

        return successResponse(
          res,
          200,
          "All workshops fetched successfully",
          workshops
        );
      }

      // Parse query parameters with defaults
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      sortBy = sortBy || "createdAt";
      sortOrder = sortOrder || "desc";

      // Initialize query object
      const query = {};

      // Handle search parameter
      if (search && typeof search === "string") {
        query.$or = [
          { workshopName: { $regex: search, $options: "i" } },
          {
            whyChooseUs: {
              $elemMatch: {
                $or: [
                  { heading: { $regex: search, $options: "i" } },
                  { description: { $regex: search, $options: "i" } },
                ],
              },
            },
          },
        ];
      }

      // Apply additional filters
      for (const key in filters) {
        if (filters[key]) {
          // Ensure filters are applied to valid fields
          if (["workshopName", "createdAt"].includes(key)) {
            query[key] = { $regex: filters[key], $options: "i" };
          } else {
            query[key] = filters[key];
          }
        }
      }

      // Count total documents matching the query
      const totalDocuments = await Workshop.countDocuments(query);

      // Define sort options
      const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      // Fetch workshops with pagination and sorting
      const workshops = await Workshop.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      if (!workshops || workshops.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No workshops found",
        });
      }

      return successResponse(res, 200, "Workshops fetched successfully", {
        workshops,
        pagination: {
          totalDocuments,
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limit),
          pageSize: workshops.length,
          hasNextPage: page * limit < totalDocuments,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error("Error in getAllWorkshops:", error.message);
      return res.status(500).json({
        success: false,
        error: "Server error while fetching workshops",
      });
    }
  }),
};
