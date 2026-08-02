import Product from "../models/Product.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const query = { status: "available", flagged: false };
  if (search) query.name = { $regex: search, $options: "i" };
  if (category && category !== "All") query.category = category;

  const products = await Product.find(query).populate("seller", "fullName").sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, products });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    req.body,
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error("Listing not found");
  }
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "super_admin" || req.user.role === "moderator";
  const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, seller: req.user._id };
  const product = await Product.findOneAndDelete(filter);
  if (!product) {
    res.status(404);
    throw new Error("Listing not found");
  }
  res.json({ success: true, message: "Listing removed" });
});

export const toggleSaveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Listing not found");
  }
  const saved = product.savedBy.some((id) => id.equals(req.user._id));
  product.savedBy = saved
    ? product.savedBy.filter((id) => !id.equals(req.user._id))
    : [...product.savedBy, req.user._id];
  await product.save();
  res.json({ success: true, saved: !saved });
});

// @desc Moderation: flag as scam or mark sold
// @route PUT /api/marketplace/:id/moderate
export const moderateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) {
    res.status(404);
    throw new Error("Listing not found");
  }
  res.json({ success: true, product });
});
