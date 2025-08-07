import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification Recipient user is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [100, "Message cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: [
        // Task-related
        "TaskAssignment",
        "TaskReassignment",
        "TaskCompletion",
        "TaskUpdate",
        "TaskDeadlineApproaching",
        "TaskOverdue",
        "TaskComment",
        "TaskReaction",

        // Status changes
        "StatusChange",

        // Team-related
        "TeamAssignment",
        "TeamLeadDesignation",

        // Material/resource
        "MaterialUsage",

        // Project management
        "MilestoneUpdate",
        "MilestoneCompleted",
        "PaymentStatusChange",
        "ContractorUpdate",

        // Quality assurance
        "QualityRating",
        "QualityFeedback",

        // Department/organization
        "DepartmentUpdate",
        "OrganizationAlert",
        "SubscriptionExpiry",

        // User-related
        "UserMention",
        "UserRoleChange",
      ],
      required: [true, "Notification type/category is required"],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    routineTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoutineTask",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
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
    linkedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "linkedDocumentType",
      validate: {
        validator: function (value) {
          const requiresDocument = [
            "TaskAssignment",
            "TaskReassignment",
            "TaskUpdate",
            "StatusChange",
            "TaskComment",
            "TaskReaction",
            "TeamAssignment",
            "TeamLeadDesignation",
            "MaterialUsage",
            "MilestoneUpdate",
            "MilestoneCompleted",
            "PaymentStatusChange",
            "QualityRating",
            "UserMention",
            "UserRoleChange",
          ];

          return !requiresDocument.includes(this.type) || value != null;
        },
        message: "Linked document is required for this notification type",
      },
    },
    linkedDocumentType: {
      type: String,
      enum: [
        "Department",
        "User",
        "Task",
        "TaskActivity",
        "RoutineTask",
        "Team",
        "Comment",
        "Material",
        "Milestone",
        "ProjectTask",
      ],
      validate: {
        validator: function (value) {
          return !this.linkedDocument || !!value;
        },
        message:
          "Linked document type is required if linkedDocument is provided",
      },
    },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
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

// Auto-expire after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
notificationSchema.index({ user: 1, isRead: 1 });

notificationSchema.plugin(mongoosePaginate);

export default mongoose.model("Notification", notificationSchema);
