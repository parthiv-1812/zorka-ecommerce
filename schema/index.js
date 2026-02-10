const user = require("./user.schema")
const category = require("./category.schema")
const product = require("./product.schema")
const cart = require("./cart.schema")
const wishlist = require("./wishlist.schema")
const order = require("./order.schema")
const review = require("./review.schema")

module.exports = {
    user: user,
    category: category,
    product: product,
    cart: cart,
    wishlist: wishlist,
    order: order,
    review: review
}