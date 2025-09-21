// scripts/seedCategories.ts
import mongoose from "mongoose";
import Category from "./models/Category.js"

const categories = [
  {
    name: "Electronics",
    icon: "Monitor",
    subcategories: [
      "Headphones",
      "Computers & Accessories",
      "Security & Surveillance",
      "Accessories and Supplies",
      "Office Electronics",
    ],
  },
  {
    name: "Men's Fashion",
    icon: "ShoppingBag",
    subcategories: ["Shoes", "Watches", "Clothing", "Accessories"],
  },
  {
    name: "Women's Fashion",
    icon: "ShoppingBag",
    subcategories: ["Shoes", "Watches", "Jewellery", "Handbags", "Clothing", "Accessories"],
  },
  {
    name: "Boys & Girls Fashion",
    icon: "ShoppingBag",
    subcategories: ["Shoes", "Watches", "Jewellery", "Handbags", "Clothing", "Accessories"],
  },
  {
    name: "Home & Kitchen",
    icon: "Home",
    subcategories: [
      "Kitchen & Dining",
      "Wall Art",
      "Light & Ceiling",
      "Cleaning Supplies",
      "Iron and Steamers",
      "Furniture",
      "Bathing",
      "Heating, Cooling & Air Quality",
      "Storage & Organization",
      "Vacuums & Floor Care",
      "Bedding",
    ],
  },
  {
    name: "Eyeglasses",
    icon: "Eye",
    subcategories: ["Prescription", "Sunglasses", "Blue Light"],
  },
  {
    name: "Beauty & Personal Care",
    icon: "Eye",
    subcategories: [
      "Oral Care",
      "Personal Care",
      "Shave and Hair Removal",
      "Nail, Foot & Hand Care",
      "Fragrance",
      "Hair Care",
      "Skin Care",
      "Makeup",
    ],
  },
  {
    name: "Apple Store",
    icon: "Apple",
    subcategories: ["iPhone", "MacBook", "iPad", "Accessories"],
  },
  {
    name: "Sports and Outdoor",
    icon: "Eye",
    subcategories: ["Sports & Outdoor", "Outdoor Recreation", "Sports & Fitness"],
  },
];

const seed = async () => {
  try {
    await mongoose.connect("mongodb+srv://mktechnologies154_db_user:keith.@cluster0.wzptdpc.mongodb.net/MKSTORE?retryWrites=true&w=majority&appName=Cluster0");

    console.log("Connected to DB");

    await Category.deleteMany({}); // clear old data

    for (const cat of categories) {
      const parent = await Category.create({
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
        icon: cat.icon,
      });

      for (const sub of cat.subcategories) {
        await Category.create({
          name: sub,
          slug: sub.toLowerCase().replace(/\s+/g, "-"),
          parentCategory: parent._id,
        });
      }
    }

    console.log("✅ Categories Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  }
};

seed();
