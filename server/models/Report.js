import mongoose from "mongoose";

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User", // The user who submits the report
      required: [true, "Reporter ID is required"],
    },

    reportedEntity: {
      type: Schema.Types.ObjectId,
      refPath: "entityType", // Dynamic reference: 'User' or 'Product'
      required: [true, "Reported entity ID is required"],
    },

    entityType: {
      type: String,
      enum: ["User", "Product"], // Extendable for other entities
      required: [true, "Entity type is required"],
    },

    type: {
      type: String,
      enum: ["Spam", "Abuse", "Fraud", "Other"],
      required: [true, "Report type is required"],
    },

    reason: {
      type: String,
      trim: true,
      minlength: [5, "Reason must be at least 5 characters long"],
      required: [true, "Please provide a reason for the report"],
    },

    status: {
      type: String,
      enum: ["Pending", "Resolved", "Ignored"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Optional index for faster lookups (useful for admin dashboards)
reportSchema.index({ entityType: 1, reportedEntity: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
