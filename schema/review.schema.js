const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
        },

        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "orders",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        review: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const reviewModel = mongoose.model("review", reviewSchema, "review");

module.exports = reviewModel;
