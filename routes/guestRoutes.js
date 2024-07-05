import express from "express";
import { getAllCategories, guestCategoriesData } from "../controllers/guestControllers.js";

const router = express.Router();

router.get("/get-all-categories", getAllCategories);

router.get("/get-categories-data-guest/:id", guestCategoriesData);

export default router;
