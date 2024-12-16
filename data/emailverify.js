import nodemailer from "nodemailer";
import { userData } from "./index.js";
import validation from "../validation.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (userId, email) => {
  userId = validation.validateString(userId, "userId", true);
  try {
    email = validation.validateEmail(email);
  } catch (e) {
    throw [
      "You must have a valid email address before trying to verify email!",
    ];
  }
  const user = await userData.getUserProfileById(userId);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Email verification code: ${otp}`,
    text: `Hello ${user.username}, your email verification OTP is ${otp}. This otp expires in 5 minutes.`,
  };

  await userData.setOtp(userId, otp);

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, otp };
  } catch (e) {
    throw ["Sending OTP to Email Failed!"];
  }
};

export default { sendVerificationEmail };
