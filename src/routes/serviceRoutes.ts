import { Router } from "express";
import {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceStatus,
  deleteServiceRequest,
} from "../controllers/serviceController";
import { authenticate, authorize } from "../middleware/auth";
import {
  serviceRequestValidation,
  idValidation,
} from "../middleware/validation";

const router = Router();

router.post("/", authenticate, serviceRequestValidation, createServiceRequest);
router.get("/", authenticate, getServiceRequests);
router.get("/:id", authenticate, idValidation, getServiceRequestById);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "staff"),
  idValidation,
  updateServiceStatus
);
router.delete("/:id", authenticate, idValidation, deleteServiceRequest);

export default router;
