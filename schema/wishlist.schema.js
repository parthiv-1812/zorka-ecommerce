const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            unique: true,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            }
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const wishlistModel = mongoose.model("wishlist", wishlistSchema, "wishlist");

module.exports = wishlistModel;
