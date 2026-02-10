const Joi = require("joi");
const db = require("../schema");

module.exports = {

    // user API
    createOrder: {
        validation: {
            body: Joi.object({
                items: Joi.array().items(
                    Joi.object({
                        product_id: Joi.string().required(),
                        title: Joi.string().required(),
                        image: Joi.string().required(),
                        quantity: Joi.number().min(1).required(),
                        size: Joi.string().optional().allow(null),
                        price: Joi.number().required(),
                        total: Joi.number().required(),
                    })
                ).min(1).required(),
                shipping_address: Joi.object().required(),
                payment_method: Joi.string().valid("COD", "CARD", "UPI", "NETBANKING").required(),
                total_amount: Joi.number().required(),
                transaction_id: Joi.string().optional().allow(null),
            }),
        },

        handler: async (req, res) => {
            try {
                const user_id = req.user._id;
                const { items, shipping_address, payment_method, total_amount, transaction_id } = req.body;

                // Optional: check stock for each item
                for (const item of items) {
                    const product = await db.product.findById(item.product_id);
                    if (!product) return res.status(404).json({ message: `Product not found: ${item.title}` });
                    if (item.quantity > product.stock) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                }

                const order = await db.order.create({
                    user_id,
                    items,
                    shipping_address,
                    payment_method,
                    total_amount,
                    transaction_id: transaction_id || null,
                });

                res.status(201).json({ message: "Order placed successfully", data: order });

            } catch (error) {
                res.status(500).json({ message: "Error creating order", error: error.message });
            }
        },
    },

    getUserOrders: {
        validation: {
            // No params needed for user, since we use token
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
            }),
        },

        handler: async (req, res) => {
            try {
                // ✅ Take user_id from JWT token
                const userId = req.user._id;

                const page = Number(req.query.page) || 0;
                const limit = Number(req.query.limit) || 20;

                const orders = await db.order
                    .find({ user_id: userId })
                    .sort({ createdAt: -1 });

                if (!orders.length)
                    return res.json({ message: "No orders found for this user", orders: [] });

                const start = page * limit;
                const end = start + limit;

                res.json({
                    message: "Your orders fetched successfully",
                    totalOrders: orders.length,
                    page,
                    limit,
                    orders: orders.slice(start, end),
                });
            } catch (error) {
                res.status(500).json({ message: "Error fetching user orders", error: error.message });
            }
        },
    },

    cancelUserOrder: {
        validation: {
            params: Joi.object({
                orderId: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const userId = req.user._id;
                const { orderId } = req.params;

                const order = await db.order.findOne({
                    _id: orderId,
                    user_id: userId, // 🔐 only own order
                });

                if (!order)
                    return res.status(404).json({ message: "Order not found" });

                // ❌ delivered order cancel na thay
                if (order.order_status === "delivered") {
                    return res.status(400).json({
                        message: "Delivered order cannot be cancelled",
                    });
                }

                // already cancelled?
                if (order.order_status === "cancelled") {
                    return res.status(400).json({
                        message: "Order already cancelled",
                    });
                }

                order.order_status = "cancelled";
                order.payment_status =
                    order.payment_status === "paid" ? "refunded" : order.payment_status;

                await order.save();

                res.json({
                    message: "Order cancelled successfully",
                    data: order,
                });
            } catch (error) {
                res.status(500).json({
                    message: "Error cancelling order",
                    error: error.message,
                });
            }
        },
    },


    // admin APi
    getAllOrders: {
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

                const orders = await db.order
                    .find()
                    .populate("user_id", "name email")
                    .sort({ createdAt: -1 });

                const start = page * limit;
                const end = start + limit;

                res.json({
                    message: "Orders fetched successfully",
                    totalOrders: orders.length,
                    page,
                    limit,
                    orders: orders.slice(start, end),
                });

            } catch (error) {
                res.status(500).json({ message: "Error fetching orders", error: error.message });
            }
        },
    },

    updateOrderStatus: {
        validation: {
            params: Joi.object({
                orderId: Joi.string().required(),
            }),
            body: Joi.object({
                order_status: Joi.string().valid("placed", "confirmed", "shipped", "delivered", "cancelled").optional(),
                payment_status: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
            }),
        },

        handler: async (req, res) => {
            try {
                const { orderId } = req.params;
                const { order_status, payment_status } = req.body;

                const order = await db.order.findByIdAndUpdate(
                    orderId,
                    { order_status, payment_status },
                    { new: true }
                );

                if (!order) return res.status(404).json({ message: "Order not found" });

                res.json({ message: "Order updated successfully", data: order });

            } catch (error) {
                res.status(500).json({ message: "Error updating order", error: error.message });
            }
        },
    },

    deleteOrder: {
        validation: {
            params: Joi.object({
                orderId: Joi.string().required(),
            }),
        },

        handler: async (req, res) => {
            try {
                const { orderId } = req.params;

                const order = await db.order.findByIdAndDelete(orderId);

                if (!order) return res.status(404).json({ message: "Order not found" });

                res.json({ message: "Order deleted successfully" });

            } catch (error) {
                res.status(500).json({ message: "Error deleting order", error: error.message });
            }
        },
    },

};
