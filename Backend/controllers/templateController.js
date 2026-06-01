import TemplateCategory from "../models/TemplateCategory.js";
import { Template } from "../models/Template.js";
import { TemplateShot } from "../models/TemplateShot.js";
import fs from "fs";
import path from "path";

export const getDiskTemplates = async (req, res) => {
  try {
    // Hardcoded folders — each name EXACTLY matches the pill label in the frontend
    const folders = [
      { slug: "rings", name: "Rings" },
      { slug: "pendants", name: "Pendants" },
      { slug: "bangles", name: "Bangles" },
      { slug: "articles", name: "Articles" },
    ];

    const allTemplates = [];
    const baseUrl = process.env.API_URL || "http://localhost:5001";

    for (const { slug, name } of folders) {
      const folderPath = path.resolve("uploads/videos", slug);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".mov")) {
            allTemplates.push({
              _id: `${slug}-${file}`,
              fileName: file,
              categorySlug: "jewellery",
              categoryName: "Jewellery",
              subcategoryName: name,          // "Rings" / "Pendants" / "Bangles" / "Articles"
              subcategorySlug: slug,
              videoUrl: `${baseUrl}/uploads/videos/${slug}/${file}`,
            });
          }
        }
      }
    }

    res.json(allTemplates);
  } catch (error) {
    console.error("Failed to read disk templates:", error);
    res.status(500).json({ message: "Failed to read disk templates" });
  }
};

export const getTemplateCategories = async (req, res) => {
  try {
    const categories = await TemplateCategory.find({ isActive: 0 }).sort({
      createdAt: -1,
    });
    // console.log(categories);
    return res.json(categories);
  } catch (error) {
    console.error(error);
    const errMsg = error.message || "Server Error";
    return res.status(500).json({ message: errMsg });
  }
};
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    res.json(template);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load template",
    });
  }
};

export const getTemplatesByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find category
    const category = await TemplateCategory.findOne({
      slug,
      isActive: 0,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Fetch templates
    const templates = await Template.find({
      categoryId: category._id,
      isActive: 0,
    }).sort({ createdAt: -1 });

    // Return ALL required fields including subcategory data
    const formattedTemplates = templates.map((t) => ({
      _id: t._id,
      fileName: t.fileName,
      categoryId: t.categoryId,
      categorySlug: category.slug,

      // IMPORTANT: include subcategory fields
      subcategoryId: t.subcategoryId,
      subcategoryName: t.subcategoryName,
      subcategorySlug: t.subcategorySlug,
      imageUrl: t.imageUrl,

      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    res.json(formattedTemplates);
  } catch (err) {
    console.error("Failed to fetch templates:", err);
    res.status(500).json({
      message: "Failed to fetch templates",
    });
  }
};
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the template
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Hard delete associated shots
    await TemplateShot.deleteMany({ templateId: id });

    // Hard delete the template
    await Template.findByIdAndDelete(id);

    // Remove files from disk
    try {
      if (template.imageUrl && template.imageUrl.startsWith("/uploads")) {
        const diskPath = path.join(process.cwd(), "..", "n_frontend", "public", template.imageUrl.replace(/^\//, ""));
        if (fs.existsSync(diskPath)) {
          fs.unlinkSync(diskPath);
        }
      }

      if (template.shots && template.shots.length > 0) {
        for (const shotUrl of template.shots) {
          if (shotUrl.startsWith("/uploads")) {
            const shotDiskPath = path.join(process.cwd(), "..", "n_frontend", "public", shotUrl.replace(/^\//, ""));
            if (fs.existsSync(shotDiskPath)) {
              fs.unlinkSync(shotDiskPath);
            }
          }
        }
      }
    } catch (fsErr) {
      console.error("Failed to delete files from disk:", fsErr);
    }

    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ message: "Failed to delete template" });
  }
};
