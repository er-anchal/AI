import SubModule from "../models/SubModule.js";

// CREATE SUBMODULE
export const createSubModule = async (req, res) => {
  try {
    const { name, path, parentModule, sortOrder = 0 } = req.body;

    // Validate required fields
    if (!name || !path || !parentModule) {
      return res.status(400).json({
        success: false,
        message: "Name, Path, and Parent Module are required",
      });
    }

    // Check duplicate name within the same parent
    const existingName = await SubModule.findOne({
      name: name.trim(),
      parentModule,
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Sub-module name already exists under this parent module",
      });
    }

    // Check duplicate path within the same parent
    const existingPath = await SubModule.findOne({
      path: path.trim(),
      parentModule,
    });
    if (existingPath) {
      return res.status(400).json({
        success: false,
        message: "Sub-module path already exists under this parent module",
      });
    }

    // Enforce unique sortOrder under the same parent
    const existingSort = await SubModule.findOne({
      sortOrder: Number(sortOrder) || 0,
      parentModule,
    });
    if (existingSort) {
      return res.status(400).json({
        success: false,
        message: `Sort order '${sortOrder}' is already assigned to the sub-module '${existingSort.name}' under this parent module`,
      });
    }

    const subModule = await SubModule.create({
      name: name.trim(),
      path: path.trim(),
      parentModule,
      sortOrder: Number(sortOrder) || 0,
      createdByName: req.user?.name || "system",
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Sub-module created successfully",
      data: subModule,
    });
  } catch (error) {
    console.error("Create Sub-module Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL SUBMODULES
export const getSubModules = async (req, res) => {
  try {
    const filter = { isActive: { $ne: "false" } };
    if (req.query.parentModule) {
      filter.parentModule = req.query.parentModule;
    }

    const subModules = await SubModule.find(filter)
      .sort({ sortOrder: 1 })
      .populate("parentModule", "name path")
      .lean();

    res.json({
      success: true,
      count: subModules.length,
      data: subModules,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SUBMODULE BY ID
export const getSubModuleById = async (req, res) => {
  try {
    const subModule = await SubModule.findById(req.params.id).populate("parentModule", "name path");

    if (!subModule) {
      return res.status(404).json({
        success: false,
        message: "Sub-module not found",
      });
    }

    res.json({
      success: true,
      data: subModule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE SUBMODULE
export const updateSubModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, path, parentModule, sortOrder } = req.body;

    const currentSub = await SubModule.findById(id);
    if (!currentSub) {
      return res.status(404).json({
        success: false,
        message: "Sub-module not found",
      });
    }

    const checkParent = parentModule || currentSub.parentModule;
    const checkSortOrder = sortOrder !== undefined ? Number(sortOrder) : currentSub.sortOrder;

    if (sortOrder !== undefined || parentModule !== undefined) {
      const existingSort = await SubModule.findOne({
        sortOrder: checkSortOrder,
        parentModule: checkParent,
        _id: { $ne: id }
      });
      if (existingSort) {
        return res.status(400).json({
          success: false,
          message: `Sort order '${checkSortOrder}' is already assigned to the sub-module '${existingSort.name}' under this parent module`,
        });
      }
    }

    if (name) {
      const existingName = await SubModule.findOne({
        name: name.trim(),
        parentModule: checkParent,
        _id: { $ne: id }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: "Sub-module name already exists under this parent module",
        });
      }
    }

    if (path) {
      const existingPath = await SubModule.findOne({
        path: path.trim(),
        parentModule: checkParent,
        _id: { $ne: id }
      });
      if (existingPath) {
        return res.status(400).json({
          success: false,
          message: "Sub-module path already exists under this parent module",
        });
      }
    }

    const subModule = await SubModule.findByIdAndUpdate(
      id,
      {
        ...req.body,
        modifiedBy: req.user?._id || null,
        modifiedByName: req.user?.name || "system",
        modifiedAt: new Date(),
        modifiedOn: new Date().toLocaleString(),
      },
      { new: true, runValidators: true }
    );

    if (!subModule) {
      return res.status(404).json({
        success: false,
        message: "Sub-module not found",
      });
    }

    res.json({
      success: true,
      message: "Sub-module updated successfully",
      data: subModule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE SUBMODULE (HARD DELETE)
export const deleteSubModule = async (req, res) => {
  try {
    const { id } = req.params;

    const subModule = await SubModule.findByIdAndDelete(id);

    if (!subModule) {
      return res.status(404).json({
        success: false,
        message: "Sub-module not found",
      });
    }

    res.json({
      success: true,
      message: "Sub-module permanently deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
