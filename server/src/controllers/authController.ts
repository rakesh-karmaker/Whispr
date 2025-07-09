import redisClient from "@/config/redis/client.js";
import { uploadFile } from "@/lib/upload.js";
import User from "@/models/User.js";
import getDate from "@/utils/getDate.js";
import { signJWTToken } from "@/utils/JWTToken.js";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

const MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 1 month

export async function register(req: Request, res: Response): Promise<void> {
  try {
    if (!req.body) {
      res.status(400).send({ subject: "request", message: "Invalid request" });
      return;
    }

    const { id, email, firstName, lastName } = req.body;
    if (!id || !email || !firstName || !lastName) {
      res.status(400).send({ subject: "request", message: "Invalid request" });
      return;
    }

    // get the avatar url of the user
    let avatar = null;
    let publicId = null;
    if (req.body.avatar) {
      avatar = req.body.avatar; // use the avatar url from google
    } else {
      if (!req.file) {
        res
          .status(400)
          .send({ subject: "request", message: "Invalid request" });
        return;
      }

      // upload the avatar image
      const data = await uploadFile(res, req.file, "avatar", 600, 600);
      if (
        data &&
        typeof data === "object" &&
        "url" in data &&
        "publicId" in data
      ) {
        avatar = data.url;
        publicId = data.publicId;
      } else {
        res.status(500).send({ message: "Image upload failed" });
        return;
      }
    }

    // get the temp user from redis
    let tempUser = JSON.parse(
      (await redisClient.get(`temp_user:${id}`)) || "{}"
    );
    if (!tempUser) {
      res.status(400).send({ subject: "request", message: "Invalid request" });
      return;
    }

    let user = null;
    const userData = {
      name: tempUser.name || `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      avatar,
      publicId,
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

    const userId = user?._id.toString() || "";

    // set the cookie
    res.cookie("token", signJWTToken({ id: userId }), {
      maxAge: MAX_AGE,
      secure: true,
      sameSite: "none",
    });

    // delete the temp user from redis
    await redisClient.del(`temp_user:${id}`);

    console.log("User registered successfully -", getDate(), "\n---\n");

    res.status(201).send({
      id: userId,
      name: user?.name,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      avatar: user?.avatar,
      pinnedContacts: user?.pinnedContacts,
      authProvider: user?.authProvider,
    });
  } catch (err) {
    console.log("Error registering user - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send({ subject: "request", message: "Invalid request" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({ subject: "email", message: "Email not found" });
      return;
    }

    if (!user.password) {
      res
        .status(400)
        .send({ subject: "noPassword", message: "Password not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(400)
        .send({ subject: "password", message: "Invalid password" });
      return;
    }

    // set the cookie
    res.cookie("token", signJWTToken({ id: user._id.toString() }), {
      maxAge: MAX_AGE,
      secure: true,
      sameSite: "none",
    });

    console.log("User logged in successfully -", getDate(), "\n---\n");

    res.status(200).send({
      id: user._id.toString(),
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      pinnedContacts: user.pinnedContacts,
      authProvider: user.authProvider,
    });
  } catch (err) {
    console.log("Error logging in user - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const id = req.userId;
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    res.status(200).send({
      id: user._id.toString(),
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      pinnedContacts: user.pinnedContacts,
      authProvider: user.authProvider,
    });
  } catch (err) {
    console.log("Error getting user - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
