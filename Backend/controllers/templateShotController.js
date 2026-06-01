import { Template } from "../models/Template.js";
import { TemplateShot } from "../models/TemplateShot.js";
import TemplateCategory from "../models/TemplateCategory.js";
import SubCategory from "../models/SubCategory.js";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(process.cwd(), "..", "n_frontend", "public", "uploads");

// Create template with optional shots
// Replace only the createTemplate() function with this version

export const createTemplate = async (req, res) => {
  try {
    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);

    const templateImages = req.files?.images || [];
    const shotImages = req.files?.shots || [];

    if (templateImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one template image is required",
      });
    }

    const { categoryId, subCategoryId } = req.body;

    if (!categoryId || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId and subCategoryId are required",
      });
    }

    // Find category
    const category = await TemplateCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Find subcategory
    const subcategory = await SubCategory.findById(subCategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    const createdTemplates = [];
    const TEMP_UPLOAD_PATH = UPLOADS_DIR;

    // Helper function
    const cleanFileName = (filename) => {
      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext);
      const cleanedBaseName = baseName.replace(/-\d{13}$/, "");
      return cleanedBaseName + ext;
    };

    const folderPath = path.join(TEMP_UPLOAD_PATH, category.name, subcategory.name);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const shotsFolderPath = path.join(folderPath, "shots");
    if (shotImages.length > 0 && !fs.existsSync(shotsFolderPath)) {
      fs.mkdirSync(shotsFolderPath, { recursive: true });
    }

    // Generate unique names for shots once
    const uniqueShotsData = shotImages.map((shot, i) => {
      const shotExt = path.extname(shot.originalname);
      const shotBase = path.basename(shot.originalname, shotExt);
      const uniqueShotName = `${shotBase}-${Date.now() + i}${shotExt}`;
      return {
        original: shot,
        uniqueName: uniqueShotName,
        url: `/uploads/${category.name}/${subcategory.name}/shots/${uniqueShotName}`
      };
    });

    // Write unique shot files to disk
    for (const shotData of uniqueShotsData) {
      const shotDest = path.join(shotsFolderPath, shotData.uniqueName);
      if (shotData.original.buffer) fs.writeFileSync(shotDest, shotData.original.buffer);
    }

    let templateIndex = 0;
    for (const file of templateImages) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueTemplateName = `${baseName}-${Date.now() + templateIndex}${ext}`;
      templateIndex++;

      const dest = path.join(folderPath, uniqueTemplateName);
      if (file.buffer) fs.writeFileSync(dest, file.buffer);

      const template = await Template.create({
        categoryId: category._id,
        categoryName: category.name,
        categorySlug: category.slug,

        subcategoryId: subcategory._id,
        subcategoryName: subcategory.name,
        subcategorySlug: subcategory.slug,

        fileName: cleanFileName(uniqueTemplateName),
        imageUrl: `/uploads/${category.name}/${subcategory.name}/${uniqueTemplateName}`,
        createdBy: req.user?._id,

        shots: uniqueShotsData.map(shot => shot.url),
      });

      // Save shot documents linked to this template
      for (const shotData of uniqueShotsData) {
        await TemplateShot.create({
          templateId: template._id,

          categoryId: category._id,
          categoryName: category.name,
          categorySlug: category.slug,

          subcategoryId: subcategory._id,
          subcategoryName: subcategory.name,
          subcategorySlug: subcategory.slug,

          fileName: cleanFileName(shotData.uniqueName),
          imageUrl: shotData.url,

          createdBy: req.user?._id,
        });
      }

      createdTemplates.push(template);
    }
    return res.status(201).json({
      success: true,
      message: "Templates uploaded successfully",
      count: createdTemplates.length,
      shotCount: shotImages.length,
      templates: createdTemplates,
    });
  } catch (error) {
    console.error("Create template error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const { category, subcategory } = req.query;

    const filter = {};

    if (category) filter.categorySlug = category;
    if (subcategory) filter.subcategorySlug = subcategory;

    const templates = await Template.find(filter).sort({
      createdAt: -1,
    });

    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get templates by category slug
export const getTemplatesByCategory = async (req, res) => {
  try {
    const templates = await Template.find({
      categorySlug: req.params.slug,
    });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update existing template shots
export const updateTemplateShots = async (req, res) => {
  try {
    const { templateId } = req.params;
    const shotImages = req.files?.shots || [];

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    let category = null;
    if (template.categoryId) category = await TemplateCategory.findById(template.categoryId);
    if (!category && template.categorySlug) category = await TemplateCategory.findOne({ slug: template.categorySlug });

    let subcategory = null;
    if (template.subcategoryId) subcategory = await SubCategory.findById(template.subcategoryId);
    if (!subcategory && template.subcategorySlug) subcategory = await SubCategory.findOne({ slug: template.subcategorySlug });

    const categoryName = category?.name || template.categoryName;
    const subcategoryName = subcategory?.name || template.subcategoryName;

    if (!categoryName || !subcategoryName) {
      return res.status(404).json({ success: false, message: "Category or Subcategory info missing for this template" });
    }

    const TEMP_UPLOAD_PATH = UPLOADS_DIR;
    const folderPath = path.join(TEMP_UPLOAD_PATH, categoryName, subcategoryName);
    const shotsFolderPath = path.join(folderPath, "shots");

    if (shotImages.length > 0 && !fs.existsSync(shotsFolderPath)) {
      fs.mkdirSync(shotsFolderPath, { recursive: true });
    }

    const cleanFileName = (filename) => {
      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext);
      const cleanedBaseName = baseName.replace(/-\d{13}$/, "");
      return cleanedBaseName + ext;
    };

    const newShots = [];
    let shotIndex = 0;
    for (const shot of shotImages) {
      const shotExt = path.extname(shot.originalname);
      const shotBase = path.basename(shot.originalname, shotExt);
      const uniqueShotName = `${shotBase}-${Date.now() + shotIndex}${shotExt}`;
      shotIndex++;

      const shotDest = path.join(shotsFolderPath, uniqueShotName);
      if (shot.buffer) fs.writeFileSync(shotDest, shot.buffer);
      
      const shotUrl = `/uploads/${categoryName}/${subcategoryName}/shots/${uniqueShotName}`;
      newShots.push(shotUrl);

      const existingShot = await TemplateShot.findOne({ templateId: template._id, imageUrl: shotUrl });
      if (!existingShot) {
        await TemplateShot.create({
          templateId: template._id,
          categoryId: category?._id || template.categoryId,
          categoryName: categoryName,
          categorySlug: category?.slug || template.categorySlug,
          subcategoryId: subcategory?._id || template.subcategoryId,
          subcategoryName: subcategoryName,
          subcategorySlug: subcategory?.slug || template.subcategorySlug,
          fileName: cleanFileName(uniqueShotName),
          imageUrl: shotUrl,
          createdBy: req.user?._id,
        });
      }
    }

    if (newShots.length > 0) {
      // Append new shots instead of replacing
      const existingShotsArray = Array.isArray(template.shots) ? template.shots : [];
      
      // Prevent duplicates
      newShots.forEach(shotUrl => {
        if (!existingShotsArray.includes(shotUrl)) {
          existingShotsArray.push(shotUrl);
        }
      });

      template.shots = existingShotsArray;
      await template.save();
    }

    return res.status(200).json({
      success: true,
      message: "Template shots updated successfully",
      template,
    });
  } catch (error) {
    console.error("Update template shots error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update shots",
    });
  }
};
