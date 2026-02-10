const Joi = require("joi");
const db = require("../schema");

module.exports = {

    addToCart: {
        validation: {
            body: Joi.object({
                product_id: Joi.string().required(),
                quantity: Joi.number().min(1).required(),
                size: Joi.string().optional().allow(null),
                color: Joi.string().optional().allow(null),
            }),
        },

        handler: async (req, res) => {
            try {
                const { product_id, quantity, size, color } = req.body;
                const user_id = req.user._id;

                const product = await db.product.findById(product_id);
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }

                if (quantity > product.stock) {
                    return res.status(400).json({ message: "Insufficient stock" });
                }

                let cart = await db.cart.findOne({ user_id });

                if (!cart) {
                    cart = await db.cart.create({
                        user_id,
                        items: [{ product_id, quantity, size, color }],
                    });

                    return res.status(201).json({
                        message: "Product added to cart",
                        data: cart,
                    });
                }

                const index = cart.items.findIndex(
                    (i) =>
                        i.product_id.toString() === product_id &&
                        i.size === size &&
                        i.color === color
                );

                if (index > -1) {
                    cart.items[index].quantity += quantity;
                } else {
                    cart.items.push({ product_id, quantity, size, color });
                }

                await cart.save();

                res.json({
                    message: "Cart updated successfully",
                    data: cart,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error adding to cart",
                    error: error.message,
                });
            }
        },
    },

    getCartItem: {
        validation: {
            query: Joi.object({
                page: Joi.number().default(0),
                limit: Joi.number().default(20),
                search: Joi.string().optional(),
            }),
        },

        handler: async (req, res) => {
            try {
                const { search } = req.query;

                const pageNum = Number(req.query.page) || 0;
                const limitNum = Number(req.query.limit) || 20;

                const cart = await db.cart
                    .findOne({ user_id: req.user._id })
                    .populate({
                        path: "items.product_id",
                        match: search
                            ? { name: { $regex: search, $options: "i" } }
                            : {},
                    });

                if (!cart || !cart.items.length) {
                    return res.json({
                        message: "Cart empty",
                        items: [],
                        cartTotal: 0,
                    });
                }

                let cartTotal = 0;

                const items = cart.items
                    .filter(i => i.product_id) // search mismatch fix
                    .map((item) => {

                        const product = item.product_id;

                        // 🔥 PRICE LOGIC (discount support)
                        const price =
                            product.discountPrice && product.discountPrice > 0
                                ? product.discountPrice
                                : product.price;

                        const itemTotal = price * item.quantity;
                        cartTotal += itemTotal;

                        return {
                            _id: item._id,
                            product,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color,

                            originalPrice: product.price,
                            discountPrice: product.discountPrice || null,
                            finalPrice: price,

                            itemTotal,
                        };
                    });

                const start = pageNum * limitNum;
                const end = start + limitNum;

                res.json({
                    message: "Cart fetched successfully",
                    totalItems: items.length,
                    page: pageNum,
                    limit: limitNum,
                    cartTotal,
                    items: items.slice(start, end),
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error fetching cart",
                    error: error.message,
                });
            }
        },
    },

    updateCartItem: {
        validation: {
            body: Joi.object({
                product_id: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                size: Joi.string().optional().allow(null),
                color: Joi.string().optional().allow(null),
            }),
        },

        handler: async (req, res) => {
            try {
                const { product_id, quantity, size, color } = req.body;
                const user_id = req.user._id;

                const cart = await db.cart.findOne({ user_id });
                if (!cart) {
                    return res.status(404).json({
                        message: "Cart not found",
                    });
                }

                // 2️⃣ product check (stock validation)
                const product = await db.product.findById(product_id);
                if (!product) {
                    return res.status(404).json({
                        message: "Product not found",
                    });
                }

                if (quantity > product.stock) {
                    return res.status(400).json({
                        message: "Requested quantity exceeds available stock",
                    });
                }

                // 3️⃣ find same product + variant
                const item = cart.items.find(
                    (i) =>
                        i.product_id.toString() === product_id &&
                        i.size === size &&
                        i.color === color
                );

                if (!item) {
                    return res.status(404).json({
                        message: "This product with selected size/color is not in cart",
                    });
                }

                // 4️⃣ update quantity
                item.quantity = quantity;
                await cart.save();

                res.json({
                    message: "Cart item quantity updated successfully",
                    data: cart,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error updating cart",
                    error: error.message,
                });
            }
        },
    },

    deleteCartItem: {
        validation: {
            params: Joi.object({
                id: Joi.string().required(), // id = cart item _id
            }),
        },

        handler: async (req, res) => {
            try {
                const user_id = req.user._id;
                const { id } = req.params; // this is cart item _id

                const cart = await db.cart.findOneAndUpdate(
                    { user_id },
                    { $pull: { items: { _id: id } } }, // remove item by cart item _id
                    { new: true }
                );

                if (!cart) {
                    return res.status(404).json({ message: "Cart not found" });
                }

                res.json({
                    message: "Item removed from cart",
                    data: cart,
                });

            } catch (error) {
                res.status(500).json({
                    message: "Error deleting item",
                    error: error.message,
                });
            }
        },
    },

};
