import { Router } from "express";
import {
  toggleFollowUser,
  getUserFollowers,
  getUserFollowings,
} from "../controllers/following.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

// Route to follow/unfollow a user
router.route("/follow/:id").post(toggleFollowUser);

// Route to get a user's followers
router.route("/followers/:username").get(getUserFollowers);

// Route to get a user's followings
router.route("/followings/:username").get(getUserFollowings);

export default router;
