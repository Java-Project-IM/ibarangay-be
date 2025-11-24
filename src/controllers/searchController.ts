import { Response } from "express";
import { AuthRequest } from "../types";
import Complaint from "../models/Complaint";
import Service from "../models/Service";
import Event from "../models/Event";
import User from "../models/User";
import Announcement from "../models/Announcement";

interface SearchResult {
  id: string;
  type: "complaint" | "service" | "event" | "user" | "announcement";
  title: string;
  description: string;
  url: string;
}

export const globalSearch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
      return;
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const results: SearchResult[] = [];
    const userRole = req.user?.role;

    // Search Complaints
    const complaintQuery: any = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    };

    // Residents only see their own complaints
    if (userRole === "resident") {
      complaintQuery.userId = req.user?.id;
    }

    const complaints = await Complaint.find(complaintQuery)
      .limit(10)
      .select("_id title description status")
      .lean();

    complaints.forEach((complaint) => {
      results.push({
        id: complaint._id.toString(),
        type: "complaint",
        title: complaint.title,
        description: `${complaint.description.substring(0, 100)}... (Status: ${complaint.status})`,
        url: `/complaints?id=${complaint._id}`,
      });
    });

    // Search Services
    const serviceQuery: any = {
      $or: [
        { itemName: searchRegex },
        { itemType: searchRegex },
        { purpose: searchRegex },
      ],
    };

    if (userRole === "resident") {
      serviceQuery.userId = req.user?.id;
    }

    const services = await Service.find(serviceQuery)
      .limit(10)
      .select("_id itemName purpose status")
      .lean();

    services.forEach((service) => {
      results.push({
        id: service._id.toString(),
        type: "service",
        title: service.itemName,
        description: `${service.purpose.substring(0, 100)}... (Status: ${service.status})`,
        url: `/services?id=${service._id}`,
      });
    });

    // Search Events
    const events = await Event.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
      ],
    })
      .limit(10)
      .select("_id title description eventDate location")
      .lean();

    events.forEach((event) => {
      results.push({
        id: event._id.toString(),
        type: "event",
        title: event.title,
        description: `${event.description.substring(0, 100)}... (${new Date(event.eventDate).toLocaleDateString()} at ${event.location})`,
        url: `/events?id=${event._id}`,
      });
    });

    // Search Announcements
    const announcements = await Announcement.find({
      status: "published",
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
      ],
    })
      .limit(10)
      .select("_id title content priority")
      .lean();

    announcements.forEach((announcement) => {
      results.push({
        id: announcement._id.toString(),
        type: "announcement",
        title: announcement.title,
        description: `${announcement.content.substring(0, 100)}... (Priority: ${announcement.priority})`,
        url: `/announcements?id=${announcement._id}`,
      });
    });

    // Search Users (admin/staff only)
    if (userRole === "admin" || userRole === "staff") {
      const users = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      })
        .limit(10)
        .select("_id firstName lastName email role")
        .lean();

      users.forEach((user) => {
        results.push({
          id: user._id.toString(),
          type: "user",
          title: `${user.firstName} ${user.lastName}`,
          description: `${user.email} (${user.role})`,
          url: `/admin/users?id=${user._id}`,
        });
      });
    }

    // Sort results by relevance (prioritize title matches)
    results.sort((a, b) => {
      const aScore = a.title.toLowerCase().includes(query.toLowerCase())
        ? 1
        : 0;
      const bScore = b.title.toLowerCase().includes(query.toLowerCase())
        ? 1
        : 0;
      return bScore - aScore;
    });

    res.status(200).json({
      success: true,
      data: results.slice(0, 20), // Limit to 20 total results
      query: query.trim(),
      count: results.length,
    });
  } catch (error: any) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Search failed",
    });
  }
};
