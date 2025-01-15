const asyncHandler = require("../utils/asyncHandler");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");
const cardProductHelpler = require("../helpers/cardProductHelpler");

module.exports = {
  createCardProductController: asyncHandler(async (req, res) => {
    const {
      productTitle,
      productCategory,
      productSummary,
      minAge,
      maxAge,
      ageFilter,
      rating,
      paperEditionPrice,
      printablePrice,
      productImages,
      productVideos,
      productDescriptions,
    } = req.body;
    const { userId } = req.auth;
    console.log("userId", userId);

    if (
      !productTitle ||
      !productCategory ||
      !productSummary ||
      !minAge ||
      !maxAge ||
      !ageFilter ||
      !rating ||
      !paperEditionPrice ||
      !printablePrice ||
      !productImages ||
      productImages.length === 0 ||
      !productVideos ||
      productVideos.length === 0 ||
      !productDescriptions ||
      !userId
    ) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const newCardProduct = await cardProductHelpler.createCardProduct(
      req.body,
      userId
    );

    if (!newCardProduct) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_CREATED_CARD_PRODUCT,
      newCardProduct
    );
  }),

  updateCardProductController: asyncHandler(async (req, res) => {
    const { skuId } = req.params;
    const { userId } = req.auth;
    const {
      productTitle,
      productCategory,
      productSummary,
      minAge,
      maxAge,
      ageFilter,
      rating,
      paperEditionPrice,
      printablePrice,
      productImages,
      productVideos,
      productDescriptions,
    } = req.body;
    if (
      !productTitle ||
      !productCategory ||
      !productSummary ||
      !minAge ||
      !maxAge ||
      !ageFilter ||
      !rating ||
      !paperEditionPrice ||
      !printablePrice ||
      !Array.isArray(productImages) ||
      productImages.length === 0 ||
      !Array.isArray(productVideos) ||
      productVideos.length === 0 ||
      !productDescriptions ||
      !skuId ||
      !userId
    ) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    if (!skuId) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const updatedCardProduct = await cardProductHelpler.updateCardProduct(
      skuId,
      req.body,
      userId
    );

    if (!updatedCardProduct) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_UPDATED_CARD_PRODUCT,
      updatedCardProduct
    );
  }),

  deleteCardProductController: asyncHandler(async (req, res) => {
    const { skuId } = req.params;
    const { userId } = req.auth;

    if (!skuId) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const deletedCardProduct = await cardProductHelpler.deleteCardProduct(
      skuId,
      userId
    );

    if (!deletedCardProduct) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_DELETED_CARD_PRODUCT,
      deletedCardProduct
    );
  }),

  getAllCardProductController: asyncHandler(async (req, res) => {
    const { search, page, limit, filter } = req.query;

    console.log("search", search);
    console.log("page", page);
    console.log("limit", limit);
    console.log("filter", filter);

    const allProduct = await cardProductHelpler.getAllCardProduct(
      search,
      page,
      limit,
      filter
    );

    if (!allProduct) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_FETCHED_CARD_PRODUCT,
      allProduct
    );
  }),

  getCardProductController: asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }

    const cardProduct = await cardProductHelpler.getCardProductById(productId);

    if (!cardProduct) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_FETCHED_CARD_PRODUCT,
      oneProduct
    );
  }),
};
