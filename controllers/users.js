const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Signup handler
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Login form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// Login handler
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome Back to Wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// Logout handler
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/listings");
  });
};

// // --- Forgot Password Feature ---

// Show forgot password form
module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgot-password.ejs");
};

// Handle forgot password submit
module.exports.sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "No account with that email");
    return res.redirect("/forgot-password");
  }

  // Generate token
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  // Send email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    to: user.email,
    from: process.env.GMAIL_USER,
    subject: "Password Reset",
    text: `Click the following link to reset your password: 
http://${req.headers.host}/reset-password/${token}`,
  };

  await transporter.sendMail(mailOptions);

  req.flash("success", "Password reset email sent!");
  res.redirect("/login");
};

// Show reset password form (from token link)
module.exports.renderResetPasswordForm = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash("error", "Password reset token is invalid or expired.");
    return res.redirect("/forgot-password");
  }
  res.render("users/reset-password", { token: req.params.token });
};

// Handle reset password submit
module.exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash("error", "Password reset token is invalid or expired.");
    return res.redirect("/forgot-password");
  }
  if (req.body.password !== req.body.confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect(`/reset-password/${req.params.token}`);
  }
  await user.setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  req.flash("success", "Password has been reset! You can now login.");
  res.redirect("/login");
};
