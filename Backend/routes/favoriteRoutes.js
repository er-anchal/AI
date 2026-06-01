// routes/favorites.js
import express from "express";
import Favorite from "../models/Favorite.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { canvasJson, templateId, type, width, height, thumbnail } = req.body;
    // console.log(canvasJson, templateId, type, width, height, thumbnail);

    if (!canvasJson) {
      return res.status(400).json({ message: "Canvas JSON is required" });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      templateId: templateId || null,
      canvasJson,
      type,
      width,
      height,
      thumbnail,
    });

    return res.status(201).json({
      message: "Saved to favorites",
      favorite,
    });
  } catch (err) {
    console.error("Save favorite error:", err);
    return res.status(500).json({ message: "Failed to save favorite" });
  }
});

/**
 * Get user's favorites
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    // console.log(req.user);
    const favorites = await Favorite.find({
      userId: req.user._id,
      isActive: 0,
    }).sort({ createdAt: -1 });

    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

/**
 * Soft delete favorite
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const design = await Favorite.findById(id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    await Favorite.findByIdAndUpdate(id, {
      isActive: 1,
      deletedAt: new Date(),
    });

    res.json({ message: "Favorite removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete favorite" });
  }
});

export default router;
