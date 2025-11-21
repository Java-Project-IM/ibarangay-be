import { Request } from "express";
import { Document } from "mongoose";

export interface IUser extends Document {
  _id: any;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "resident";
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IService extends Document {
  _id: any;
  userId: string;
  itemName: string;
  itemType: string;
  borrowDate: Date;
  returnDate?: Date;
  expectedReturnDate: Date;
  status: "pending" | "approved" | "borrowed" | "returned" | "rejected";
  purpose: string;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComplaint extends Document {
  _id: any;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  attachments?: string[];
  response?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent extends Document {
  _id: any;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  organizer: string;
  maxAttendees?: number;
  attendees: string[];
  category: string;
  imageUrl?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: any;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  relatedId?: string;
  relatedType?: "service" | "complaint" | "event";
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export interface JWTPayload {
  id: string;
  role: string;
}
