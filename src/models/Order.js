const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // This could reference Course, Book, or any product model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productType: {
        type: String,
        required: true,
        enum: ['course', 'book', 'merchandise'] // Add more product types as needed
    }
});

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    sameAsShipping: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    next();
});

// Method to update order status
orderSchema.methods.updateStatus = async function(status) {
    this.orderStatus = status;
    return await this.save();
};

// Method to add item to order
orderSchema.methods.addItem = function(item) {
    this.items.push(item);
    return this;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
