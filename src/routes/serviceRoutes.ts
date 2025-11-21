import { Router } from 'express';
import {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceStatus,
  deleteServiceRequest,
} from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createServiceRequest);
router.get('/', authenticate, getServiceRequests);
router.get('/:id', authenticate, getServiceRequestById);
router.put('/:id/status', authenticate, authorize('admin', 'staff'), updateServiceStatus);
router.delete('/:id', authenticate, deleteServiceRequest);

export default router;