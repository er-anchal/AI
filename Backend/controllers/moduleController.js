import Module from "../models/Module.js";
import SubModule from "../models/SubModule.js";

export const createModule = async (req, res) => {
  try {
    const { name, path = "", icon = "", description = "", sortOrder = 0 } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Module Name is required",
      });
    }

    // Check duplicate name
    const existingName = await Module.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Module name already exists",
      });
    }

    // Check duplicate path if path is supplied
    if (path && path.trim()) {
      const existingPath = await Module.findOne({ path: path.trim() });
      if (existingPath) {
        return res.status(400).json({
          success: false,
          message: "Module path already exists",
        });
      }
    }

    // Enforce unique sortOrder
    const existingSort = await Module.findOne({ sortOrder: Number(sortOrder) || 0 });
    if (existingSort) {
      return res.status(400).json({
        success: false,
        message: `Sort order '${sortOrder}' is already assigned to the module '${existingSort.name}'`,
      });
    }

    const module = await Module.create({
      name: name.trim(),
      path: path ? path.trim() : "",
      icon,
      description,
      sortOrder: Number(sortOrder) || 0,
      createdByName: "system",
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    console.error("Create Module Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getModules = async (req, res) => {
  try {
    const modules = await Module.find({ isActive: { $ne: "false" } }).sort({ sortOrder: 1 }).lean();

    // Query active submodules for each module dynamically
    const populatedModules = await Promise.all(
      modules.map(async (mod) => {
        const subModules = await SubModule.find({
          parentModule: mod._id,
          isActive: { $ne: "false" },
        })
          .sort({ sortOrder: 1 })
          .lean();
        return {
          ...mod,
          subModules,
        };
      })
    );

    res.json({
      success: true,
      count: populatedModules.length,
      data: populatedModules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE MODULE
export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, path, sortOrder } = req.body;

    if (sortOrder !== undefined) {
      const existingSort = await Module.findOne({
        sortOrder: Number(sortOrder),
        _id: { $ne: id }
      });
      if (existingSort) {
        return res.status(400).json({
          success: false,
          message: `Sort order '${sortOrder}' is already assigned to the module '${existingSort.name}'`,
        });
      }
    }

    if (name) {
      const existingName = await Module.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: "Module name already exists",
        });
      }
    }

    if (path && path.trim()) {
      const existingPath = await Module.findOne({ path: path.trim(), _id: { $ne: id } });
      if (existingPath) {
        return res.status(400).json({
          success: false,
          message: "Module path already exists",
        });
      }
    }

    const module = await Module.findByIdAndUpdate(
      id,
      {
        ...req.body,
        modifiedAt: new Date(),
        modifiedOn: new Date().toLocaleString(),
      },
      { new: true, runValidators: true },
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE MODULE (HARD DELETE)
export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Hard-delete all associated child submodules to keep clean integrity!
    await SubModule.deleteMany({ parentModule: req.params.id });

    res.json({
      success: true,
      message: "Module and its sub-modules permanently deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
