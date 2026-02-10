const express = require("express")
const orderMethods = express.Router()

const { validation, auth } = require("../middleware");
const { orderController } = require("../controller");
const { upload } = require("../helper");
const { ROLE } = require("../middleware/enum");

// user
orderMethods.post("/createOrder", auth([ROLE.US]), validation(orderController.createOrder.validation), orderController.createOrder.handler);
orderMethods.get("/getUserOrder", auth([ROLE.US]), validation(orderController.getUserOrders.validation), orderController.getUserOrders.handler);
orderMethods.put("/cancelOrder/:orderId",auth([ROLE.US]),validation(orderController.cancelUserOrder.validation),orderController.cancelUserOrder.handler);


// admin
orderMethods.get("/getAllUserOrder", auth([ROLE.AD]), validation(orderController.getAllOrders.validation), orderController.getAllOrders.handler);
orderMethods.put("/updateOrderStatus/:orderId", auth([ROLE.AD]), validation(orderController.updateOrderStatus.validation), orderController.updateOrderStatus.handler);
orderMethods.delete("/deleteOrder/:orderId", auth([ROLE.AD]), validation(orderController.deleteOrder.validation), orderController.deleteOrder.handler);

module.exports = orderMethods;