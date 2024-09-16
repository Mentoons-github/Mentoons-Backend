const Product = require('../models/products')
const mongoose = require('mongoose')
module.exports = {
    addProductToDB: async ({ productTitle, productDescription, productPrice, productCategory, rewardPoints, productThumbnail, productSample }) => {
        try {
            const newProduct = new Product({
                productTitle,
                productDescription,
                productPrice,
                rewardPoints,
                productThumbnail,
                productSample,
                productCategory
            })
            const saveProduct = await newProduct.save()
            return saveProduct
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    },
    getAllProductsFromDB: async (productTitle, productCategory, sortField, sortDirection, page = 1, limit = 10) => {
        try {
            const filters = {};
            const sortCriteria = {};
            const pageSize = parseInt(limit, 10) || 10;
            const skip = (page - 1) * limit;
            if (productTitle) {
                filters.productTitle = { $regex: new RegExp(productTitle, 'i') };
            }
            if (productCategory) {
                filters.productCategory = productCategory;
            }
            if (sortField && sortDirection) {
                sortCriteria[sortField] = sortDirection === 'asc' ? 1 : -1;
            } else {
                sortCriteria.productPrice = 1;
                sortCriteria.productTitle = 1;
            }
            const allProducts = await Product.aggregate([
                { $match: filters },
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        productDescription: 1,
                        productCategory: 1,
                        productPrice: 1,
                        rewardPoints: 1,
                        productThumbnail: 1,
                        productSample: 1
                    }
                },
                { $sort: sortCriteria },
                { $skip: skip },
                { $limit: pageSize }
            ]);
            return allProducts;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching products from database');
        }
    },
    getOneProductFromDB: async (productId) => {
        try {
            const objectId = new mongoose.Types.ObjectId(productId);
            await Product.findByIdAndUpdate(
                objectId,
                { $inc: { viewsCount: 1 } },
                { new: true, runValidators: true }
            );
            const product = await Product.aggregate([
                { $match: { _id: objectId } },
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        productDescription: 1,
                        productCategory: 1,
                        productPrice: 1,
                        rewardPoints: 1,
                        productThumbnail: 1,
                        productSample: 1,
                        viewsCount:1,
                    }
                },
            ])
            if (product.length === 0) {
                return null
            }
    
            return product[0];
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching products from database")
        }
    },
    editProductFromDB: async (productTitle, productDescription, productCategory, productPrice, rewardPoints, productThumbnail, productSample, productId) => {
        try {
            const updateData = {
                productTitle,
                productDescription,
                productPrice,
                productCategory,
                rewardPoints,
                productThumbnail,
                productSample,
            }
            const objectId = new mongoose.Types.ObjectId(productId)
            const updatedProduct = await Product.findByIdAndUpdate(
                objectId,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            if (!updatedProduct) {
                throw new Error('Product not found');
            }
            return updatedProduct;
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching products from database")
        }
    },
    deleteProductFromDB: async (productId) => {
        try {
            const objectId = new mongoose.Types.ObjectId(productId);
            const deletedProduct = await Product.findByIdAndDelete(objectId);
            if (!deletedProduct) {
                return null
            }
            return deletedProduct;
        } catch (error) {
            console.log(error);
            throw new Error("Error deleting product from database");
        }
    }
}; 