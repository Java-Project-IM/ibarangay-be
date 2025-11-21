import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('admin', 'staff'), createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/register', authenticate, registerForEvent);
router.post('/:id/unregister', authenticate, unregisterFromEvent);
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

export default router;