const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router.route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, passport.authenticate("local", {  // passport.authenticate searchs(on DBs) and response us the username and password and proceed the next step that if exist login else back to login again.
    failureRedirect: '/login', 
    failureFlash: true}), 
    userController.login
  );

// when we use a controller function directly as a callback, we don't need to wrap it in wrapAsync because it is already handled in the controller file.

// here we need to wrap it in wrapAsync because if there is an error in the async function, it will be passed to the next middleware which is the error handler.

// when we use a controller function directly as a callback, we don't need to wrap it in wrapAsync because it is already handled in the controller file.



router.get("/logout", userController.logout); // when we use a controller function directly as a callback, we don't need to wrap it in wrapAsync because it is already handled in the controller file.

module.exports = router;