import express from "express";
import {
  saveUserDesign,
  getUserDesigns,
  getUserDesignById,
  updateUserDesign,
  deleteUserDesign,
} from "../controllers/userDesignController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are user-scoped via authMiddleware
router.post("/", authMiddleware, saveUserDesign); // create design
router.get("/", authMiddleware, getUserDesigns); // get my designs
router.get("/:id", authMiddleware, getUserDesignById); // get one design
router.put("/:id", authMiddleware, updateUserDesign); // update name/canvas
router.put("/rename/:id", authMiddleware, updateUserDesign); // update name
router.delete("/:id", authMiddleware, deleteUserDesign); // delete design

export default router;
