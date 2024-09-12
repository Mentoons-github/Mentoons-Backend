const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productTitle: {
        type: String,
        required: [true, 'Product title is required'],
        minlength: [5, 'Product title must contain 5 characters'],
        maxlength: [50, 'Product title must not contain more than 50 characters']
    },
    productDescription: {
        type: String,
        required: [true, 'Product description is requuired'],
    },
    productCategory: {
        type: String,
        required:true,
        enum:['COMIC','AUDIO COMIC','PODCAST','WORKSHOPS','MISC'],
        default:'MISC',
    },
    productPrice: {
        type: String,
        required: [true, 'Product price is required']
    },
    rewardPoints: {
        type: String,
        required: [true, 'Reward points is required']
    },
    productThumbnail: {
        type: String,
        required: [true, 'Product thumbnail is required']
    },
    productSample: {
        type: String,
        required: [true, 'Product Sample is required']
    }
})

const Product = mongoose.model('Products',productSchema)

module.exports = Product