import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    icon: { type: String }, // keep this if you want icons stored
  },
  { timestamps: true }
);

// ✅ Enforce uniqueness only within the same parent
categorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });
categorySchema.index({ slug: 1, parentCategory: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;
