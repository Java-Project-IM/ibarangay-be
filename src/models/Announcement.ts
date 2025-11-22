import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category:
    | "general"
    | "emergency"
    | "event"
    | "maintenance"
    | "health"
    | "security";
  priority: "low" | "medium" | "high" | "urgent";
  author: mongoose.Types.ObjectId;
  imageUrl?: string;
  attachments?: string[];
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title must not exceed 150 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [20, "Content must be at least 20 characters"],
      maxlength: [5000, "Content must not exceed 5000 characters"],
    },
    category: {
      type: String,
      enum: [
        "general",
        "emergency",
        "event",
        "maintenance",
        "health",
        "security",
      ],
      required: [true, "Category is required"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    imageUrl: {
      type: String,
    },
    attachments: [
      {
        type: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
announcementSchema.index({ category: 1, isPublished: 1 });
announcementSchema.index({ priority: 1, isPublished: 1 });
announcementSchema.index({ publishedAt: -1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ createdAt: -1 });

// Virtual for checking if announcement is expired
announcementSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

export default mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema
);
