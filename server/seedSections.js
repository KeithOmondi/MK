// scripts/seedSections.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify"; // ✅ install: npm install slugify
import Section from "./models/sectionModel.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://mktechnologies154_db_user:keith.@cluster0.wzptdpc.mongodb.net/MKSTORE?retryWrites=true&w=majority&appName=Cluster0";

const defaultSections = [
  { name: "Hero", title: "Welcome to MKSTORE", layout: "single", order: 0 },
  { name: "FlashSales", title: "Flash Sales", order: 1, options: { limit: 8 } },
  { name: "TopCategories", title: "Top Categories", order: 2 },
  {
    name: "NewArrivals",
    title: "New Arrivals",
    order: 3,
    options: { autoPopulate: true, autoPopulateRule: "latest" },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    // Generate unique slugs for each section
    const sectionsWithSlugs = defaultSections.map((s) => ({
      ...s,
      slug: slugify(s.name, { lower: true }),
      description: s.title || "",
      isActive: true,
    }));

    // Clear collection safely
    await Section.deleteMany({});
    await Section.insertMany(sectionsWithSlugs);

    console.log("🌱 Sections seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
