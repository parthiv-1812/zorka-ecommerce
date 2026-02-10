const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        discountPrice: {
            type: Number,
            default: 0
        },
        images: {
            type: [String], // array of image URLs
            default: []
        },
        colors: {
            type: [String],
            default: []
        },
        sizes: {
            type: [String],
            default: []
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            required: true
        },
        brand: {
            type: String,
            default: ""
        },
        stock: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const productModel = mongoose.model("product", productSchema, "product");

module.exports = productModel;
