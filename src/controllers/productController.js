const productHelpers = require('../helpers/productHelpers')
const asyncHandler = require('../utils/asyncHandler')
const messageHelper = require('../utils/messageHelper')
const { errorResponse, successResponse } = require('../utils/responseHelper')

module.exports = {
    addProduct: asyncHandler(async (req, res, next) => {
        const { productTitle, productDescription, productCategory, productThumbnail, productSample, productFile, author } = req.body
        if (!productTitle || !productDescription || !productCategory || !productThumbnail || !productSample || !productFile || !author) {
            return errorResponse(res, 400, messageHelper.BAD_REQUEST)
        }
        const data = await productHelpers.addProductToDB({ productTitle, productDescription, productCategory, productThumbnail, productSample, productFile, author })
        successResponse(res, 200, messageHelper.PRODUCT_CREATED, data)
    }),

    getAllProducts: asyncHandler(async (req, res, next) => {
        const { search, page, limit } = req.query
        const allproducts = await productHelpers.getAllProductsFromDB(search, page, limit)
        if (!allproducts) {
            return errorResponse(res, 404, messageHelper.PRODUCT_NOT_FOUND)
        }
        successResponse(res, 200, messageHelper.PRODUCTS_FETCHED, allproducts)
    }),

    getProduct: asyncHandler(async (req, res, next) => {
        const { productId } = req.params
        
        const product = await productHelpers.getOneProductFromDB(productId)
        if (!product) {
            return errorResponse(res, 404, messageHelper.PRODUCT_NOT_FOUND)
        }
        successResponse(res, 200, messageHelper.PRODUCTS_FETCHED, product)
    }),

    editProduct: asyncHandler(async (req, res, next) => {
        const { productId } = req.params
        const { productTitle, productDescription, productCategory, productThumbnail, productSample, productFile, author } = req.body
        const updatedProduct = await productHelpers.editProductFromDB(productTitle, productDescription, productCategory, productThumbnail, productSample, productFile, author, productId)
        if (!updatedProduct) {
            return errorResponse(res, 404, messageHelper.PRODUCT_NOT_FOUND)
        }
        successResponse(res, 200, messageHelper.PRODUCT_UPDATED, updatedProduct)
    }),

    deleteProduct: asyncHandler(async (req, res, next) => {
        const { productId } = req.params
        const deletedProduct = await productHelpers.deleteProductFromDB(productId)
        if (!deletedProduct) {
            return errorResponse(res, 404, messageHelper.PRODUCT_NOT_FOUND)
        }
        successResponse(res, 200, messageHelper.PRODUCT_DELETED, deletedProduct)
    }),
    getTrendingProducts: asyncHandler(async (req, res, next) => {
        const trendingProducts = await productHelpers.getTrendingProductsFromDB()
        if (!trendingProducts) {
            return errorResponse(res, 404, messageHelper.PRODUCT_NOT_FOUND)
        }
        successResponse(res, 200, messageHelper.PRODUCTS_FETCHED, trendingProducts)
    })
}