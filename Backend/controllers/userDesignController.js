import { UserDesign } from "../models/UserDesign.js";

// ------------------- USER FUNCTIONS -------------------

// Save user design
export const saveUserDesign = async (req, res) => {
  try {
    // console.log(req.user);
    const { templateId, canvasJson, type, width, height, thumbnail } = req.body;

    if (!templateId || !canvasJson) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userId = req.user._id;
    // console.log(userId, req.user._id);

    const design = await UserDesign.create({
      userId,
      templateId: templateId || null,
      canvasJson,
      type,
      width,
      height,
      thumbnail,
    });

    // console.log(design);

    res.status(201).json(design);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// Get user designs
export const getUserDesigns = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log(userId);
    const designs = await UserDesign.find({ userId, isActive: 0 }).sort({
      createdAt: -1,
    });
    // console.log(designs);
    return res.json(designs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single user design
export const getUserDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const design = await UserDesign.findById(id);
    if (!design)
      return res.status(404).json({ message: "User design not found" });
    res.json(design);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update user design (optional)
export const updateUserDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { canvasJson, type, width, height, thumbnail } = req.body;

    const design = await UserDesign.findByIdAndUpdate(
      id,
      {
        canvasJson,
        type,
        width,
        height,
        thumbnail,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!design)
      return res.status(404).json({ message: "User design not found" });

    res.json(design);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete user design
export const deleteUserDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const design = await UserDesign.findById(id);
    if (!design)
      return res.status(404).json({ message: "User design not found" });
    const deleted = await UserDesign.findByIdAndUpdate(id, {
      isActive: 1,
      deletedAt: new Date(),
    });
    res.json({ message: "User design deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
