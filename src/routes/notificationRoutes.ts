import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";
import { idValidation } from "../middleware/validation";

const router = Router();

router.get("/", authenticate, getNotifications);
router.put("/:id/read", authenticate, idValidation, markAsRead);
router.put("/read-all", authenticate, markAllAsRead);
router.delete("/:id", authenticate, idValidation, deleteNotification);

export default router;
