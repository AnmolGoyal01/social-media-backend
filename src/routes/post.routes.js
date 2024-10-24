import { Router } from "express";
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLikePost,
} from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { canViewPost } from "../middlewares/postAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJwt); // Apply verifyJwt middleware to all routes in this file

// Create a new post (with image upload)
router.route("/").post(upload.single("image"), createPost);

// Get all posts (with pagination)
router.route("/").get(getAllPosts);

// Get a post by ID
router.route("/:id").get(canViewPost, getPostById);

// Update a post by ID
router.route("/:id").patch(updatePost);

// Delete a post by ID
router.route("/:id").delete(deletePost);

// Toggle like/unlike on a post
router.route("/:id/toggle-like").post(canViewPost, toggleLikePost);

export default router;
