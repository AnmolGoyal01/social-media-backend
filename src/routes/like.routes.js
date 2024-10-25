import { Router } from "express";
import { toggleLike, getLikesOnPost } from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { canViewPost } from "../middlewares/postAuth.middleware.js";

const router = Router();
router.use(verifyJwt);
router.use(canViewPost);

// Toggle like on a post
router.route("/p/:id").post(toggleLike);

// Get likes on a post
router.route("/p/:id").get(getLikesOnPost);

export default router;
