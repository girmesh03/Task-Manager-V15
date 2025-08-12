import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      minlength: [2, "Organization name must be at least 2 characters"],
      maxlength: [100, "Organization name cannot exceed 100 characters"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Organization email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Organization phone number is required"],
      unique: true,
    },
    address: {
      type: String,
      required: [true, "Organization address is required"],
      minLength: [2, "Address must be at least 2 characters long"],
      maxLength: [100, "Address cannot exceed 100 characters"],
    },
    size: {
      type: String,
      required: [true, "Organization size is required"],
      enum: ["1-10", "11-50", "51-100", "101-500", "501-1000", "1001+"],
    },
    industry: {
      type: String,
      required: [true, "Organization industry is required"],
      enum: [
        "Hospitality",
        "Construction",
        "Education",
        "Healthcare",
        "Manufacturing",
        "Retail",
        "Technology",
        "Finance",
        "Transportation",
        "Utilities",
        "Telecommunications",
        "Government",
        "Non-Profit",
        "Other",
      ],
    },
    logo: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\//.test(v);
        },
        message: "Logo must be a valid URL",
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["trial", "basic", "premium", "enterprise"],
        default: "trial",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active",
      },
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    },
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

organizationSchema.virtual("departmentsCount", {
  ref: "Department",
  localField: "_id",
  foreignField: "organization",
  count: true,
});

organizationSchema.virtual("usersCount", {
  ref: "User",
  localField: "_id",
  foreignField: "organization",
  count: true,
});

// Format name/address on save
organizationSchema.pre("save", function (next) {
  const capitalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("name")) {
    this.name = capitalize(this.name);
  }

  if (this.isModified("address") && this.address) {
    this.address = capitalize(this.address);
  }

  next();
});

organizationSchema.plugin(mongoosePaginate);

export default mongoose.model("Organization", organizationSchema);
