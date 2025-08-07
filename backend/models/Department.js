import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      minlength: [2, "Department name must be at least 2 characters"],
      maxlength: [50, "Department name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Manager reference is required"],
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Member reference is required"],
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

// Virtual fields
departmentSchema.virtual("memberCount", {
  ref: "User",
  localField: "_id",
  foreignField: "department",
  count: true,
});

departmentSchema.virtual("taskCount", {
  ref: "Task",
  localField: "_id",
  foreignField: "department",
  count: true,
});

departmentSchema.virtual("teams", {
  ref: "Team",
  localField: "_id",
  foreignField: "department",
});

departmentSchema.virtual("teamCount", {
  ref: "Team",
  localField: "_id",
  foreignField: "department",
  count: true,
});

// Format name/description on save and update
departmentSchema.pre("save", function (next) {
  const capitalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("name")) {
    this.name = capitalize(this.name);
  }

  if (this.isModified("description") && this.description) {
    this.description = capitalize(this.description);
  }

  next();
});

departmentSchema.plugin(mongoosePaginate);

export default mongoose.model("Department", departmentSchema);
