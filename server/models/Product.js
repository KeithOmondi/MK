import mongoose from "mongoose";
import slugify from "slugify";
const { Schema } = mongoose;

/* ---------- Subschemas ---------- */
const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true },
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const variantSchema = new Schema(
  {
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    material: { type: String, trim: true },
    stock: { type: Number, min: 0, default: 0 },
    price: { type: Number, min: 0, default: 0 },
    sku: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { _id: false }
);

const seoSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    keywords: [{ type: String, trim: true }],
  },
  { _id: false }
);

/* ---------- Main Product Schema ---------- */
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    type: { type: String, enum: ["simple", "variable"], default: "simple" },

    // Pricing
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: null },
    costPrice: { type: Number, min: 0, default: null },
    taxRate: { type: Number, min: 0, max: 100, default: 0 },
    discountType: {
      type: String,
      enum: ["none", "percentage", "fixed"],
      default: "none",
    },
    discountValue: { type: Number, min: 0, default: 0 },

    // Inventory
    stock: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    sku: { type: String, trim: true, unique: true, sparse: true },
    barcode: { type: String, trim: true },

    // Images
    images: { type: [imageSchema], default: [] },

    // Supplier & Vendor
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },

    // Ratings & Reviews
    ratings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Refund & Sales Stats
    totalSold: { type: Number, default: 0 },
    totalReturned: { type: Number, default: 0 }, // 👈 Track returned products

    // Status & Visibility
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "pending"],
      default: "pending",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "hidden"],
      default: "private",
    },

    variants: { type: [variantSchema], default: [] },
    sections: [
      {
        type: String,
        enum: ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"],
      },
    ],

    // Flash Sale
    flashSale: {
      isActive: { type: Boolean, default: false },
      discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },

    // Logistics
    weight: { type: Number, min: 0, required: true },
    fragility: { type: String, enum: ["low", "medium", "high"], default: "low" },
    dimensions: {
      length: { type: Number, min: 0, default: 0 },
      width: { type: Number, min: 0, default: 0 },
      height: { type: Number, min: 0, default: 0 },
    },
    shippingRegions: [{ type: String, trim: true }],
    shippingClass: { type: String, trim: true },
    deliveryTime: { type: String, trim: true },
    handlingFee: { type: Number, min: 0, default: 0 },
    freeShippingThreshold: { type: Number, min: 0, default: 5000 },
    warehouseLocation: { type: String, trim: true },

    // Legal & SEO
    returnPolicy: { type: String, trim: true },
    warranty: { type: String, trim: true },
    countryOfOrigin: { type: String, trim: true },
    hsCode: { type: String, trim: true },
    seo: { type: seoSchema, default: {} },

    // Flags
    flags: {
      isNewArrival: { type: Boolean, default: false },
      isTopSeller: { type: Boolean, default: false },
      isDealOfWeek: { type: Boolean, default: false },
    },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* ---------- Hooks ---------- */
productSchema.pre("save", function (next) {
  if (!this.seo) this.seo = {};
  if (!this.seo.slug && this.name)
    this.seo.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

/* ---------- Virtual ---------- */
productSchema.virtual("discountedPrice").get(function () {
  if (this.discountType === "percentage")
    return Math.max(0, this.price - (this.price * this.discountValue) / 100);
  if (this.discountType === "fixed")
    return Math.max(0, this.price - this.discountValue);
  return this.price;
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
