import express from "express";
import userAuth from "../middlewares/authmiddleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
  addQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
} from "../controllers/questionControllers.js";

const router = express.Router();

router.post("/add/:cid", userAuth,authorizeRoles("Admin", "Super Admin"),addQuestion);

router.get("/show", userAuth, getAllQuestions);

router.get("/show/:id", userAuth, getQuestionById);

router.patch("/update/:id", userAuth,authorizeRoles("Admin", "Super Admin"), updateQuestion);

router.delete("/delete/:id/:cid", userAuth,authorizeRoles("Admin", "Super Admin"),deleteQuestion);

export default router;
