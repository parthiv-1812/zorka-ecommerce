const express = require("express")
const wishlistMethods = express.Router()

const { validation, auth } = require("../middleware");
const { wishlistController } = require("../controller");
const { ROLE } = require("../middleware/enum");

// user API
wishlistMethods.post("/addRemoveWishlist", auth([ROLE.US]),validation(wishlistController.addRemoveWishlist.validation),wishlistController.addRemoveWishlist.handler);
wishlistMethods.get("/getWishlist", auth([ROLE.US]),validation(wishlistController.getWishlist.validation),wishlistController.getWishlist.handler);
wishlistMethods.delete("/clearWishlist", auth([ROLE.US]),validation(wishlistController.clearWishlist.validation),wishlistController.clearWishlist.handler);

module.exports = wishlistMethods;