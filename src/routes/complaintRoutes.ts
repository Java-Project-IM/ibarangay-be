import { Router } from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/complaintController";
import { authenticate, authorize } from "../middleware/auth";
import { complaintValidation, idValidation } from "../middleware/validation";

const router = Router();

router.post("/", authenticate, complaintValidation, createComplaint);
router.get("/", authenticate, getComplaints);
router.get("/:id", authenticate, idValidation, getComplaintById);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "staff"),
  idValidation,
  updateComplaintStatus
);
router.delete("/:id", authenticate, idValidation, deleteComplaint);

export default router;
