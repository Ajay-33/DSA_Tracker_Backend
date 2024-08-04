import express from "express";
import userAuth from "../middlewares/authmiddleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
  addPredefinedEmailsController,
  deleteUser,
  editRole,
  getUsers,
  loginController,
  passwordController,
  registerController,
  removePredefinedEmailsController,
} from "../controllers/authControllers.js";
const router = express.Router();

// routes
// REGISTER
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

// Get Users
router.get("/users",userAuth,authorizeRoles("Admin", "Super Admin"), getUsers);
router.post("/change-password", passwordController);

// Delete User
router.delete("/users/delete/:id", userAuth,authorizeRoles("Super Admin"), deleteUser);

// Edit Role
router.patch("/users/update/:id", userAuth,authorizeRoles("Super Admin"), editRole);

// Admin Emails
router.post("/adminEmails/add", userAuth,authorizeRoles("Super Admin"),addPredefinedEmailsController);
router.delete(
  "/adminEmails/delete",
  userAuth,
  authorizeRoles("Super Admin"),
  removePredefinedEmailsController
);

export default router;
