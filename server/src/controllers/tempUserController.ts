import redisClient from "../config/redis/client.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";
import generateId from "../utils/generateId.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function addTempUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      res.status(400).send({ subject: "Invalid request" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).send({ subject: "password" });
      return;
    }

    const user = await User.findOne({ email });
    if (user) {
      res.status(409).send({ subject: "email" });
      return;
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

export async function getTempUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    // get the temp user from redis
    const user = JSON.parse((await redisClient.get(`temp_user:${id}`)) || "{}");
    if (!user) {
      res.status(404).send({ message: "Temp user not found" });
      return;
    }

    if (user.authProvider === "local") {
      res.status(200).send({ email: user.email });
      return;
    }

    const response = {
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      avatar: user.picture,
    };

    res.status(200).send(response);
  } catch (err) {
    console.log("Error getting temp user - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
