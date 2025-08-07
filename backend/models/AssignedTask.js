// backend/models/AssignedTaskModel.js
import mongoose from "mongoose";
import Task from "./Task.js";
import materialSchema from "./Material.js";

const assignedTaskSchema = new mongoose.Schema(
  {
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Assigned user is required"],
      },
    ],
    materialsUsed: [materialSchema],
    totalMaterialCost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
  },
  {
    toJSON: Task.schema.options.toJSON,
    toObject: Task.schema.options.toObject,
  }
);

export default Task.discriminator("AssignedTask", assignedTaskSchema);
