const express = require("express")
const zorka = express.Router()

const userMethods = require("./user.methods")
const productMethods = require("./product.methods")
const cartMethods = require("./cart.methods")
const wishlistMethods = require("./wishlist.methods")
const orderMethods = require("./order.methods")
const reviewMethods = require("./review.methods")
const categoryMethods = require("./category.methods")

zorka.use("/user",userMethods);
zorka.use("/category",categoryMethods);
zorka.use("/product",productMethods);
zorka.use("/cart",cartMethods);
zorka.use("/wishlist",wishlistMethods);
zorka.use("/order",orderMethods);
zorka.use("/review",reviewMethods);

module.exports = zorka;