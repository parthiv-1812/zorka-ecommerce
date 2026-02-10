const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true,
            unique: true
        },
        image:
        {
            type: String
        }, // Optional, can store URL or file path
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const categoryModel = mongoose.model("category", categorySchema, "category");

module.exports = categoryModel;
