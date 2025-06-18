const User = require("../models/User");
const redisClient = require("../redis/client");
const generateId = require("../utils/generateId");
const { getDate } = require("../utils/getDate");
const bcrypt = require("bcrypt");

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
