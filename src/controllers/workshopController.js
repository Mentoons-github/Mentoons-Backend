const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const Workshop = require("../models/workshop");
const WorkshopV2 = require("../models/workshop/workshopv2");

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
    const {
      firstname,
      lastname,
      email,
      phone,
      message,
      workshop,
      ageCategory,
    } = req.body;

    console.log(req.body, "bodyyyyyy");
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !message ||
      !workshop ||
      !ageCategory
    ) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    const EnquiryData = await saveWorkshopEnquiriesToDB({
      firstname,
      lastname,
      email,
      phone: Number(phone.replace(/\s+/g, "")),
      message,
      workshop,
      ageCategory,
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
    const updateContent = req.body;

    const { categoryName, subtitle, workshops } = updateContent;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!subtitle) {
      return res.status(400).json({
        success: false,
        message: "Subtitle is required",
      });
    }

    if (!workshops || !Array.isArray(workshops) || workshops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one workshop is required",
      });
    }

    for (const workshop of workshops) {
      const { workshopName, whyChooseUs, ageGroups } = workshop;

      if (!workshopName) {
        return res.status(400).json({
          success: false,
          message: "Workshop name is required",
        });
      }

      if (
        !whyChooseUs ||
        !Array.isArray(whyChooseUs) ||
        whyChooseUs.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: `At least one 'Why Choose Us' item is required for workshop ${workshopName}`,
        });
      }

      for (const item of whyChooseUs) {
        if (!item.heading || !item.description) {
          return res.status(400).json({
            success: false,
            message: `Each 'Why Choose Us' item in workshop ${workshopName} must have a heading and description`,
          });
        }
      }

      if (!ageGroups || !Array.isArray(ageGroups) || ageGroups.length === 0) {
        return res.status(400).json({
          success: false,
          message: `At least one age group is required for workshop ${workshopName}`,
        });
      }

      for (const group of ageGroups) {
        if (
          !group.ageRange ||
          !["6-12", "13-19", "20+"].includes(group.ageRange)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid age range for workshop ${workshopName}: must be one of '6-12', '13-19', or '20+'`,
          });
        }

        if (!group.serviceOverview) {
          return res.status(400).json({
            success: false,
            message: `Service overview is required for age group ${group.ageRange} in workshop ${workshopName}`,
          });
        }

        if (
          !group.benefits ||
          !Array.isArray(group.benefits) ||
          group.benefits.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: `At least one benefit is required for age group ${group.ageRange} in workshop ${workshopName}`,
          });
        }

        for (const benefit of group.benefits) {
          if (!benefit.title || !benefit.description) {
            return res.status(400).json({
              success: false,
              message: `Each benefit in age group ${group.ageRange} of workshop ${workshopName} must have a title and description`,
            });
          }
        }

        if (!group.image) {
          return res.status(400).json({
            success: false,
            message: `Image is required for age group ${group.ageRange} in workshop ${workshopName}`,
          });
        }
      }
    }

    const existingWorkshop = await Workshop.findOne({
      categoryName,
      _id: { $ne: workshopId },
    });

    if (existingWorkshop) {
      return res.status(400).json({
        success: false,
        message: "Workshop category with this name already exists",
      });
    }

    const workshop = await Workshop.findByIdAndUpdate(
      workshopId,
      { $set: { categoryName, subtitle, workshops } },
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

  deleteWorkshop: asyncHandler(async (req, res) => {
    const { workshopId } = req.params;

    await Workshop.findByIdAndDelete(workshopId);

    return res.status(200).json({ message: "Workshop deleted successfully" });
  }),

 

  //workshopV2
  getAllWorkshopV2: asyncHandler(async (req, res) => {
    const workshops = await WorkshopV2.find({ isActive: true }).lean();

    console.log(workshops);
    if (!workshops || workshops.length === 0) {
      return errorResponse(res, 404, "No workshops found");
    }

    return successResponse(
      res,
      200,
      "WorkshopV2 fetched successfully",
      workshops
    );
  }),

  addWorkshopV2: asyncHandler(async (req, res) => {
    const data = req.body;
    console.log(data);

    if (!data.workshopCode || !data.name || !data.plans) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const existing = await WorkshopV2.findOne({
      workshopCode: data.workshopCode,
    });

    if (existing) {
      return errorResponse(res, 400, "Workshop already exists");
    }

    const workshop = await WorkshopV2.create(data);

    return successResponse(
      res,
      201,
      "WorkshopV2 created successfully",
      workshop
    );
  }),
};
