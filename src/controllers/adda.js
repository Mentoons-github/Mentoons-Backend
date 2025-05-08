const Post = require("../models/adda/posts");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");

const fetchAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find();
  if (posts.length > 0) {
    return successResponse(res, 200, messageHelper.FETCH_POSTS_SUCCESS, posts);
  }
  return errorResponse(res, 400, messageHelper.BAD_REQUEST);
});

const uploadPost = asyncHandler(async (req, res) => {
  const { type } = req.body;
  console.log("type received uploading posts : ", type);

  const postData = req.body;
  let data;

  switch (type) {
    case "image":
    case "video":
      data = {
        type,
        files: postData.files,
        description: postData?.description || "",
      };
      break;
    case "article":
      data = {
        type,
        articleContent: postData.articleContent,
      };
      break;
    case "event":
      data = {
        type,
        eventDetails: postData.eventDetails.eventDate,
        location: postData.eventDetails.location,
        additionalInfo: postData.eventDetails.additionalInfo,
      };
      break;
    default:
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
  }

  const postSave = await Post.create(data);

  if (!postSave) {
    return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
  }

  return successResponse(
    res,
    200,
    messageHelper.SUCCESSFULLY_CREATED_POST,
    postSave
  );
});

module.exports = {
  fetchAllPosts,
  uploadPost,
};
