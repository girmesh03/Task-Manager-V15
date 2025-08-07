import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";
import crypto from "crypto";
import CustomError from "../errorHandler/CustomError.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [20, "First name cannot exceed 20 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [20, "Last name cannot exceed 20 characters"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      maxlength: [50, "Position cannot exceed 50 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: [
        "PlatformAdmin",
        "PlatformSupport",
        "SuperAdmin",
        "Admin",
        "Manager",
        "User",
      ],
      default: "User",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    profilePicture: { url: String, public_id: String },
    skills: [{ type: String, trim: true, maxlength: 30 }],
    isActive: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: false },
    pendingEmail: { type: String, trim: true, lowercase: true },
    emailChangeToken: { type: String, select: false },
    emailChangeTokenExpiry: { type: Date, select: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
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

// Indexes
userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 900 });
userSchema.index({ emailChangeTokenExpiry: 1 }, { expireAfterSeconds: 900 });
userSchema.index({ resetPasswordExpiry: 1 }, { expireAfterSeconds: 3600 });

// Virtuals
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("assignedTasksCount", {
  ref: "Task",
  localField: "_id",
  foreignField: "assignedTo",
  count: true,
});

userSchema.virtual("createdTasksCount", {
  ref: "Task",
  localField: "_id",
  foreignField: "createdBy",
  count: true,
});

userSchema.virtual("performedTasksCount", {
  ref: "RoutineTask",
  localField: "_id",
  foreignField: "performedBy",
  count: true,
});

// Format firstName, lastName and position on create/update
userSchema.pre("save", function (next) {
  const capitalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("firstName")) {
    this.firstName = capitalize(this.firstName);
  }
  if (this.isModified("lastName")) {
    this.lastName = capitalize(this.lastName);
  }

  if (this.isModified("position")) {
    this.position = capitalize(this.position);
  }

  next();
});

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(
      new CustomError(
        "Password hashing failed",
        500,
        "PASSWORD_HASHING_FAILED_ERROR"
      )
    );
  }
});

// Password matching method
userSchema.methods.comparePassword = async function (enteredPassword) {
  // We must re-select the password field as it's excluded by default.
  const user = await this.constructor.findById(this._id).select("+password");
  if (!user) return false;
  return await bcrypt.compare(enteredPassword, user.password);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  this.verificationToken = token;
  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  return token;
};

userSchema.plugin(mongoosePaginate);

export default mongoose.model("User", userSchema);
