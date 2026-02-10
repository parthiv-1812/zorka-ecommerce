const express = require("express");
const categoryMethods = express.Router()

const { validation, auth } = require("../middleware");
const { categoryController } = require("../controller");
const { upload } = require("../helper");
const { ROLE } = require("../middleware/enum");

// public API
categoryMethods.get("/get-category", validation(categoryController.getCategories.validation), categoryController.getCategories.handler);
categoryMethods.get("/get-categoryById/:id", validation(categoryController.getCategoryById.validation), categoryController.getCategoryById.handler);

// admin API
categoryMethods.post("/add-category", auth([ROLE.AD]), upload.single("categoryImage"), validation(categoryController.addCategory.validation), categoryController.addCategory.handler);
categoryMethods.put("/update-category/:id", auth([ROLE.AD]), upload.single("categoryImage"), validation(categoryController.updateCategory.validation), categoryController.updateCategory.handler);
categoryMethods.delete("/delete-category/:id", auth([ROLE.AD]), validation(categoryController.deleteCategory.validation), categoryController.deleteCategory.handler);

module.exports = categoryMethods;