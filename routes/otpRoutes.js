import express from "express";

import { sendOtpController} from "../controllers/otpControllers.js";

const router = express.Router();

router.post('/signup', sendOtpController);

export default router;