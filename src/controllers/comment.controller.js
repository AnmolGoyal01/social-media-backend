import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Add Comment
const addComment = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    throw new ApiError(401, "Comment is requierd");
  }

  // Create a new comment
  const newComment = await Comment.create({
    comment,
    commentedBy: req.user?._id,
    commentedPost: postId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
});
// Get All Comments for a Post with Pagination
const getComments = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Aggregate comments for the post with pagination
  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        commentedPost: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "commentedBy",
        foreignField: "_id",
        as: "commentedByDetails",
      },
    },
    { $unwind: "$commentedByDetails" },
    {
      $project: {
        _id: 1,
        comment: 1,
        createdAt: 1,
        "commentedByDetails.username": 1,
        "commentedByDetails.fullName": 1,
        "commentedByDetails.avatar": 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});
// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the logged-in user is the owner of the comment
  if (comment.commentedBy?.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }

  await comment.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { addComment, getComments, deleteComment };
