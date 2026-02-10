const Joi = require("joi");
const db = require("../schema");

module.exports = {

    addRemoveWishlist: {
        validation: {
            body: Joi.object({
                product_id: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const user_id = req.user._id;
                const { product_id } = req.body;

                // product exists
                const product = await db.product.findById(product_id);
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }

                let wishlist = await db.wishlist.findOne({ user_id });

                // create wishlist if not exists
                if (!wishlist) {
                    wishlist = await db.wishlist.create({
                        user_id,
                        products: [product_id],
                    });

                    return res.status(201).json({
                        message: "Product added to wishlist",
                        data: wishlist,
                    });
                }

                const exists = wishlist.products.some(
                    (p) => p.toString() === product_id
                );

                // if exists → remove
                if (exists) {
                    wishlist.products = wishlist.products.filter(
                        (p) => p.toString() !== product_id
                    );

                    await wishlist.save();

                    return res.json({
                        message: "Product removed from wishlist",
                        data: wishlist,
                    });
                }

                // else → add
                wishlist.products.push(product_id);
                await wishlist.save();

                res.json({
                    message: "Product added to wishlist",
                    data: wishlist,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Wishlist error",
                    error: error.message,
                });
            }
        },
    },

    getWishlist: {
        validation: {
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
            }),
        },

        handler: async (req, res) => {
            try {
                const page = Number(req.query.page) || 0;
                const limit = Number(req.query.limit) || 20;

                const wishlist = await db.wishlist
                    .findOne({ user_id: req.user._id })
                    .populate("products");

                if (!wishlist || !wishlist.products.length) {
                    return res.json({
                        message: "Wishlist empty",
                        totalItems: 0,
                        items: [],
                    });
                }

                const start = page * limit;
                const end = start + limit;

                res.json({
                    message: "Wishlist fetched successfully",
                    totalItems: wishlist.products.length,
                    page,
                    limit,
                    items: wishlist.products.slice(start, end),
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error fetching wishlist",
                    error: error.message,
                });
            }
        },
    },

    clearWishlist: {
        validation: {
            body: Joi.object({}).optional(),
            query: Joi.object({}).optional(),
            params: Joi.object({}).optional(),
        },

        handler: async (req, res) => {
            try {
                const wishlist = await db.wishlist.findOneAndUpdate(
                    { user_id: req.user._id },
                    { $set: { products: [] } },
                    { new: true }
                );

                if (!wishlist) {
                    return res.status(404).json({
                        message: "Wishlist not found",
                    });
                }

                res.json({
                    message: "Wishlist cleared successfully",
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error clearing wishlist",
                    error: error.message,
                });
            }
        },
    },

};
