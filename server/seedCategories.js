import mongoose from "mongoose";
import Category from "./models/Category.js";

// ✅ Organized Category structure
const categories = [
  {
    name: "Electronics",
    icon: "Monitor",
    subcategories: [
      "Headphones",
      "Computers & Accessories",
      "Security & Surveillance",
      "Office Electronics",
      "Apple",
      "TV & Audio",
      "Cameras & Photography",
      "Gaming Consoles",
    ],
  },
  {
    name: "Fashion",
    icon: "ShoppingBag",
    subcategories: [
      "Men's Fashion",
      "Women's Fashion",
      "Kids' Fashion",
      "Shoes",
      "Watches",
      "Jewellery",
      "Accessories",
      "Bags & Luggage",
    ],
  },
  {
    name: "Home & Kitchen",
    icon: "Home",
    subcategories: [
      "Kitchen & Dining",
      "Furniture",
      "Wall Art",
      "Lighting & Ceiling",
      "Cleaning Supplies",
      "Bedding",
      "Bathing",
      "Heating & Cooling",
      "Storage & Organization",
      "Vacuums & Floor Care",
      "Home Decor",
    ],
  },
  {
    name: "Eyewear",
    icon: "Glasses",
    subcategories: ["Prescription", "Sunglasses", "Blue Light"],
  },
  {
    name: "Beauty & Personal Care",
    icon: "Heart",
    subcategories: [
      "Skin Care",
      "Hair Care",
      "Makeup",
      "Fragrance",
      "Nail, Foot & Hand Care",
      "Oral Care",
      "Personal Care",
      "Shaving & Hair Removal",
    ],
  },
  {
    name: "Sports & Outdoors",
    icon: "Dumbbell",
    subcategories: [
      "Fitness",
      "Outdoor Recreation",
      "Team Sports",
      "Cycling",
      "Camping & Hiking",
    ],
  },
  {
    name: "Grocery",
    icon: "ShoppingCart",
    subcategories: [
      "Beverages",
      "Snacks",
      "Cooking Essentials",
      "Household Supplies",
      "Organic & Health Foods",
    ],
  },
];

// ✅ Simple JS slugify
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

    console.log("✅ Categories Seeded Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  }
};

seed();
