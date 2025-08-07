import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Material name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be at least 0.01"],
    },
    unit: {
      type: String,
      required: [true, "Unit of measurement is required"],
      enum: {
        values: [
          "pcs",
          "units",
          "each",
          "kg",
          "g",
          "lb",
          "oz",
          "ton",
          "l",
          "ml",
          "gal",
          "qt",
          "pt",
          "m",
          "cm",
          "mm",
          "ft",
          "in",
          "m2",
          "cm2",
          "ft2",
          "in2",
          "m3",
          "cm3",
          "ft3",
          "in3",
          "hours",
          "days",
          "weeks",
          "months",
          "other",
        ],
        message: "Invalid unit",
      },
    },
    costPerUnit: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },
    usedAt: { type: Date, default: Date.now },
  },
  { _id: false, timestamps: true }
);

export default materialSchema;
