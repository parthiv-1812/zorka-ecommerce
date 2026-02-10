const userController = require("./user.controller")
const categoryController = require("./category.controller")
const productController = require("./product.controller")
const cartController = require("./cart.controller")
const wishlistController = require("./wishlist.controller")
const orderController = require("./order.controller")
const reviewController = require("./review.controller")

module.exports = {
    userController: userController,
    categoryController: categoryController,
    productController: productController,
    cartController: cartController,
    wishlistController: wishlistController,
    orderController: orderController,
    reviewController: reviewController
}