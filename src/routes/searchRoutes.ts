import { Router } from "express";
import { globalSearch } from "../controllers/searchController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Global search endpoint
router.get("/global", authenticate, globalSearch);

export default router;
