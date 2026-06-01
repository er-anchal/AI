// routes/favorites.js
import mongoose from "mongoose";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Flipbook from "../models/FlipBook.js";
import multer from "multer";
import fs from "fs";
import { generatePdfThumbnail } from "../utils/pdfThumbnail.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/pdfs",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDFs allowed"), false);
  }
};

export const uploadPdf = multer({
  storage,
  fileFilter,
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { designIds } = req.body;

    if (!designIds || designIds.length === 0) {
      return res.status(400).json({ message: "No designs selected" });
    }

    const flipbook = await Flipbook.create({
      userId: req.user._id,
      designIds,
      coverDesignId: designIds[0],
    });

    res.json(flipbook);
  } catch (error) {
    console.error("Save Flipbook error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to save flipbook" });
  }
});

/* ---------- CREATE PDF FLIPBOOK ---------- */
router.post(
  "/pdf",
  authMiddleware,
  uploadPdf.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF uploaded" });
      }

      const pdfPath = req.file.path;
      // console.log(pdfPath);
      const pdfUrl = `${process.env.API_URL}/uploads/pdfs/${req.file.filename}`;

      // 🔹 Create cover directory
      const coverDir = "uploads/pdf-covers";
      if (!fs.existsSync(coverDir)) {
        fs.mkdirSync(coverDir, { recursive: true });
      }

      const coverFilename = `${Date.now()}-cover.png`;
      const coverPath = `${coverDir}/${coverFilename}`;

      // 🔥 Generate thumbnail
      await generatePdfThumbnail(pdfPath, coverPath);

      const flipbook = await Flipbook.create({
        userId: req.user._id,
        pdfUrl,
        coverImage: `${process.env.API_URL}/uploads/pdf-covers/${coverFilename}`,
        type: "pdf",
      });

      res.json(flipbook);
    } catch (error) {
      console.error("PDF flipbook creation failed:", error);
      res.status(500).json({ message: "Failed to create PDF flipbook" });
    }
  },
);

router.get("/", authMiddleware, async (req, res) => {
  try {
    const flipbooks = await Flipbook.find({ userId: req.user._id })
      // .populate("designIds")
      .populate("coverDesignId")
      .sort({ createdAt: -1 });

    res.json(flipbooks);
  } catch (error) {
    console.error("Fetch flipbook error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch Flipbook" });
  }
});

// router.get("/:id", authMiddleware, async (req, res) => {
//   const flipbook = await Flipbook.findOne({
//     _id: req.params.id,
//     userId: req.user._id,
//   }).populate("designIds");

//   if (!flipbook) return res.status(404).json({ message: "Not found" });

//   res.json(flipbook);
// });

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid flipbook ID" });
    }

    const flipbook = await Flipbook.findOne({
      _id: id,
      userId: req.user._id,
    }).populate("designIds");
    if (!flipbook) return res.status(404).json({ error: "Flipbook not found" });

    res.json(flipbook);
  } catch (error) {
    console.error("Fetch flipbook error:", error);

    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch flipbook" });
  }
});

export default router;
