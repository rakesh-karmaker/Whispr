import redisClient from "@/config/redis/client.js";
import sendEmail from "@/lib/sendEmail.js";
import User from "@/models/user.js";
import generateOTP from "@/utils/generateOtp.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import getDate from "@/utils/getDate.js";
import generateId from "@/utils/generateId.js";

export async function sendForgotPasswordOtp(req: Request, res: Response) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function verifyOtp(req: Request, res: Response) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function resetPassword(req: Request, res: Response) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
