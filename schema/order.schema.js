const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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
                    ref: "products",
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                size: {
                    type: String,
                    default: null,
                },
                price: {
                    type: Number,
                    required: true,
                },
                total: {
                    type: Number,
                    required: true,
                },
            }
        ],

        shipping_address: {
            type: Object,
            required: true,
        },

        payment_method: {
            type: String,
            enum: ["COD", "CARD", "UPI", "NETBANKING"],
            required: true,
        },

        payment_status: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },

        order_status: {
            type: String,
            enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
            default: "placed",
        },

        transaction_id: {
            type: String,
            default: null,
        },

        total_amount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const orderModel = mongoose.model("order", orderSchema, "order");

module.exports = orderModel;
