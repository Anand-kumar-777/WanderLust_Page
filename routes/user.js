const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/users.js");

//Signup route
router
 .route("/signup")
 .get(userController.renderSignupForm)
 .post(wrapAsync (userController.signup));

//Login Route
router
 .route("/login")
 .get(userController.renderLoginForm)
 .post(saveRedirectUrl,
    passport.authenticate("local",
     {failureRedirect : "/login", failureFlash : true}), userController.login);


router
  .route("/forgot-password")
  .get(userController.renderForgotPasswordForm)
  .post(wrapAsync(userController.sendResetPasswordEmail));

router
  .route("/reset-password/:token")
  .get(userController.renderResetPasswordForm)
  .post(wrapAsync(userController.resetPassword));





router.get("/logout", userController.logout)

module.exports = router;