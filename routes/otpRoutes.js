import express from "express";

import {
  passwordOtp,
  sendOtpController,
} from "../controllers/otpControllers.js";

const router = express.Router();

router.post("/signup", sendOtpController);
router.post("/password", passwordOtp);

export default router;
