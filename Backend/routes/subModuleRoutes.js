import express from "express";
import {
  createSubModule,
  getSubModules,
  getSubModuleById,
  updateSubModule,
  deleteSubModule,
} from "../controllers/subModuleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all active sub-modules (available to all authenticated users for navbar rendering)
router.get("/", authMiddleware, getSubModules);

// Get sub-module by ID
router.get("/:id", authMiddleware, getSubModuleById);

// Create sub-module (ADMIN & SUPER ADMIN only)
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), createSubModule);

// Update sub-module (ADMIN & SUPER ADMIN only)
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), updateSubModule);

// Soft delete sub-module (ADMIN & SUPER ADMIN only)
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), deleteSubModule);

export default router;
