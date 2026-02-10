const Joi = require("joi");
const JWT = require("jsonwebtoken"); // ✅ FIX 1
const db = require("../schema");

module.exports = {

    // ================= PUBLIC API =================
    getProduct: {
        validation: {
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
            }),
        },

        handler: async (req, res) => {
            try {
                const { page, limit } = req.query;

                // ✅ auth.js mathi male
                const userId = req.user?._id || null;

                // 1️⃣ Fetch products
                const products = await db.product
                    .find({ isActive: true })
                    .populate("category", "name image")
                    .skip(page * limit)
                    .limit(limit);

                const total = await db.product.countDocuments({ isActive: true });

                // 2️⃣ Fetch wishlist if login
                let wishlistIds = [];
                if (userId) {
                    const wishlist = await db.wishlist.findOne({ user_id: userId });
                    if (wishlist) {
                        wishlistIds = wishlist.products.map(id => id.toString());
                    }
                }

                // 3️⃣ Add isWishlisted flag
                const productsWithWishlistFlag = products.map(p => ({
                    ...p._doc,
                    isWishlisted: userId
                        ? wishlistIds.includes(p._id.toString())
                        : false,
                }));

                res.json({
                    message: "Products fetched successfully",
                    total,
                    page,
                    limit,
                    data: productsWithWishlistFlag,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in fetching products",
                    error: error.message,
                });
            }
        }
    },

    // ================= PRODUCT BY ID =================
    getProductById: {
        validation: {
            params: Joi.object({
                id: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const product = await db.product
                    .findById(req.params.id)
                    .populate("category", "name image");

                if (!product) {
                    return res.status(404).json({
                        message: "Product not found",
                    });
                }

                // ✅ auth.js mathi user
                const userId = req.user?._id;
                let isWishlisted = false;

                if (userId) {
                    const wishlist = await db.wishlist.findOne({ user_id: userId });
                    if (
                        wishlist &&
                        wishlist.products.some(
                            p => p.toString() === product._id.toString()
                        )
                    ) {
                        isWishlisted = true;
                    }
                }

                res.json({
                    message: "Product fetched successfully",
                    data: {
                        ...product._doc,
                        isWishlisted,
                    },
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in fetching product",
                    error: error.message,
                });
            }
        }
    },

    // ================= ADMIN APIs =================
    addProduct: {
        validation: {
            body: Joi.object({
                title: Joi.string().required(),
                description: Joi.string().required(),
                price: Joi.number().required(),
                discountPrice: Joi.number().optional(),
                colors: Joi.array().items(Joi.string()).optional(),
                sizes: Joi.array().items(Joi.string()).optional(),
                category: Joi.string().required(),
                brand: Joi.string().optional(),
                stock: Joi.number().optional(),
                isActive: Joi.boolean().optional(),
            }),
        },

        handler: async (req, res) => {
            try {
                let images = [];
                if (req.files && req.files.length) {
                    images = req.files.map(
                        file => "http://localhost:8080/files/" + file.filename
                    );
                }

                const product = await db.product.create({
                    ...req.body,
                    images,
                });

                res.status(201).json({
                    message: "Product created successfully",
                    data: product,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in adding product",
                    error: error.message,
                });
            }
        }
    },

    updateProduct: {
        validation: {
            body: Joi.object({
                title: Joi.string().optional(),
                description: Joi.string().optional(),
                price: Joi.number().optional(),
                discountPrice: Joi.number().optional(),
                colors: Joi.array().items(Joi.string()).optional(),
                sizes: Joi.array().items(Joi.string()).optional(),
                category: Joi.string().optional(),
                brand: Joi.string().optional(),
                stock: Joi.number().optional(),
                isActive: Joi.boolean().optional(),
            }),
        },

        handler: async (req, res) => {
            try {
                if (req.files && req.files.length) {
                    req.body.images = req.files.map(
                        file => "http://localhost:8080/files/" + file.filename
                    );
                }

                const updated = await db.product.findByIdAndUpdate(
                    req.params.id,
                    { $set: req.body },
                    { new: true }
                );

                if (!updated) {
                    return res.status(404).json({ message: "Product not found" });
                }

                res.json({
                    message: "Product updated successfully",
                    data: updated,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in updating product",
                    error: error.message,
                });
            }
        }
    },

    deleteProduct: {
        validation: {
            params: Joi.object({
                id: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const product = await db.product.findByIdAndDelete(req.params.id);

                if (!product) {
                    return res.status(404).json({
                        message: "Product not found",
                    });
                }

                res.json({
                    message: "Product deleted successfully",
                    deleted: product,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in deleting product",
                    error: error.message,
                });
            }
        }
    },
};
