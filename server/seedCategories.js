import mongoose from "mongoose";
import Category from "./models/Category.js";

// ✅ Focused Starter Categories for Local Marketplace
const categories = [
  {
    name: "Electronics",
    icon: "Monitor",
    subcategories: [
      "Phone Accessories",
      "Chargers & Cables",
      "Power Banks",
      "Earphones & Headsets",
      "Computers & Laptops",
      "Laptop Accessories",
      "Networking Devices",
      "Computer Components",
    ],
  },
  {
    name: "Beauty & Personal Care",
    icon: "Heart",
    subcategories: [
      "Skin Care",
      "Hair Care",
      "Makeup",
      "Personal Care",
      "Fragrance",
    ],
  },
  {
    name: "Home & Kitchen",
    icon: "Home",
    subcategories: [
      "Kitchen Appliances",
      "Blenders & Grinders",
      "Storage & Organization",
      "Home Cleaning",
      "Home Decor",
    ],
  },
];

// ✅ Simple JS slugify function
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-");

// ===== Seed Function =====
const seed = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mktechnologies154_db_user:keith.@cluster0.wzptdpc.mongodb.net/MKSTORE?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("✅ Connected to DB");

    // Clear old categories
    await Category.deleteMany({});
    console.log("🗑️ Old categories cleared");

    // Insert starter categories
    for (const cat of categories) {
      const parent = await Category.create({
        name: cat.name,
        slug: slugify(cat.name),
        icon: cat.icon,
      });

      for (const sub of cat.subcategories) {
        await Category.create({
          name: sub,
          slug: slugify(`${cat.name}-${sub}`),
          parentCategory: parent._id,
        });
      }
    }

    console.log("✅ Starter Categories Seeded Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  }
};

seed();
