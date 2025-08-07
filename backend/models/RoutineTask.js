import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import materialSchema from "./Material.js";

const routineTaskSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Task department is required"],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task performer is required"],
    },
    date: {
      type: Date,
      required: [true, "Routine Task date is required"],
      default: Date.now,
    },
    performedTasks: [
      {
        description: {
          type: String,
          required: [true, "Routine Task description is required"],
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: [0, "Task progress cannot be less than 0"],
      max: [100, "Task progress cannot exceed 100"],
    },
    materialsUsed: [materialSchema],
    totalMaterialCost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    attachments: [
      {
        url: String,
        public_id: String,
        type: String,
        name: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

// Virtual for routine task comments
routineTaskSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "task",
  match: { taskType: "RoutineTask" },
  options: { sort: { createdAt: -1 } },
});

// Auto-calculate progress
routineTaskSchema.pre("save", function (next) {
  if (this.isModified("performedTasks")) {
    const total = this.performedTasks.length;
    const completed = this.performedTasks.filter((t) => t.isCompleted).length;
    this.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  if (this.isModified("materialsUsed")) {
    this.totalMaterialCost = this.materialsUsed.reduce(
      (total, material) =>
        total + (material.costPerUnit || 0) * material.quantity,
      0
    );
  }
  next();
});

routineTaskSchema.plugin(mongoosePaginate);

export default mongoose.model("RoutineTask", routineTaskSchema);
