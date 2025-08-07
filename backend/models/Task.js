import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed", "Pending"],
      default: "To Do",
    },
    location: {
      type: String,
      required: [true, "Task location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters"],
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Task due date is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task created by is required"],
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Task department is required"],
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
  },
  {
    discriminatorKey: "taskType",
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

// Virtual for task activities
taskSchema.virtual("activities", {
  ref: "TaskActivity",
  localField: "_id",
  foreignField: "task",
  options: { sort: { createdAt: -1 } },
});

// Virtual for task comments
taskSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "task",
  match: { taskType: "Task" },
  options: { sort: { createdAt: -1 } },
});

// Auto-update status when activities exist
taskSchema.pre("save", async function (next) {
  if (this.status === "To Do" && this.isModified("status")) {
    const activityCount = await mongoose
      .model("TaskActivity")
      .countDocuments({ task: this._id });
    if (activityCount > 0) this.status = "In Progress";
  }
  next();
});

taskSchema.plugin(mongoosePaginate);

export default mongoose.model("Task", taskSchema);
