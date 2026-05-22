import express from "express";
import {
  createRoleAccess,
  getRoleAccessList,
  getUserAccess,
  updateRoleAccess,
} from "../controllers/roleAccessController.js";

const router = express.Router();

router.post("/", createRoleAccess);
router.get("/", getRoleAccessList);
router.get("/:id", getUserAccess);
router.put("/:id", updateRoleAccess);

export default router;
