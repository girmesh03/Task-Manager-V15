import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "laugh", "wow", "sad", "angry"],
      required: true,
    },
  },
  { _id: false, timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Task reference is required"],
    },
    taskType: {
      type: String,
      enum: ["Task", "RoutineTask"],
      required: [true, "Task type is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    reactions: [reactionSchema],
    isEdited: { type: Boolean, default: false },
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

commentSchema.index({ task: 1, taskType: 1 });
commentSchema.index({ createdAt: -1 });

export default mongoose.model("Comment", commentSchema);
