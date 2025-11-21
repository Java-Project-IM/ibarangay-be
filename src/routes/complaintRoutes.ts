import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} from '../controllers/complaintController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createComplaint);
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.put('/:id/status', authenticate, authorize('admin', 'staff'), updateComplaintStatus);
router.delete('/:id', authenticate, deleteComplaint);

export default router;