import config from "./config.js";
import nodemailer from "nodemailer";

const mailSender = nodemailer.createTransport({
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

export default mailSender;
