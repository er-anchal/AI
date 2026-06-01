import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserById,
  toggleUserStatus,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.get("/users", authMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), updateUserById);
router.put("/users/:id/status", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), toggleUserStatus);
export default router;
