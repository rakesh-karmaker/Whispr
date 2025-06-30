const { uploadImage } = require("../lib/imagekit");
const User = require("../models/User");
const redisClient = require("../redis/client");
const generateId = require("../utils/generateId");
const { generateSessionId } = require("../utils/generateSesionId");
const { getDate } = require("../utils/getDate");
const bcrypt = require("bcrypt");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../lib/sendEmail");

exports.addTempUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      return res.status(400).send({ subject: "Invalid request" });
    }

    if (password !== confirmPassword) {
      return res.status(400).send({ subject: "password" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).send({ subject: "email" });
    }

    const salt = await bcrypt.genSalt(10); // generate salt of length 10
    const hash = await bcrypt.hash(password, salt);

    // store temp user in redis
    const id = generateId();
    await redisClient.set(
      `temp_user:${id}`,
      JSON.stringify({ email, password: hash, salt, authProvider: "local" })
    );
    await redisClient.expire(`temp_user:${id}`, 60 * 60); // expire in 1 hour

    res.status(200).send({ message: "Temp user added successfully", id });
  } catch (err) {
    console.log("Error adding temp user - ", getDate(), "\n---\n", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

exports.getTempUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Invalid request" });
    }

    // get the temp user from redis
    const user = JSON.parse(await redisClient.get(`temp_user:${id}`));

    if (user.authProvider === "local") {
      return res.status(200).send({ email: user.email });
    }

    const response = {
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      avatar: user.picture,
    };

    return res.status(200).send(response);
  } catch (err) {
    console.log("Error getting temp user - ", getDate(), "\n---\n", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    const { id, email, firstName, lastName } = req.body;
    if (!id || !email || !firstName || !lastName) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    // get the avatar url of the user
    let avatar = null;
    let imgId = null;
    if (req.body.avatar) {
      avatar = req.body.avatar; // use the avatar url from google
    } else {
      if (!req.file) {
        return res
          .status(400)
          .send({ subject: "request", message: "Invalid request" });
      }

      const { url, imgId: imageId } = await uploadImage(res, req.file, true);
      avatar = url;
      imgId = imageId;
    }

    // get the temp user from redis
    const tempUser = JSON.parse(await redisClient.get(`temp_user:${id}`));
    if (!tempUser) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    let user = null;
    const userData = {
      name: tempUser.name || `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      avatar,
      imgId,
      authProvider: tempUser.authProvider,
    };

    if (tempUser.authProvider == "local") {
      const hashedPassword = tempUser.password;
      const salt = tempUser.salt;

      user = await User.create({
        ...userData,
        password: hashedPassword,
        salt,
      });
    } else if (tempUser.authProvider == "google") {
      user = await User.create({
        ...userData,
        googleId: tempUser.id,
      });
    }

    const sessionId = await generateSessionId();
    const sessionData = {
      id: sessionId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      firstName: user.firstName,
      authProvider: user.authProvider,
    };

    // store session data in redis
    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData));
    await redisClient.expire(`session:${sessionId}`, 60 * 60 * 24 * 30); // 30 days

    console.log("User registered successfully -", getDate(), "\n---\n");

    // delete the temp user from redis
    await redisClient.del(`temp_user:${id}`);

    return res.status(200).send({ sessionId });
  } catch (err) {
    console.log("Error registering user - ", getDate(), "\n---\n", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ subject: "email", message: "Email not found" });
    }

    if (!user.password) {
      return res
        .status(400)
        .send({ subject: "noPassword", message: "Password not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .send({ subject: "password", message: "Invalid password" });
    }

    const sessionId = await generateSessionId();
    const sessionData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      firstName: user.firstName,
      authProvider: user.authProvider,
    };

    // store session data in redis
    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData));
    await redisClient.expire(`session:${sessionId}`, 60 * 60 * 24 * 30); // 30 days

    console.log("User logged in successfully -", getDate(), "\n---\n");

    return res.status(200).send({ sessionId });
  } catch (err) {
    console.log("Error logging in user - ", getDate(), "\n---\n", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

exports.sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ subject: "email", message: "Email not found" });
    }

    if (!user.password) {
      return res
        .status(400)
        .send({ subject: "noPassword", message: "Password not found" });
    }

    //delete old otp
    await redisClient.del(`forgot_password_otp:${email}`);

    const otp = generateOTP();
    //send email
    await sendEmail(email, otp);

    //save otp
    const hashedOTP = await bcrypt.hash(otp, 10);
    await redisClient.set(`forgot_password_otp:${email}`, hashedOTP);
    await redisClient.expire(`forgot_password_otp:${email}`, 60 * 60 * 1000); // 1 hour

    res.status(200).send({ message: "OTP sent", email });
  } catch (err) {
    console.log(
      "Error sending forgot password otp - ",
      getDate(),
      "\n---\n",
      err
    );
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    const storedOTP = await redisClient.get(`forgot_password_otp:${email}`);
    if (!storedOTP) {
      return res.status(400).send({ subject: "otp", message: "OTP not found" });
    }

    const isOTPValid = await bcrypt.compare(otp, storedOTP);
    if (!isOTPValid) {
      return res.status(400).send({ subject: "otp", message: "Invalid OTP" });
    }

    const token = generateId();

    await redisClient.set(`forgot_password_token:${token}`, email);
    await redisClient.expire(`forgot_password_token:${token}`, 60 * 60 * 1000); // 1 hour

    await redisClient.del(`forgot_password_otp:${email}`);

    res.status(200).send({ token });
  } catch (err) {
    console.log("Error verifying OTP - ", getDate(), "\n---\n", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword || !req.body.email) {
      return res
        .status(400)
        .send({ subject: "request", message: "Invalid request" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .send({ subject: "password", message: "Passwords do not match" });
    }

    const email = await redisClient.get(`forgot_password_token:${token}`);
    if (!email || email !== req.body.email) {
      return res
        .status(400)
        .send({ subject: "token", message: "Token not found" });
    }

    const salt = await bcrypt.genSalt(10); // generate salt of length 10
    const hash = await bcrypt.hash(password, salt);

    await User.findOneAndUpdate({ email }, { password: hash, salt });

    await redisClient.del(`forgot_password_token:${token}`);

    res.status(200).send({ message: "Password reset successfully" });
  } catch (err) {
    console.log("Error resetting password - ", getDate(), "\n---\n", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};
