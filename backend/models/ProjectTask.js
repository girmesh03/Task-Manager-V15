import mongoose from "mongoose";
import Task from "./Task.js";
import CustomError from "../errorHandler/CustomError.js";

const projectTaskSchema = new mongoose.Schema(
  {
    contractorInfo: {
      name: {
        type: String,
        trim: true,
        required: [true, "Contractor name is required"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, "Contractor phone is required"],
        trim: true,
      },
      address: { type: String, trim: true },
    },
    contractDetails: {
      contractValue: { type: Number, min: 0 },
      paymentStatus: {
        type: String,
        enum: ["Pending", "Partial", "Paid", "Disputed"],
        default: "Pending",
      },
      milestones: [
        {
          description: String,
          dueDate: Date,
          status: {
            type: String,
            enum: ["Started", "In Progress", "Completed", "Pending"],
            default: "Started",
          },
          paymentPercentage: { type: Number, min: 0, max: 100 },
        },
      ],
    },
    qualityAssurance: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
    },
    communicationLog: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        method: {
          type: String,
          enum: ["Email", "Phone", "Meeting", "Message"],
        },
        summary: String,
        attachments: [
          {
            url: String,
            public_id: String,
            type: String,
            name: String,
          },
        ],
      },
    ],
  },
  {
    toJSON: Task.schema.options.toJSON,
    toObject: Task.schema.options.toObject,
  }
);

// Milestone status validation
projectTaskSchema.pre("save", function (next) {
  if (this.contractDetails?.milestones) {
    const invalidMilestone = this.contractDetails.milestones.find(
      (m) => m.paymentPercentage < 0 || m.paymentPercentage > 100
    );

    if (invalidMilestone) {
      return next(
        new CustomError(
          "Invalid payment percentage for milestone",
          400,
          "INVALID_PAYMENT_PERCENTAGE_ERROR"
        )
      );
    }
  }
  next();
});

export default Task.discriminator("ProjectTask", projectTaskSchema);
