import { Response } from "express";
import Announcement from "../models/Announcement";
import Notification from "../models/Notification";
import User from "../models/User";
import { AuthRequest } from "../types";
import { NotFoundError, ForbiddenError } from "../utils/AppError";
import { emitToAll } from "../config/socket";

/**
 * Create a new announcement
 */
export const createAnnouncement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      content,
      category,
      priority,
      imageUrl,
      attachments,
      expiresAt,
    } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category,
      priority: priority || "medium",
      author: req.user?.id,
      imageUrl,
      attachments,
      expiresAt,
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create announcement",
    });
  }
};

/**
 * Get all announcements (with filters)
 */
export const getAnnouncements = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, priority, isPublished } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Only show published announcements to residents
    if (req.user?.role === "resident") {
      query.isPublished = true;
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ];
    } else {
      // Admin/staff can see all or filter by published status
      if (isPublished !== undefined) {
        query.isPublished = isPublished === "true";
      }
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate("author", "firstName lastName role")
      .sort({ priority: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch announcements",
    });
  }
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "author",
      "firstName lastName role email"
    );

    if (!announcement) {
      throw new NotFoundError("Announcement not found");
    }

    // Check if user can view unpublished announcements
    if (!announcement.isPublished && req.user?.role === "resident") {
      throw new ForbiddenError("This announcement is not available");
    }

    // Increment views
    announcement.views += 1;
    await announcement.save();

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch announcement",
    });
  }
};

/**
 * Update announcement
 */
export const updateAnnouncement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      throw new NotFoundError("Announcement not found");
    }

    // Check authorization
    if (
      announcement.author.toString() !== req.user?.id &&
      req.user?.role !== "admin"
    ) {
      throw new ForbiddenError("Not authorized to update this announcement");
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("author", "firstName lastName role");

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update announcement",
    });
  }
};

/**
 * Publish announcement
 */
export const publishAnnouncement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      throw new NotFoundError("Announcement not found");
    }

    if (announcement.isPublished) {
      res.status(400).json({
        success: false,
        message: "Announcement is already published",
      });
      return;
    }

    announcement.isPublished = true;
    announcement.publishedAt = new Date();
    await announcement.save();

    // Notify all residents
    const residents = await User.find({ role: "resident" });

    for (const resident of residents) {
      await Notification.create({
        userId: resident._id,
        title: "New Announcement",
        message: `New ${announcement.priority} priority announcement: ${announcement.title}`,
        type: announcement.priority === "urgent" ? "warning" : "info",
        relatedId: announcement._id,
        relatedType: "announcement" as any,
      });
    }

    // Real-time notification
    emitToAll("announcement:new", {
      announcementId: announcement._id,
      title: announcement.title,
      category: announcement.category,
      priority: announcement.priority,
    });

    res.status(200).json({
      success: true,
      message: "Announcement published successfully",
      data: announcement,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to publish announcement",
    });
  }
};

/**
 * Unpublish announcement
 */
export const unpublishAnnouncement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      throw new NotFoundError("Announcement not found");
    }

    if (!announcement.isPublished) {
      res.status(400).json({
        success: false,
        message: "Announcement is not published",
      });
      return;
    }

    announcement.isPublished = false;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: "Announcement unpublished successfully",
      data: announcement,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to unpublish announcement",
    });
  }
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      throw new NotFoundError("Announcement not found");
    }

    // Check authorization
    if (
      announcement.author.toString() !== req.user?.id &&
      req.user?.role !== "admin"
    ) {
      throw new ForbiddenError("Not authorized to delete this announcement");
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete announcement",
    });
  }
};

/**
 * Get announcement statistics
 */
export const getAnnouncementStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await Announcement.aggregate([
      {
        $facet: {
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
          published: [{ $match: { isPublished: true } }, { $count: "count" }],
          draft: [{ $match: { isPublished: false } }, { $count: "count" }],
          totalViews: [{ $group: { _id: null, total: { $sum: "$views" } } }],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory: stats[0].byCategory,
        byPriority: stats[0].byPriority,
        published: stats[0].published[0]?.count || 0,
        draft: stats[0].draft[0]?.count || 0,
        totalViews: stats[0].totalViews[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};
