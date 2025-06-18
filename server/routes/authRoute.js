const express = require("express");
const { addTempUser, getTempUser } = require("../contollers/authController");
const router = express.Router();

router.use("/google", require("../oAuth/google"));

router.get("/get-temp-user/:id", getTempUser);

router.post("/add-temp-user", addTempUser);

module.exports = router;
