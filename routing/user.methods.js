const express = require("express")
const userMethods = express.Router()

const { validation, auth } = require("../middleware");
const { userController } = require("../controller");
const { upload } = require("../helper");
const { ROLE } = require("../middleware/enum");

// 1 : user sathe admin pn ani profile update kari sake

// public API
userMethods.post("/add-user", upload.single("profile_img"), validation(userController.addUser.validation), userController.addUser.handler);
userMethods.post("/login-user", validation(userController.loginUser.validation), userController.loginUser.handler);
userMethods.post("/login-admin", validation(userController.loginAdmin.validation), userController.loginAdmin.handler);
    // forgot password
    userMethods.put("/forgot/request-otp", validation(userController.requestOtp.validation), userController.requestOtp.handler);
    userMethods.put("/forgot/verify-otp", validation(userController.verifyOtp.validation), userController.verifyOtp.handler);
    userMethods.put("/forgot/reset-password", validation(userController.forgotResetPassword.validation), userController.forgotResetPassword.handler);


// user API
userMethods.put("/update-user", auth([ROLE.US]), upload.single("profile_img"), validation(userController.updateUser.validation), userController.updateUser.handler);
userMethods.put("/reset-password", auth([ROLE.US]), validation(userController.resetPassword.validation), userController.resetPassword.handler);


//admin API
userMethods.get("/get-user", auth([ROLE.AD]), validation(userController.getUser.validation), userController.getUser.handler);


module.exports = userMethods;