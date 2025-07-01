import redisClient from "@/config/redis/client.js";
import { uploadImage } from "@/lib/imagekit.js";
import User from "@/models/user.js";
import generateId from "@/utils/generateId.js";
import generateSessionId from "@/utils/generateSessionId.js";
import getDate from "@/utils/getDate.js";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

export async function addTempUser(req: Request, res: Response) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function getTempUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Invalid request" });
    }

    // get the temp user from redis
    const user = JSON.parse((await redisClient.get(`temp_user:${id}`)) || "{}");
    if (!user) {
      return res.status(404).send({ message: "Temp user not found" });
    }

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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function register(req: Request, res: Response) {
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

      // upload the avatar image
      const data = await uploadImage(res, req.file, true);
      if (
        data &&
        typeof data === "object" &&
        "url" in data &&
        "imgId" in data
      ) {
        avatar = data.url;
        imgId = data.imgId;
      } else {
        return res.status(500).send({ message: "Image upload failed" });
      }
    }

    // get the temp user from redis
    let tempUser = JSON.parse(
      (await redisClient.get(`temp_user:${id}`)) || "{}"
    );
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
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
      firstName: user?.firstName,
      authProvider: user?.authProvider,
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function login(req: Request, res: Response) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
