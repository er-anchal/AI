import express from "express";
import {
  createRoleAccess,
  getRoleAccessList,
  getUserAccess,
  updateRoleAccess,
  getRoleAccessByRole,
} from "../controllers/roleAccessController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Fetching own role settings (needed for session initialization)
router.get("/role/:roleName", authMiddleware, getRoleAccessByRole);
router.get("/:id", authMiddleware, getUserAccess);

// Full list query and saving/editing (restricted to ADMIN & SUPER ADMIN)
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), getRoleAccessList);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), createRoleAccess);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "SUPER ADMIN"]), updateRoleAccess);

export default router;
