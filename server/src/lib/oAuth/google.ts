import express, { Request, Response } from "express";
import axios from "axios";
import redisClient from "@/config/redis/client.js";
import generateId from "@/utils/generateId.js";
import generateSessionId from "@/utils/generateSessionId.js";
import config from "@/config/config.js";
import User from "@/models/user.js";
import { IUser } from "@/types/userType.js";

const router = express.Router();

const CLIENT_ID = config.googleClientId;
const CLIENT_SECRET = config.googleClientSecret;
const REDIRECT_URI = `${config.serverUrl}/auth/google/callback`;
const CLIENT_URL = config.clientUrl;

type AuthResponse = {
  new: boolean;
  sessionId?: string;
  redisId?: string;
};

router.get("/", (req: Request, res: Response): void => {
  const redirect = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(redirect);
});

router.get("/callback", async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;

  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const accessToken = data.access_token as string;

  const userInfo = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let response: AuthResponse = {
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

export default router;
