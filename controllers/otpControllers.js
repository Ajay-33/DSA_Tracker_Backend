import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import OTPModel from "../models/OTPModel.js";
import usermodel from "../models/usermodel.js";

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const mailOptions = {
    from: "a2zdsatracker@gmail.com",
    to: email,
    subject: "Your OTP Code",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dddddd; border-radius: 5px;">
        <p style="font-size: 16px; color: #333333;">Hello,</p>
        <p style="font-size: 16px; color: #333333;">
          Your Verification code for A2Z DSA Tracker is 
          <strong style="font-size: 18px; color: #ff6600;">${otp}</strong>.
        </p>
        <p style="font-size: 16px; color: #333333;">
          Please note that this code will expire in <strong>10 minutes</strong>.
        </p>
        <p style="font-size: 16px; color: #333333;">
          Thank you for using A2Z DSA Tracker.
        </p>
      </div>
    </div>
    `,
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
    const otpExpiration = Date.now() + 10 * 60 * 1000;

    // Save OTP to the database
    await sendOtpEmail(email, otp);
    let otpRecord = await OTPModel.findOne({ email });
    if (otpRecord) {
      otpRecord.otp = hashedOtp;
      otpRecord.expiresAt = otpExpiration;
      await otpRecord.save();
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

export const passwordOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Enter Valid Email" });
    }
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email doesnot exist,Please Signup" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiration = Date.now() + 10 * 60 * 1000;

    // Save OTP to the database
    await sendOtpEmail(email, otp);
    let otpRecord = await OTPModel.findOne({ email });
    if (otpRecord) {
        otpRecord.otp = hashedOtp;
        otpRecord.expiresAt = otpExpiration;
        await otpRecord.save();
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
