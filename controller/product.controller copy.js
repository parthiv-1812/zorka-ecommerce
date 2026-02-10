const Joi = require("joi");
const db = require("../schema");

module.exports = {

    // public API
    getProduct: {
        validation: {
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
            }),
        },

        handler: async (req, res) => {
            try {
                const products = await db.product.find().populate("category", "name image");

                res.json({
                    message: "Products fetched successfully",
                    total: products.length,
                    data: products,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in fetching products",
                    error: error.message,
                });
            }
        }
    },

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

                res.json({
                    message: "Product fetched successfully",
                    data: product,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error in fetching product",
                    error: error.message,
                });
            }
        }
    },

    // admin API
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
                console.log("body:", req.body);
                console.log("files:", req.files);

                let images = [];
                if (req.files && req.files.length) {
                    images = req.files.map(
                        file => "http://localhost:8080/files/" + file.filename
                    );
                }

                const product = await db.product.create({
                    ...req.body,
                    images
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
                const product = await db.product.findById(req.params.id);
                if (!product) {
                    return res.status(404).json({
                        message: "Product not found",
                    });
                }

                // new images add
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
                    deleted: product
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
