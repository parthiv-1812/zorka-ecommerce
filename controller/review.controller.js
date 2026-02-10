const Joi = require("joi");
const db = require("../schema");

module.exports = {

    addReview: {
        validation: {
            body: Joi.object({
                product_id: Joi.string().required(),
                order_id: Joi.string().optional(),
                rating: Joi.number().min(1).max(5).required(),
                review: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const user_id = req.user._id;
                const { product_id, order_id, rating, review } = req.body;

                // check if product exists
                const product = await db.product.findById(product_id);
                if (!product) return res.status(404).json({ message: "Product not found" });

                // check if user already reviewed this product
                const existing = await db.review.findOne({ product_id, user_id });
                if (existing) return res.status(400).json({ message: "You already reviewed this product" });

                // create review
                const newReview = await db.review.create({
                    user_id,
                    product_id,
                    order_id: order_id || null,
                    rating,
                    review,
                });

                // calculate average rating & total reviews
                const agg = await db.review.aggregate([
                    { $match: { product_id: product._id } },
                    {
                        $group: {
                            _id: "$product_id",
                            avgRating: { $avg: "$rating" },
                            totalReviews: { $sum: 1 }
                        }
                    }
                ]);

                if (agg.length) {
                    product.averageRating = parseFloat(agg[0].avgRating.toFixed(1));
                    product.totalReviews = agg[0].totalReviews;
                    await product.save();
                }

                res.status(201).json({ message: "Review added successfully", data: newReview });

            } catch (error) {
                res.status(500).json({ message: "Error adding review", error: error.message });
            }
        }
    },

    getProductReviews: {
        validation: {
            params: Joi.object({
                productId: Joi.string().required(),
            }),
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
            }),
        },

        handler: async (req, res) => {
            try {
                const { productId } = req.params;
                const page = Number(req.query.page) || 0;
                const limit = Number(req.query.limit) || 20;

                // 🔥 Fetch reviews only for this product
                const reviews = await db.review
                    .find({ product_id: productId })
                    .populate("user_id", "name email")
                    .sort({ createdAt: -1 });

                const start = page * limit;
                const end = start + limit;

                res.json({
                    message: "Product reviews fetched successfully",
                    totalReviews: reviews.length,
                    page,
                    limit,
                    reviews: reviews.slice(start, end),
                });

            } catch (error) {
                res.status(500).json({ message: "Error fetching reviews", error: error.message });
            }
        }
    }
    
};
