import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import { Following } from "../models/followings.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating Access and Refresh Tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [fullName, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.trim().toLowerCase() }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avatarLocalPath = req.file?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    console.log("unable to upload avatar");
    // throw new ApiError(400, "unable to upload avatar")
  }

  const user = await User.create({
    username: username.replace(/\s+/g, "").toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Sucessfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }
  }
  q;
  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User logged in Sucessfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refreshtoken");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request");
  }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    throw new ApiError(401, "Old password is required");
  }
  if (!newPassword) {
    throw new ApiError(401, "New password is required");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid old password");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(401, "New password is same as Old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password updated sucessfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched sucessfully"));
});
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(401, "Error while uploading on Cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-passowrd -refreshToken");

  //todo Delete old Avatar file from cloudinary

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated Sucessfully"));
});
const getUserProfile = asyncHandler(async (req, res) => {
  // todo return user followers, followings, number of posts, posts(use pagination if possible),
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "username not available");
  }

  const user = await User.findOne({
    username: username.toLowerCase().replace(/\s+/g, ""),
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPrivateAccount = user.privateAccount;
  const isFollowing = await Following.findOne({
    $and: [
      {
        follower: req.user?._id,
      },
      {
        followedTo: user._id,
      },
    ],
  });

  const aggregationPipelines = [
    {
      $match: {
        username: username.toLowerCase().replace(/\s+/g, ""),
      },
    },
    {
      $lookup: {
        from: "followings",
        localField: "_id",
        foreignField: "follower",
        as: "followingTo",
      },
    },
    {
      $lookup: {
        from: "followings",
        localField: "_id",
        foreignField: "followedTo",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "owner",
        as: "posts",
      },
    },
    {
      $addFields: {
        followersCount: {
          $size: "$followers",
        },
        followingToCount: {
          $size: "$followingTo",
        },
        isFollowing: { $toBool: isFollowing }, // todo check this
        postsCount: {
          $size: "$posts",
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        bio: 1,
        privateAccount: 1,
        followersCount: 1,
        followingToCount: 1,
        isFollowing: 1,
        postsCount: 1,
      },
    },
  ];

  if (isFollowing || !isPrivateAccount) {
    aggregationPipelines[5].$project.posts = 1;
  }
  const resultUser = await User.aggregate(aggregationPipelines);
  if (!resultUser?.length) {
    throw new ApiError(400, "error fetching user profile");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, resultUser[0], "user fetched sucessfully"));
});
const togglePrivate = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: {
        privateAccount: !req.user?.privateAccount,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(500, "Error changing the privateAccount status");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "toggled privateAccount status sucessfully")
    );
});
const updateBio = asyncHandler(async (req, res) => {
  const { bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        bio,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(500, "Error updating bio");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "bio updated sucessfully"));
});
const updateFullName = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (!fullName) {
    throw new ApiError(500, "fullName can not be empty!");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(500, "Error updating fullName");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "fullName updated sucessfully"));
});
const updateUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(500, "username can not be empty!");
  }
  const isAlreadyTaken = await User.findOne({
    username: username.replace(/\s+/g, "").trim(),
  });
  if (isAlreadyTaken) {
    throw new ApiError(401, "username already taken");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username.toLowerCase().replace(/\s+/g, ""),
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(500, "Error updating username");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "username updated sucessfully"));
});

export {
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
};
