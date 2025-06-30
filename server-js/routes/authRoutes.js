const express = require("express");
const {
  addTempUser,
  getTempUser,
  register,
  login,
  sendForgotPasswordOtp,
  verifyOtp,
  resetPassword,
} = require("../contollers/authController");
const router = express.Router();
const upload = require("../middleware/multer");

router.use("/google", require("../oAuth/google"));

router.get("/get-temp-user/:id", getTempUser);

router.post("/add-temp-user", addTempUser);
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/forgot-password", sendForgotPasswordOtp);
router.post("/verify-otp", verifyOtp);
router.use("/reset-password", resetPassword);

module.exports = router;
