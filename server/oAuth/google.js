const express = require("express");
const axios = require("axios");
const redisClient = require("../redis/client");
const generateId = require("../utils/generateId");
const User = require("../models/User");
const { generateSessionId } = require("../utils/generateSesionId");
require("dotenv").config();

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.SERVER_URL}/auth/google/callback`;
const CLIENT_URL = process.env.CLIENT_URL;

router.get("/", (req, res) => {
  const redirect = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(redirect);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const accessToken = data.access_token;

  const userInfo = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let response = {
    new: false,
  };

  const user = await User.findOne({ email: userInfo.data.email });
  if (user) {
    if (!user.googleId) {
      user.googleId = userInfo.data.id;
      user.authProvider = user.password ? "both" : "google";
      await user.save();
    }

    const sessionId = await generateSessionId();

    // store session data in redis
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        firstName: user.firstName,
        authProvider: user.authProvider,
      })
    );
    await redisClient.expire(`session:${sessionId}`, 3600 * 24 * 30); // 30 days

    response.sessionId = sessionId;
  } else {
    response.new = true;

    const id = generateId();
    response.redisId = id;

    userInfo.data.authProvider = "google";
    await redisClient.set(`temp_user:${id}`, JSON.stringify(userInfo.data));
    await redisClient.expire(`temp_user:${id}`, 3600); // 1 hour
  }

  res.send(`
    <script>
      window.opener.postMessage(
        { user: ${JSON.stringify(response)} },
        "${CLIENT_URL.toString()}"
      );
      window.close();
    </script>
  `);
});

module.exports = router;
