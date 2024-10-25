import { Router } from "express";
import {
  toggleSavePost,
  getAllSavedPosts,
} from "../controllers/savePost.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { canViewPost } from "../middlewares/postAuth.middleware.js";

const router = Router();
router.use(verifyJwt);

// Toggle save/unsave a post
router.route("/p/:id").post(canViewPost, toggleSavePost);

// Get all saved posts for the user
router.route("/saved").get(getAllSavedPosts);

export default router;
