import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { Following } from "../models/followings.model.js";
import mongoose from "mongoose";

// Toggle follow/unfollow user
const toggleFollowUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const followUserId = req.params.id;

  // Check if the user exists
  const followUser = await User.findById(followUserId);
  if (!followUser) {
    throw new ApiError(404, "User not found");
  }

  // Check if already following
  const isFollowing = await Following.findOne({
    follower: userId,
    followedTo: followUserId,
  });

  if (isFollowing) {
    // Unfollow the user
    await Following.deleteOne({ follower: userId, followedTo: followUserId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unfollowed successfully"));
  } else {
    // Follow the user
    const newFollow = await Following.create({
      follower: userId,
      followedTo: followUserId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Followed successfully"));
  }
});
// Get user followers with pagination and details
const getUserFollowers = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Aggregate to get followers with details
  const followers = await Following.aggregate([
    {
      $match: {
        followedTo: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        as: "followerDetails",
      },
    },
    { $unwind: "$followerDetails" },
    {
      $lookup: {
        from: "followings",
        let: { followerId: "$follower" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$follower",
                      new mongoose.Types.ObjectId(req.user._id),
                    ],
                  },
                  { $eq: ["$followedTo", "$$followerId"] },
                ],
              },
            },
          },
        ],
        as: "isLoggedInUserFollowing",
      },
    },
    {
      $addFields: {
        isLoggedInUserFollowing: {
          $gt: [{ $size: "$isLoggedInUserFollowing" }, 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        "followerDetails.username": 1,
        "followerDetails.fullName": 1,
        "followerDetails.avatar": 1,
        isLoggedInUserFollowing: 1,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { followers }, "Followers fetched successfully")
    );
});
// Get user followings with pagination and details
const getUserFollowings = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Aggregate to get followings with details
  const followings = await Following.aggregate([
    {
      $match: {
        follower: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followedTo",
        foreignField: "_id",
        as: "followingDetails",
      },
    },
    { $unwind: "$followingDetails" },
    {
      $lookup: {
        from: "followings",
        let: { followingId: "$followedTo" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$follower",
                      new mongoose.Types.ObjectId(req.user._id),
                    ],
                  },
                  { $eq: ["$followedTo", "$$followingId"] },
                ],
              },
            },
          },
        ],
        as: "isLoggedInUserFollowing",
      },
    },
    {
      $addFields: {
        isLoggedInUserFollowing: {
          $gt: [{ $size: "$isLoggedInUserFollowing" }, 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        "followingDetails.username": 1,
        "followingDetails.fullName": 1,
        "followingDetails.avatar": 1,
        isLoggedInUserFollowing: 1,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { followings }, "Followings fetched successfully")
    );
});

export { toggleFollowUser, getUserFollowers, getUserFollowings };
