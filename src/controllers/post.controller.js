import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/posts.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/likes.model.js";
import { Comment } from "../models/comments.model.js";
import { Save } from "../models/saved.model.js";
import mongoose from "mongoose";

// Create a new Post
const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new ApiError(400, "Image is required for a post");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image?.url) {
    throw new ApiError(500, "Error uploading image to Cloudinary");
  }

  const post = await Post.create({
    image: image.url,
    caption: caption.trim(),
    owner: req.user._id,
  });

  const createdPost = await Post.findById(post?._id);
  if (!createPost) {
    throw new ApiError(500, "Error creating the post");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdPost, "Post created successfully"));
});
// Get a post by ID
const getPostById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params?.id;

  const postDetails = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId),
      },
    }, // Match the post by ID
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
    { $unwind: "$ownerDetails" }, // Unwind the owner details array
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "likedPost",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "saves",
        localField: "_id",
        foreignField: "savedPost",
        as: "saves",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "commentedPost",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" }, // Count total likes
        commentsCount: { $size: "$comments" }, // Count total comments
        isLiked: {
          $in: [userId, "$likes.likedBy"], // Check if the user has liked the post
        },
        isSaved: {
          $in: [userId, "$saves.savedBy"], // Check if the user has saved the post
        },
      },
    },
    {
      $project: {
        _id: 1,
        caption: 1,
        image: 1,
        createdAt: 1,
        likesCount: 1,
        isLiked: 1,
        isSaved: 1,
        ownerDetails :1,
        commentsCount: 1,
      },
    },
  ]);

  if (!postDetails?.length) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, postDetails[0], "Post fetched successfully"));
});
// Get all posts (with pagination)
const getAllPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { page = 1, limit = 10 } = req.query;

  const posts = await Post.aggregate([
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
              privateAccount: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $lookup: {
        from: "followings",
        localField: "owner",
        foreignField: "followedTo",
        as: "isFollowing",
        pipeline: [
          {
            $match: {
              follower: new mongoose.Types.ObjectId(userId),
            },
          },
        ],
      },
    },
    {
      $addFields: {
        isFollowing: { $gt: [{ $size: "$isFollowing" }, 0] },
        isVisible: {
          $or: [
            { $eq: ["$ownerDetails.privateAccount", false] },
            { $eq: ["$isFollowing", true] },
          ],
        },
      },
    },
    {
      $match: {
        isVisible: true,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "likedPost",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "saves",
        localField: "_id",
        foreignField: "savedPost",
        as: "saves",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "commentedPost",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
        isLiked: { $in: [userId, "$likes.likedBy"] },
        isSaved: { $in: [userId, "$saves.savedBy"] },
      },
    },
    {
      $project: {
        _id: 1,
        caption: 1,
        image: 1,
        createdAt: 1,
        createdAt: 1,
        likesCount: 1,
        commentsCount: 1,
        isLiked: 1,
        isSaved: 1,
        ownerDetails: 1,
      },
    },
    {
      $sort: { updatedAt: -1 }, // Sort by most recent posts first
    },
    {
      $skip: (page - 1) * limit, // Pagination: skip results based on page and limit
    },
    {
      $limit: parseInt(limit), // Limit results to 'limit'
    },
  ]);

  if (!posts?.length) {
    throw new ApiError(404, "No posts found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Posts fetched successfully"));
});
// Update a post
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { caption } = req.body;

  const post = await Post.findById(id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.owner?.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized to update this post");
  }

  post.caption = caption || post.caption;
  await post.save({ validateBeforeSave: true });
  //   const updatedPost = await Post.findById(post?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post updated successfully"));
});
// Delete a post
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this post");
  }

  // Delete associated comments, likes, and saved records
  await Promise.all([
    Comment.deleteMany({ commentedPost: post._id }), // Delete all comments on this post
    Like.deleteMany({ likedPost: post._id }), // Delete all likes on this post
    Save.deleteMany({ savedPost: post._id }), // Delete all saved instances of this post
  ]);
  // Delete the post itself
  await Post.findByIdAndDelete(post._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Post and associated data deleted successfully")
    );
});
// Like/Unlike a post
const toggleLikePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(404, "post not found");
  }
  const alreadyLiked = await Like.findOne({
    likedBy: req.user?._id,
    likedPost: req.post?._id,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Removed like from post sucessfully"));
  } else {
    const likePost = await Like.create({
      likedBy: req.user?._id,
      likedPost: req.post?._id,
    });
    if (!likePost) {
      throw new ApiError(500, "Error Liking this post");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likePost, "liked post sucessfully"));
  }
});

// when getting a post, required res -> post details, owner details, isFollowingOwner, no. of likes, does user likes the post, does user saved the post

export {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLikePost,
};
