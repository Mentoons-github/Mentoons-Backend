const userContributionHelper = require("../helpers/userContributionhelper");

const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");

const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  addUserContributedPodcast: asyncHandler(async (req, res, next) => {
    const { userId } = req.auth;

    const data = {
      ...req.body,
    };

    const {
      name,
      email,
      age,
      location,
      topic,
      description,
      audiofile,
      thumbnail,
      category,
    } = data;

console.log(data,'pp');


    if (
      !name ||
      !email ||
      !age ||
      !location ||
      !topic ||
      !description ||
      !audiofile ||
      !category
    ) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const newUserContributedPodcast =
      await userContributionHelper.addUserContributedPodcast(data,userId);

    successResponse(
      res,
      200,
      "Successfully submitted the contribution",
      newUserContributedPodcast
    );
  }),
};
