import { Save } from "../models/saved.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Toggle Save/Unsave Post
const toggleSavePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user?._id;

  // Check if the post is already saved by the user
  const existingSave = await Save.findOne({
    savedBy: userId,
    savedPost: postId,
  });

  if (existingSave) {
    // If post is already saved, unsave it
    await existingSave.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post unsaved successfully"));
  } else {
    // If post is not saved, save it
    const newSave = await Save.create({
      savedBy: userId,
      savedPost: postId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newSave, "Post saved successfully"));
  }
});
// Get All Saved Posts with Details (with Pagination)
const getAllSavedPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  // Aggregate saved posts with post and owner details
  const savedPostsAggregate = Save.aggregate([
    { $match: { savedBy: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "posts",
        localField: "savedPost",
        foreignField: "_id",
        as: "postDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
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
          {
            $unwind: "$ownerDetails",
          },
          {
            $project: {
              _id: 1,
              caption: 1,
              image: 1,
              createdAt: 1,
              "ownerDetails.username": 1,
              "ownerDetails.fullName": 1,
              "ownerDetails.avatar": 1,
            },
          },
        ],
      },
    },
    { $unwind: "$postDetails" },
    { $sort: { "postDetails.createdAt": -1 } },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const savedPosts = await Save.aggregatePaginate(savedPostsAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, savedPosts, "Saved posts fetched successfully"));
});

export { toggleSavePost, getAllSavedPosts };
