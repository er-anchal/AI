import express from "express";
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all active modules (available to all authenticated users for navbar rendering)
router.get("/", authMiddleware, getModules);

// Get module by ID
router.get("/:id", authMiddleware, getModuleById);

// Create module (ADMIN & SUPER ADMIN only)
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), createModule);

// Update module (ADMIN & SUPER ADMIN only)
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), updateModule);

// Soft delete module (ADMIN & SUPER ADMIN only)
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), deleteModule);

export default router;
