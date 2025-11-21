declare module "../controllers/authController" {
  import { Request, Response } from "express";
  export function register(req: Request, res: Response): Promise<void>;
  export function login(req: Request, res: Response): Promise<void>;
  export function getProfile(req: any, res: Response): Promise<void>;
  export function updateProfile(req: any, res: Response): Promise<void>;
}

declare module "../controllers/complaintController" {
  import { Response } from "express";
  export function createComplaint(req: any, res: Response): Promise<void>;
  export function getComplaints(req: any, res: Response): Promise<void>;
  export function getComplaintById(req: any, res: Response): Promise<void>;
  export function updateComplaintStatus(req: any, res: Response): Promise<void>;
  export function deleteComplaint(req: any, res: Response): Promise<void>;
}

declare module "../controllers/eventController" {
  import { Response } from "express";
  export function createEvent(req: any, res: Response): Promise<void>;
  export function getEvents(req: any, res: Response): Promise<void>;
  export function getEventById(req: any, res: Response): Promise<void>;
  export function registerForEvent(req: any, res: Response): Promise<void>;
  export function unregisterFromEvent(req: any, res: Response): Promise<void>;
  export function updateEvent(req: any, res: Response): Promise<void>;
  export function deleteEvent(req: any, res: Response): Promise<void>;
}

declare module "../controllers/notificationController" {
  import { Response } from "express";
  export function getNotifications(req: any, res: Response): Promise<void>;
  export function markAsRead(req: any, res: Response): Promise<void>;
  export function markAllAsRead(req: any, res: Response): Promise<void>;
  export function deleteNotification(req: any, res: Response): Promise<void>;
}

declare module "../controllers/serviceController" {
  import { Response } from "express";
  export function createServiceRequest(req: any, res: Response): Promise<void>;
  export function getServiceRequests(req: any, res: Response): Promise<void>;
  export function getServiceRequestById(req: any, res: Response): Promise<void>;
  export function updateServiceStatus(req: any, res: Response): Promise<void>;
  export function deleteServiceRequest(req: any, res: Response): Promise<void>;
}
