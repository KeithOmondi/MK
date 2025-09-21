// server/fixIndexes.js
import mongoose from "mongoose";

const run = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mktechnologies154_db_user:keith.@cluster0.wzptdpc.mongodb.net/MKSTORE?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connected to DB");

    const db = mongoose.connection.db;
    const collection = db.collection("categories");

    // 1. Show current indexes
    const indexes = await collection.indexes();
    console.log("📌 Current Indexes:", indexes);

    // 2. Drop old global unique indexes if they exist
    const dropIfExists = async (indexName) => {
      const exists = indexes.find((idx) => idx.name === indexName);
      if (exists) {
        await collection.dropIndex(indexName);
        console.log(`❌ Dropped index: ${indexName}`);
      }
    };

    await dropIfExists("name_1");
    await dropIfExists("slug_1");

    // 3. Recreate compound indexes
    await collection.createIndex(
      { name: 1, parentCategory: 1 },
      { unique: true }
    );
    console.log("✅ Created compound index: { name, parentCategory }");

    await collection.createIndex(
      { slug: 1, parentCategory: 1 },
      { unique: true }
    );
    console.log("✅ Created compound index: { slug, parentCategory }");

    console.log("🎉 Indexes fixed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing indexes:", err);
    process.exit(1);
  }
};

run();
