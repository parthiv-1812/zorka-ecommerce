const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profile_img: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        addresses: [
            {
                name: {
                    type: String,
                    required: true,
                },
                phone: {
                    type: String,
                    required: true,
                },
                addressline: {
                    type: String,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
                state: {
                    type: String,
                    required: true,
                },
                pincode: {
                    type: String,
                    required: true,
                },
                country: {
                    type: String,
                    required: true,
                },
            }
        ],
        checkOtp: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const userModel = mongoose.model("users", userSchema, "users");

module.exports = userModel;
