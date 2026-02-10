const Joi = require("joi")
const db = require("../schema")  
const bcrypt = require("bcrypt")   
const JWT = require("jsonwebtoken")
const fs = require("fs")

module.exports = {

    // public api
    addUser: {
        validation: {
            body: Joi.object({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).required(),
                role: Joi.string().valid("user", "admin").optional(),

                addresses: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                        phone: Joi.string().required(),
                        addressline: Joi.string().required(),
                        city: Joi.string().required(),
                        state: Joi.string().required(),
                        pincode: Joi.string().required(),
                        country: Joi.string().required(),
                    })
                ).optional(),
            }),
        },

        handler: async (req, res) => {
            try {
                console.log("body:", req.body);
                console.log("file:", req.file);

                // email check
                const exists = await db.user.findOne({ email: req.body.email });
                if (exists) {
                    return res.status(400).json({
                        message: "Email already exists",
                    });
                }

                // profile image set
                if (req.file) {
                    req.body.profile_img =
                        "http://localhost:8080/files/" + req.file.filename;
                }

                // bcrypt password
                const saltRounds = 10;
                const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
                req.body.password = hashPassword;

                // create user
                const user = await db.user.create(req.body);

                res.status(201).json({
                    message: "User added successfully",
                    data: user,
                });
            } catch (err) {
                res.status(500).json({
                    message: "Error",
                    error: err.message,
                });
            }
        },
    },

    loginUser: {
        validation: {
            body: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const { email, password } = req.body;

                const user = await db.user.findOne({ email }).lean();

                if (!user) {
                    return res.json({
                        success: false,
                        message: "User not found 😣",
                    });
                }

                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return res.json({
                        success: false,
                        message: "Incorrect password 🤔",
                    });
                }

                const token = JWT.sign(
                    {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "7d",
                    }
                );

                // security:response mathi password remove karva mate
                delete user.password;

                res.json({
                    success: true,
                    message: "User login successfully 😀",
                    token: token,
                    user: user,
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Login error",
                    error: error.message,
                });
            }
        },
    },

    loginAdmin: {
        validation: {
            body: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const { email, password } = req.body;

                // find user by email
                const user = await db.user.findOne({ email }).lean();

                if (!user) {
                    return res.json({
                        success: false,
                        message: "Admin not found 😣",
                    });
                }

                // check role
                if (user.role !== "admin") {
                    return res.status(403).json({
                        success: false,
                        message: "Access denied 🚫, not an admin",
                    });
                }

                // check password
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res.json({
                        success: false,
                        message: "Incorrect password 🤔",
                    });
                }

                // generate JWT
                const token = JWT.sign(
                    {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role, // 🔴 include role
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" }
                );

                // remove password from response
                delete user.password;

                res.json({
                    success: true,
                    message: "Admin login successfully 😀",
                    token,
                    user,
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Login error",
                    error: error.message,
                });
            }
        },
    },

    // forgot password
    requestOtp: {
        validation: {
            body: Joi.object({
                email: Joi.string().email().required(),
            })
        },
        handler: async (req, res) => {
            try {
                const { email } = req.body;

                const user = await db.user.findOne({ email });
                if (!user) {
                    return res.json({
                        success: false,
                        message: "User not found!",
                    });
                }

                const otp = Math.floor(1000 + Math.random() * 9000).toString();

                await db.user.updateOne(
                    { email },
                    { $set: { checkOtp: otp } }
                );

                return res.json({
                    success: true,
                    message: "OTP sent successfully",
                    otp // demo only, production માં remove karvanu
                });

            } catch (error) {
                return res.json({
                    success: false,
                    message: error.message,
                });
            }
        }
    },

    verifyOtp: {
        validation: {
            body: Joi.object({
                email: Joi.string().email().required(),
                otp: Joi.string().required(),
            })
        },
        handler: async (req, res) => {
            try {
                const { email, otp } = req.body;

                const user = await db.user.findOne({ email });
                if (!user) {
                    return res.json({
                        success: false,
                        message: "User not found!",
                    });
                }

                if (user.checkOtp !== otp) {
                    return res.json({
                        success: false,
                        message: "Invalid OTP!",
                    });
                }

                return res.json({
                    success: true,
                    message: "OTP verified successfully",
                });

            } catch (error) {
                return res.json({
                    success: false,
                    error: error.message,
                });
            }
        }
    },

    forgotResetPassword: {

        validation: {
            body: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(5).max(20).required(),
                confirmPassword: Joi.string().min(5).max(20).required(),
            })
        },

        handler: async (req, res) => {
            try {
                const { email, password, confirmPassword } = req.body;

                const user = await db.user.findOne({ email });
                if (!user) {
                    return res.json({
                        success: false,
                        message: "User not found!",
                    });
                }

                if (!user.checkOtp) {
                    return res.json({
                        success: false,
                        message: "OTP not verified!",
                    });
                }

                if (password !== confirmPassword) {
                    return res.json({
                        success: false,
                        message: "Passwords do not match!",
                    });
                }

                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                await db.user.updateOne(
                    { email },
                    {
                        $set: { password: hashedPassword },
                        $unset: { checkOtp: "" }
                    }
                );

                return res.json({
                    success: true,
                    message: "Password reset successfully 🔐",
                });

            } catch (error) {
                return res.json({
                    success: false,
                    error: error.message,
                });
            }
        }
    },


    // user api
    updateUser: {
        validation: {
            body: Joi.object({
                name: Joi.string().optional(),
                email: Joi.string().email().optional(),
                age: Joi.number().min(18).max(80).optional(),
                password: Joi.string().min(6).optional(),
                role: Joi.string().valid("user", "admin").optional(),

                addresses: Joi.array().items(
                    Joi.object({
                        name: Joi.string().optional(),
                        phone: Joi.string().optional(),
                        addressline: Joi.string().optional(),
                        city: Joi.string().optional(),
                        state: Joi.string().optional(),
                        pincode: Joi.string().optional(),
                        country: Joi.string().optional(),
                    })
                ).optional(),

            })
        },

        handler: async (req, res) => {
            try {

                const user = await db.user.findById(req.user._id);

                if (!user) {
                    return res.json({
                        success: false,
                        message: "User not found",
                    });
                }

                // profile image update karva
                if (req.file) {
                    req.body.profile_img = "http://localhost:8080/files/" + req.file.filename;

                    // juni IMG delete karva
                    if (user.profile_img) {
                        const path = "upload/" + user.profile_img.split("/files/")[1];
                        fs.unlinkSync(path);
                    }
                }

                // password update karo to bcrypt karva
                if (req.body.password) {
                    const saltRounds = 10;
                    req.body.password = await bcrypt.hash(
                        req.body.password,
                        saltRounds
                    );
                }

                const setUser = await db.user.findByIdAndUpdate(
                    { _id: req.user._id },
                    { $set: req.body },
                    { new: true }
                );

                res.json({
                    message: "User updated successfully 🫣",
                    data: setUser,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in updating user 😣",
                    error: error.message,
                });
            }
        },
    },

    resetPassword: {
        validation: {
            body: Joi.object({
                currentPassword: Joi.string().min(5).max(20).required(),
                newPassword: Joi.string().min(5).max(20).required(),
            })
        },

        handler: async (req, res) => {
            try {
                const { currentPassword, newPassword } = req.body;

                const user = await db.user.findById(req.user._id);

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                    });
                }

                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({
                        success: false,
                        message: "Current password is incorrect",
                    });
                }

                if (currentPassword === newPassword) {
                    return res.status(400).json({
                        success: false,
                        message: "New password must be different from old password",
                    });
                }

                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

                // 🔥 IMPORTANT FIX
                await db.user.updateOne(
                    { _id: req.user._id },
                    { $set: { password: hashedPassword } }
                );

                return res.json({
                    success: true,
                    message: "Password updated successfully 🔐",
                });

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error while resetting password",
                    error: error.message,
                });
            }
        }

    },


    // admin side
    getUser: {
        validation: {
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
                search: Joi.string(),
            })
        },

        handler: async (req, res) => {
            const users = await db.user.find({});
            const count = await db.user.countDocuments({});

            res.json({
                message: "User fetched successfully",
                totalUsers: count,
                data: users,
            });
        },
    },

}