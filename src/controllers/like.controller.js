import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";

// Toggle like on a post
const toggleLike = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    likedBy: userId,
    likedPost: postId,
  });

  if (existingLike) {
    // Unlike the post if already liked
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post unliked successfully"));
  } else {
    // Like the post if not already liked
    await Like.create({ likedBy: userId, likedPost: postId });
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Post liked successfully"));
  }
});
// Get all users who liked a specific post
const getLikesOnPost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  // Aggregation pipeline for paginated likes
  const aggregationPipeline = [
    {
      $match: { likedPost: new mongoose.Types.ObjectId(postId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$userDetails" },
    {
      $lookup: {
        from: "followings",
        let: { followerId: "$userDetails._id" },
        pipeline: [
          {
            $match: {
              $and: [{ follower: userId }, { followedTo: "$$followerId" }],
            },
          },
        ],
        as: "isFollowing",
      },
    },
    {
      $addFields: {
        isFollowing: { $gt: [{ $size: "$isFollowing" }, 0] },
      },
    },
    {
      $project: {
        _id: 0,
        userDetails: 1,
        isFollowing: 1,
      },
    },
  ];

  // Pagination options
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  // Use aggregatePaginate for paginated results
  const paginatedLikes = await Like.aggregatePaginate(
    Like.aggregate(aggregationPipeline),
    options
  );

  if (!paginatedLikes?.docs?.length) {
    throw new ApiError(404, "No likes found for this post");
  }

  const totalLikes = await Like.countDocuments({ likedPost: postId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalLikes, likes: paginatedLikes.docs },
        "Likes fetched successfully"
      )
    );
});

export { toggleLike, getLikesOnPost };
