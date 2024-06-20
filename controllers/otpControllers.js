import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import OTPModel from "../models/OTPModel.js";
import usermodel from "../models/usermodel.js";

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "ajayumsa@gmail.com",
      pass: "ygxq krbm ktcd einf",
    },
  });

  const mailOptions = {
    from: "a2zdsatracker@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your Verification code for A2Z DSA Tracker is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOtpController = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Enter Valid Email" });
    }
    const user = await usermodel.findOne({ email });
    if (user) {
      return res.status(404).json({ message: "Email already exists" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiration = Date.now() + 30 * 60 * 1000;

    // Save OTP to the database
    await sendOtpEmail(email, otp);
    let otpRecord = await OTPModel.findOne({ email });
    if (otpRecord) {
      // If OTP is expired, update it
      if (Date.now() > otpRecord.expiresAt) {
        otpRecord.otp = hashedOtp;
        otpRecord.expiresAt = otpExpiration;
        await otpRecord.save();
      }
    } else {
      // Save new OTP to the database
      await OTPModel.create({
        email: email,
        otp: hashedOtp,
        expiresAt: otpExpiration,
      });
    }
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};