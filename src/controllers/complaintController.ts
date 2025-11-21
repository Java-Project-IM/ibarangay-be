import { Response } from "express";
import Complaint from "../models/Complaint";
import Notification from "../models/Notification";
import { AuthRequest } from "../types";

export const createComplaint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, priority, attachments } = req.body;

    const complaint = await Complaint.create({
      userId: req.user?.id,
      title,
      description,
      category,
      priority: priority || "medium",
      attachments,
      status: "pending",
    });

    // Create notification
    await Notification.create({
      userId: req.user?.id,
      title: "Complaint Submitted",
      message: `Your complaint "${title}" has been submitted successfully.`,
      type: "info",
      relatedId: complaint._id,
      relatedType: "complaint",
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit complaint",
    });
  }
};

export const getComplaints = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const query: any = {};

    // If resident, only show their own complaints
    if (req.user?.role === "resident") {
      query.userId = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const complaints = await Complaint.find(query)
      .populate("userId", "firstName lastName email")
      .populate("resolvedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch complaints",
    });
  }
};

export const getComplaintById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("resolvedBy", "firstName lastName");

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
      return;
    }

    // Check authorization
    if (
      req.user?.role === "resident" &&
      complaint.userId.toString() !== req.user.id
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to view this complaint",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch complaint",
    });
  }
};

export const updateComplaintStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, response } = req.body;

    const updateData: any = { status };

    if (response) {
      updateData.response = response;
    }

    if (status === "resolved" || status === "closed") {
      updateData.resolvedBy = req.user?.id;
      updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
      return;
    }

    // Create notification for user
    const notificationMessages: Record<string, string> = {
      "in-progress": "Your complaint is now being processed.",
      resolved: "Your complaint has been resolved.",
      closed: "Your complaint has been closed.",
    };

    await Notification.create({
      userId: complaint.userId,
      title: "Complaint Update",
      message:
        notificationMessages[status] ||
        "Your complaint status has been updated.",
      type: status === "resolved" ? "success" : "info",
      relatedId: complaint._id,
      relatedType: "complaint",
    });

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update complaint",
    });
  }
};

export const deleteComplaint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
      return;
    }

    // Only allow deletion if pending and user owns it
    if (
      complaint.status !== "pending" ||
      complaint.userId.toString() !== req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "Cannot delete this complaint",
      });
      return;
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete complaint",
    });
  }
};
