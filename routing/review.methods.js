const express = require("express")
const reviewMethods = express.Router()

const { validation, auth } = require("../middleware");
const { reviewController } = require("../controller");
const { ROLE } = require("../middleware/enum");

// user API
reviewMethods.post("/addReview", auth([ROLE.US]), validation(reviewController.addReview.validation), reviewController.addReview.handler);

// public API
reviewMethods.get("/getProductReview/:productId", validation(reviewController.getProductReviews.validation), reviewController.getProductReviews.handler);

module.exports = reviewMethods;
