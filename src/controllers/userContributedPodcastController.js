const userContributionHelper = require("../helpers/userContributionhelper");

const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");

const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  addUserContributedPodcast: asyncHandler(async (req, res, next) => {
    const { userId } = req.auth;

    const data = {
      ...req.body,
      userId,
    };

    const {
      name,
      email,
      age,
      location,
      topic,
      descripiton,
      audiofile,
      thumbnail,
    } = data;

    if (
      !name ||
      !email ||
      !age ||
      !location ||
      !topic ||
      !descripiton ||
      !audiofile ||
      !userId
    ) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const newUserContributedPodcast =
      await userContributionHelper.addUserContributedPodcast(data);

    successResponse(
      res,
      200,
      "Successfully submitted the contribution",
      newUserContributedPodcast
    );
  }),
};
