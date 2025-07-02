import config from "@/config/config.js";
import otpDraft from "@/utils/otpDraft.js";
import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.mailAddress,
    pass: config.mailPass,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Test the transporter
transporter.verify((error, success) => {
  if (error) {
    console.log(error, "email");
  } else {
    console.log("Server is ready to take our messages");
  }
});

export default async function sendEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: config.mailAddress,
      to: email,
      subject: "Password Reset OTP",
      html: otpDraft(otp),
    });
    return;
  } catch (err) {
    console.log("Error sending email - ", new Date(), "\n---\n", err);
  }
}
