const express = require("express");
const axios = require("axios");
const redisClient = require("../redis/client");
const generateId = require("../utils/generateId");
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

  const user = userInfo.data;
  res.send(`
  <script>
    window.opener.postMessage(
      { user: ${JSON.stringify(user)} },
      "${CLIENT_URL.toString()}"
    );
    window.close();
  </script>
`);
});

router.get("/get-user/:id", async (req, res) => {
  const id = req.params.id;

  const user = JSON.parse(await redisClient.get(`temp_user:${id}`));

  if (!user) return res.status(404).send({ message: "User not found" });

  res.send(user);
});

module.exports = router;
