const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        items: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                size: {
                    type: String,
                    default: null,
                },
                color: {
                    type: String,
                    default: null,
                },
            }
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const cartModel = mongoose.model("cart", cartSchema, "cart");

module.exports = cartModel;
