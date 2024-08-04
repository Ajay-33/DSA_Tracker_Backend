import express from "express";
import userAuth from "../middlewares/authmiddleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
  DeleteCategory,
  UpdateCategory,
  addCategory,
  getCategories,
  getCategory,
} from "../controllers/categoryControllers.js";

const router = express.Router();

router.post("/add", userAuth,authorizeRoles("Admin", "Super Admin"),addCategory);

router.get("/show", userAuth, getCategories);

router.get("/show/:id", userAuth, getCategory);

router.patch("/update/:id", userAuth,authorizeRoles("Admin", "Super Admin"), UpdateCategory);

router.delete("/delete/:id", userAuth,authorizeRoles("Admin", "Super Admin"), DeleteCategory);

export default router;
