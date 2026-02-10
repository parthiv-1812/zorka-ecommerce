const express = require("express")
const cartMethods = express.Router()

const { validation, auth } = require("../middleware");
const { cartController } = require("../controller");
const { ROLE } = require("../middleware/enum");

// user API
cartMethods.post("/addCart", auth([ROLE.US]), validation(cartController.addToCart.validation), cartController.addToCart.handler);
cartMethods.get("/getCart", auth([ROLE.US]), validation(cartController.getCartItem.validation), cartController.getCartItem.handler);
cartMethods.put("/updateCartItem", auth([ROLE.US]), validation(cartController.updateCartItem.validation), cartController.updateCartItem.handler);
cartMethods.delete("/deleteCartItem/:id", auth([ROLE.US]), validation(cartController.deleteCartItem.validation), cartController.deleteCartItem.handler);

module.exports = cartMethods;