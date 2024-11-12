const { addAuthorToDB, getAllAuthorsFromDB } = require("../helpers/authorHelper")
const asyncHandler = require("../utils/asyncHandler")
const messageHelper = require("../utils/messageHelper")
const { errorResponse, successResponse } = require("../utils/responseHelper")

module.exports = {
    addAuthor: asyncHandler(async (req, res, next) => {
        const { name, image } = req.body
        const authorData = await addAuthorToDB(name, image)
        if (!authorData) {
            return errorResponse(res, 404, messageHelper.AUTHOR_NOT_FOUND)
        }
        return successResponse(res, 200, messageHelper.AUTHOR_ADDED, authorData)
    }),
    getAllAuthors: asyncHandler(async (req, res, next) => {
        const authorData = await getAllAuthorsFromDB()
        if (!authorData) {
            return errorResponse(res, 404, messageHelper.AUTHOR_NOT_FOUND)
        }
        return successResponse(res, 200, messageHelper.AUTHORS_FETCHED, authorData)
    }),
}