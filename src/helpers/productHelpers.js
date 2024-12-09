const Product = require('../models/products')
const mongoose = require('mongoose')
const Author = require('../models/authorModel')

module.exports = {
    addProductToDB: async ({ productTitle, productDescription, productCategory, productThumbnail, productSample, productFile, author }) => {
        try {
            const authorExists = await Author.findOne({ _id: author })
            if (!authorExists) {
                throw new Error('Author not found')
            }
            const newProduct = new Product({
                productTitle,
                productDescription,
                productCategory,
                productThumbnail,
                productSample,
                productFile,
                author: authorExists._id
            })
            const saveProduct = await newProduct.save()
            return saveProduct
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    },

    getAllProductsFromDB: async (search, page = 1, limit = 10) => {
        
        try {
            const skip = (page - 1) * limit;
            const searchRegex = new RegExp(search, 'i');
          
            const allProducts = await Product.aggregate([
                { $match: { $or: [{ productTitle: { $regex: searchRegex } }, { productCategory: { $regex: searchRegex } }] } },
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        productDescription: 1,
                        productCategory: 1,
                        productThumbnail: 1,
                        productSample: 1,
                        productFile: 1,
                        author: 1,
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: Number(limit) }
            ]);
        const totalProducts = await Product.countDocuments({
            $or: [
                { productTitle: { $regex: searchRegex } },
                { productCategory: { $regex: searchRegex } }
            ]
        })
            return {
                products: allProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts
            };
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
                    $lookup: {  
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }   
                },
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        productDescription: 1,
                        productCategory: 1,
                        productThumbnail: 1,
                        productSample: 1,
                        productFile: 1,
                        viewsCount:1,
                        author: 1,
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

    editProductFromDB: async (productTitle, productDescription, productCategory, productThumbnail, productSample, productFile, author, productId) => {
        try {
            const updateData = {
                productTitle,
                productDescription,
                productCategory,
                productThumbnail,
                productSample,
                productFile,
                author
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
            throw new Error("Error updating product in database")
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
    },
    getTrendingProductsFromDB: async () => {
        try {
            const trendingProducts = await Product.aggregate([
                { $sort: { viewsCount: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        productDescription: 1,
                        productCategory: 1,
                        productThumbnail: 1,
                        productSample: 1,
                        productFile: 1,
                        author: 1,
                    }
                }
            ]);
            return trendingProducts;
        } catch (error) {
            console.log(error);
            throw new Error("Error fetching trending products from database");
        }
    }
};