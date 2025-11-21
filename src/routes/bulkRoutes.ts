import { Router } from "express";
import {
  bulkUpdateStatus,
  bulkAssign,
  bulkDelete,
  exportComplaints,
} from "../controllers/bulkController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All bulk operations require admin or staff role
router.put(
  "/complaints/status",
  authenticate,
  authorize("admin", "staff"),
  bulkUpdateStatus
);

router.put(
  "/complaints/assign",
  authenticate,
  authorize("admin", "staff"),
  bulkAssign
);

router.delete("/complaints", authenticate, authorize("admin"), bulkDelete);

router.get(
  "/complaints/export",
  authenticate,
  authorize("admin", "staff"),
  exportComplaints
);

export default router;
