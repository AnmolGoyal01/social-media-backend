import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAvatar,
  togglePrivate,
  updateBio,
  updateFullName,
  updateUsername,
  getUserProfile,
  getFeed,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/current-user").get(verifyJwt, getCurrentUser);
// router.route("/update-account").patch(verifyJwt, updateUserInfo);
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar);
router.route("/privateAccount").patch(verifyJwt, togglePrivate);
router.route("/bio").patch(verifyJwt, updateBio);
router.route("/fullName").patch(verifyJwt, updateFullName);
router.route("/username").patch(verifyJwt, updateUsername);
router.route("/u/:username").get(verifyJwt, getUserProfile);
router.route("/feed").get(verifyJwt, getFeed);

export default router;
