import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    /* -------------------- BASIC INFORMATION -------------------- */
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    type: { type: String, enum: ["simple", "variable"], default: "simple" },

    /* -------------------- PRICING -------------------- */
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

    /* -------------------- INVENTORY -------------------- */
    stock: { type: Number, min: 0, default: null },
    lowStockThreshold: { type: Number, min: 0, default: 5 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    sku: { type: String, trim: true, unique: true, sparse: true },
    barcode: { type: String, trim: true },

    /* -------------------- IMAGES -------------------- */
    images: [
      {
        url: { type: String, required: true, trim: true },
        public_id: { type: String, required: true },
        alt: { type: String, trim: true },
      },
    ],

    /* -------------------- SUPPLIER & VENDOR -------------------- */
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    /* -------------------- RATINGS -------------------- */
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    /* -------------------- STATUS & VISIBILITY -------------------- */
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

    /* -------------------- VARIANTS -------------------- */
    variants: [
      {
        color: { type: String, trim: true },
        size: { type: String, trim: true },
        material: { type: String, trim: true },
        stock: { type: Number, min: 0, default: null },
        price: { type: Number, min: 0, default: null },
        sku: { type: String, trim: true },
        image: { type: String, trim: true },
      },
    ],

    /* -------------------- SECTIONS -------------------- */
    sections: [
      {
        type: String,
        enum: ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"],
      },
    ],

    /* -------------------- FLASH SALE -------------------- */
    flashSale: {
      isActive: { type: Boolean, default: false },
      discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
      startDate: Date,
      endDate: Date,
    },

    /* -------------------- LOGISTICS -------------------- */
    weight: { type: Number, min: 0, default: null },
    dimensions: {
      length: { type: Number, min: 0, default: 0 },
      width: { type: Number, min: 0, default: 0 },
      height: { type: Number, min: 0, default: 0 },
    },
    shippingRegions: [{ type: String, trim: true }],
    shippingClass: { type: String, trim: true },
    deliveryTime: { type: String, trim: true },
    handlingFee: { type: Number, min: 0, default: 0 },
    freeShipping: { type: Boolean, default: false },
    warehouseLocation: { type: String, trim: true },

    /* -------------------- LEGAL -------------------- */
    returnPolicy: { type: String, trim: true },
    warranty: { type: String, trim: true },
    countryOfOrigin: { type: String, trim: true },
    hsCode: { type: String, trim: true },

    /* -------------------- SEO -------------------- */
    seo: {
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

    /* -------------------- FLAGS -------------------- */
    flags: {
      isNewArrival: { type: Boolean, default: false },
      isTopSeller: { type: Boolean, default: false },
      isDealOfWeek: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

/* -------------------- INDEXES -------------------- */
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, supplier: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

/* -------------------- VIRTUALS -------------------- */
productSchema.virtual("discountedPrice").get(function () {
  if (this.discountType === "percentage")
    return this.price - (this.price * this.discountValue) / 100;
  if (this.discountType === "fixed")
    return Math.max(this.price - this.discountValue, 0);
  return this.price;
});

/* -------------------- HOOKS -------------------- */
productSchema.pre("save", function (next) {
  if (!this.seo) this.seo = {};
  if (!this.seo.slug && this.name)
    this.seo.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

/* -------------------- TRANSFORM OUTPUT -------------------- */
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
