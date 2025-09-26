import User from "../models/userModel.js";


// Add product to recently viewed
export const addRecentlyViewed = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove if already exists, then add to front
    user.recentlyViewed = [
      productId,
      ...user.recentlyViewed.filter((id) => id.toString() !== productId),
    ].slice(0, 10); // keep max 10

    await user.save();

    res.json(user.recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: "Failed to update recently viewed", error: error.message });
  }
};

// Get recently viewed products
export const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("recentlyViewed");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recently viewed", error: error.message });
  }
};
