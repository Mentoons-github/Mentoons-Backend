const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const { saveWorkshopEnquiriesToDB, getWorkshopEnquiriesFromDB, getWorkshopEnquiriesByIdFromDB, saveCallRequestToDB, getAllCallRequestFromDB, editCallRequestStatusFromDB, getCallRequestByIdFromDB } = require("../helpers/workshopHelper");



module.exports = {

  
  submitWorkshopForm: asyncHandler(async (req, res, next) => {
    console.log(req.body)
    const { name, age, guardianName, guardianContact, guardianEmail, city, duration, workshop } = req.body
    if (!name || !age || !guardianName || !guardianContact || !guardianEmail || !city || !duration || !workshop) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST)
    }
    const EnquiryData = await saveWorkshopEnquiriesToDB({ name, age, guardianName, guardianContact, guardianEmail, city, duration, workshop })
    if (!EnquiryData) {
      return errorResponse(res, 500, messageHelper.SOMETHING_WENT_WRONG)
    }
    return successResponse(res, 200, messageHelper.FORM_SUBMITTED)
  }),


  getWorkshopEnquiries: asyncHandler(async (req, res, next) => {
    const { search, page, limit } = req.query
    const EnquiryData = await getWorkshopEnquiriesFromDB(search, page, limit)
    console.log(EnquiryData, 'oooooo')
    if (!EnquiryData) {
      return errorResponse(res, 500, messageHelper.SOMETHING_WENT_WRONG)
    }
    return successResponse(res, 200, messageHelper.ENQUIRY_DATA_FETCHED, EnquiryData)
  }),


  getWorkshopEnquiriesById: asyncHandler(async (req, res, next) => {
    const { workshopId } = req.params
    const EnquiryData = await getWorkshopEnquiriesByIdFromDB(workshopId)
    if (!EnquiryData) {
      return errorResponse(res, 404, messageHelper.ENQUIRY_NOT_FOUND)
    }
    return successResponse(res, 200, messageHelper.ENQUIRY_DATA_FETCHED, EnquiryData)
  }),


  submitCallRequest: asyncHandler(async (req, res, next) => {
    const { name, phone } = req.body
    if (!name || !phone) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST)
    }
    const callRequestData = await saveCallRequestToDB({ name, phone })
    if (!callRequestData) {
      return errorResponse(res, 500, messageHelper.SOMETHING_WENT_WRONG)
    }
    return successResponse(res, 200, messageHelper.CALL_REQUEST_SUBMITTED, callRequestData)
  }),


  getAllCallRequests: asyncHandler(async (req, res, next) => {
    const { search, page, limit } = req.query
    const callRequestData = await getAllCallRequestFromDB(search, page, limit)
    if (!callRequestData) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND)
    }
    return successResponse(res, 200, messageHelper.CALL_REQUEST_DATA_FETCHED, callRequestData)
  }),


  getCallRequestById: asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const callRequestData = await getCallRequestByIdFromDB(id)
    if (!callRequestData) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND)
    }
    return successResponse(res, 200, messageHelper.CALL_REQUEST_DATA_FETCHED, callRequestData)
  }),


  editCallRequestStatus: asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body
    const callRequestData = await editCallRequestStatusFromDB(id, status)
    if (!callRequestData) {
      return errorResponse(res, 404, messageHelper.CALL_REQUEST_NOT_FOUND)
    }
    return successResponse(res, 200, messageHelper.CALL_REQUEST_STATUS_UPDATED, callRequestData)
  })
}