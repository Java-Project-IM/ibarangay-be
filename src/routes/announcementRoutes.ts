import { Router } from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats,
} from "../controllers/announcementController";
import { authenticate, authorize } from "../middleware/auth";
import {
  announcementValidation,
  idValidation,
  queryValidation,
} from "../middleware/validation";

const router = Router();

// Public routes (with optional auth)
router.get("/", authenticate, queryValidation, getAnnouncements);
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  getAnnouncementStats
);
router.get("/:id", authenticate, idValidation, getAnnouncementById);

// Protected routes (admin/staff only)
router.post(
  "/",
  authenticate,
  authorize("admin", "staff"),
  announcementValidation,
  createAnnouncement
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  idValidation,
  updateAnnouncement
);

router.patch(
  "/:id/publish",
  authenticate,
  authorize("admin", "staff"),
  idValidation,
  publishAnnouncement
);

router.patch(
  "/:id/unpublish",
  authenticate,
  authorize("admin", "staff"),
  idValidation,
  unpublishAnnouncement
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  idValidation,
  deleteAnnouncement
);

export default router;
