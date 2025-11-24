import { Request } from "express";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "resident";
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

export interface IService extends Document {
  userId: Types.ObjectId;
  itemName: string;
  itemType: string;
  borrowDate: Date;
  returnDate?: Date;
  expectedReturnDate: Date;
  status: "pending" | "approved" | "borrowed" | "returned" | "rejected";
  purpose: string;
  quantity: number;
  notes?: string;
  rejectionReason?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  assignedTo?: Types.ObjectId;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComplaintComment {
  userId: Types.ObjectId;
  message: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface IComplaintHistory {
  action: string;
  performedBy: Types.ObjectId;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  timestamp: Date;
}

export interface IComplaint extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  attachments?: string[];
  response?: string;
  assignedTo?: Types.ObjectId;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  comments: IComplaintComment[];
  history: IComplaintHistory[];
  rating?: number;
  feedback?: string;
  escalationLevel: number;
  lastEscalatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  eventDate: Date;
  date?: Date;
  location: string;
  organizer: Types.ObjectId;
  maxAttendees?: number;
  attendees: Types.ObjectId[];
  category: string;
  imageUrl?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  relatedId?: Types.ObjectId;
  relatedType?: "service" | "complaint" | "event" | "announcement";
  createdAt: Date;
}

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
  author: Types.ObjectId;
  imageUrl?: string;
  attachments?: string[];
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: Types.ObjectId;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
  id?: string;
}

export interface JWTPayload {
  id: string;
  role: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  totalServices: number;
  totalEvents: number;
  totalUsers: number;
  totalAnnouncements: number;
  complaintsByCategory: Array<{ category: string; count: number }>;
  complaintsByPriority: Array<{ priority: string; count: number }>;
  recentActivity: Array<any>;
  averageResolutionTime: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface FilterQuery {
  status?: string;
  category?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
}