// server/utils/setTemporaryPassword.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mktechnologies154_db_user:keith.@cluster0.wzptdpc.mongodb.net/MKSTORE?retryWrites=true&w=majority&appName=Cluster0";

async function setTemporaryPassword(email) {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log("User not found!");
      return process.exit();
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8); // 8 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user with temporary password and force password change
    user.password = hashedPassword;
    user.forcePasswordChange = true;
    await user.save();

    console.log(`Temporary password for ${email}: ${tempPassword}`);
    console.log("User updated successfully. They will be forced to change password on next login.");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Run: node setTemporaryPassword.js user@example.com
const emailArg = process.argv[2];
if (!emailArg) {
  console.log("Please provide the email as an argument.");
  process.exit();
}

setTemporaryPassword(emailArg);
