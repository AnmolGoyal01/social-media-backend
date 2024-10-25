import { Router } from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { canViewPost } from "../middlewares/postAuth.middleware.js";

const router = Router();

router.use(verifyJwt);

// Add a new comment to a post
router.route("/p/:id").post(canViewPost,addComment);

// Get all comments for a post with pagination
router.route("/p/:id").get(canViewPost,getComments);

// Delete a specific comment
router.route("/c/:commentId").delete(deleteComment);

export default router;
