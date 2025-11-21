import { Response } from "express";
import Service from "../models/Service";
import Notification from "../models/Notification";
import { AuthRequest } from "../types";

export const createServiceRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      itemName,
      itemType,
      borrowDate,
      expectedReturnDate,
      purpose,
      quantity,
      notes,
    } = req.body;

    const service = await Service.create({
      userId: req.user?.id,
      itemName,
      itemType,
      borrowDate,
      expectedReturnDate,
      purpose,
      quantity,
      notes,
      status: "pending",
    });

    // Create notification
    await Notification.create({
      userId: req.user?.id,
      title: "Service Request Submitted",
      message: `Your request for ${itemName} has been submitted and is pending approval.`,
      type: "info",
      relatedId: service._id,
      relatedType: "service",
    });

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      data: service,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create service request",
    });
  }
};

export const getServiceRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};

    // If not admin/staff, only show user's own requests
    if (req.user?.role === "resident") {
      query.userId = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const services = await Service.find(query)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch service requests",
    });
  }
};

export const getServiceRequestById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "userId",
      "firstName lastName email"
    );

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service request not found",
      });
      return;
    }

    // Check authorization
    if (
      req.user?.role === "resident" &&
      service.userId.toString() !== req.user.id
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to view this request",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch service request",
    });
  }
};

export const updateServiceStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, notes } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        ...(status === "returned" && { returnDate: new Date() }),
      },
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service request not found",
      });
      return;
    }

    // Create notification for user
    const notificationMessages: Record<string, string> = {
      approved: "Your service request has been approved.",
      rejected: "Your service request has been rejected.",
      borrowed: "Item has been borrowed successfully.",
      returned: "Item has been returned successfully.",
    };

    await Notification.create({
      userId: service.userId,
      title: "Service Request Update",
      message:
        notificationMessages[status] ||
        "Your service request status has been updated.",
      type: status === "rejected" ? "error" : "success",
      relatedId: service._id,
      relatedType: "service",
    });

    res.status(200).json({
      success: true,
      message: "Service status updated successfully",
      data: service,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update service status",
    });
  }
};

export const deleteServiceRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service request not found",
      });
      return;
    }

    // Only allow deletion if pending and user owns it
    if (
      service.status !== "pending" ||
      service.userId.toString() !== req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "Cannot delete this service request",
      });
      return;
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service request deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete service request",
    });
  }
};
