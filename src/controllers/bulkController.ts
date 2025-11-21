import { Response } from "express";
import Complaint from "../models/Complaint";
import User from "../models/User";
import Notification from "../models/Notification";
import { AuthRequest } from "../types";
import { emitToUser, emitToComplaint } from "../config/socket";
import {
  exportComplaintsToCSV,
  exportComplaintsToExcel,
  deleteExportFile,
} from "../utils/exportHelper";
import path from "path";

export const bulkUpdateStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { complaintIds, status, response } = req.body;

    if (
      !complaintIds ||
      !Array.isArray(complaintIds) ||
      complaintIds.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide an array of complaint IDs",
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const updateData: any = {
      status,
      $push: {
        history: {
          action: "Bulk status update",
          performedBy: req.user?.id,
          newStatus: status,
          notes: response || "Bulk update performed",
          timestamp: new Date(),
        },
      },
    };

    if (response) {
      updateData.response = response;
    }

    if (status === "resolved" || status === "closed") {
      updateData.resolvedBy = req.user?.id;
      updateData.resolvedAt = new Date();
    }

    const result = await Complaint.updateMany(
      { _id: { $in: complaintIds } },
      updateData
    );

    // Send notifications to users
    const complaints = await Complaint.find({ _id: { $in: complaintIds } });

    for (const complaint of complaints) {
      await Notification.create({
        userId: complaint.userId,
        title: "Complaint Updated",
        message: `Your complaint "${complaint.title}" status has been updated to ${status}`,
        type: status === "resolved" ? "success" : "info",
        relatedId: complaint._id,
        relatedType: "complaint",
      });

      // Emit real-time update
      emitToUser(complaint.userId.toString(), "complaint:updated", {
        complaintId: complaint._id,
        status,
      });

      emitToComplaint(complaint._id.toString(), "status:changed", {
        status,
        updatedBy: req.user?.id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} complaints`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk update complaints",
    });
  }
};

export const bulkAssign = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { complaintIds, staffId } = req.body;

    if (
      !complaintIds ||
      !Array.isArray(complaintIds) ||
      complaintIds.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide an array of complaint IDs",
      });
      return;
    }

    if (!staffId) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") {
      res.status(400).json({
        success: false,
        message: "Invalid staff member",
      });
      return;
    }

    const result = await Complaint.updateMany(
      { _id: { $in: complaintIds } },
      {
        assignedTo: staffId,
        $push: {
          history: {
            action: "Bulk assignment",
            performedBy: req.user?.id,
            notes: `Bulk assigned to ${staff.firstName} ${staff.lastName}`,
            timestamp: new Date(),
          },
        },
      }
    );

    // Notify assigned staff
    await Notification.create({
      userId: staffId,
      title: "Bulk Assignment",
      message: `You have been assigned ${result.modifiedCount} new complaints`,
      type: "info",
    });

    emitToUser(staffId, "complaints:bulk-assigned", {
      count: result.modifiedCount,
    });

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${result.modifiedCount} complaints to ${staff.firstName} ${staff.lastName}`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk assign complaints",
    });
  }
};

export const bulkDelete = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { complaintIds } = req.body;

    if (
      !complaintIds ||
      !Array.isArray(complaintIds) ||
      complaintIds.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide an array of complaint IDs",
      });
      return;
    }

    // Only allow deletion of pending complaints
    const result = await Complaint.deleteMany({
      _id: { $in: complaintIds },
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} complaints`,
      data: {
        deleted: result.deletedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk delete complaints",
    });
  }
};

export const exportComplaints = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      format = "csv",
      status,
      priority,
      category,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const complaints = await Complaint.find(query)
      .populate("userId", "firstName lastName email")
      .populate("assignedTo", "firstName lastName")
      .sort({ createdAt: -1 });

    const filename = `complaints-export-${Date.now()}`;
    let filePath: string;

    if (format === "excel" || format === "xlsx") {
      filePath = await exportComplaintsToExcel(complaints, filename);
    } else {
      filePath = await exportComplaintsToCSV(complaints, filename);
    }

    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        console.error("Download error:", err);
      }
      // Delete file after download
      setTimeout(() => deleteExportFile(filePath), 5000);
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to export complaints",
    });
  }
};
