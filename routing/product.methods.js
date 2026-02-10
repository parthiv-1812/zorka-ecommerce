const express = require("express")
const productMethods = express.Router()

const { validation, auth } = require("../middleware");
const { productController } = require("../controller");
const { upload } = require("../helper");
const { ROLE } = require("../middleware/enum");

// 1 : user login hoi to ani wishlist ma product add hoi to porduct ma add flag 
// 2 : delte na badle active || deactive karvani 

// public API
productMethods.get(
    "/get-product",
    auth([ROLE.US], true), // 👈 OPTIONAL LOGIN
    validation(productController.getProduct.validation),
    productController.getProduct.handler
);

productMethods.get("/get-productById/:id", validation(productController.getProductById.validation), productController.getProductById.handler);

// admin API
productMethods.post("/add-product", auth([ROLE.AD]), upload.array("productImage"), validation(productController.addProduct.validation), productController.addProduct.handler);
productMethods.put("/update-product/:id", auth([ROLE.AD]), upload.array("productImage"), validation(productController.updateProduct.validation), productController.updateProduct.handler);
productMethods.delete("/delete-product/:id", auth([ROLE.AD]), validation(productController.deleteProduct.validation), productController.deleteProduct.handler);

module.exports = productMethods;