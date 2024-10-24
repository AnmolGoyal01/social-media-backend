import { Following } from "../models/followings.model.js";
import { Post } from "../models/posts.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const canViewPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // post ID

  const post = await Post.findById(id).populate(
    "owner",
    "username privateAccount fullName avatar"
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const owner = post.owner;

  if (owner.privateAccount) {
    // Check if the user is following the post owner
    const isFollowing = await Following.findOne({
      follower: req.user._id,
      followedTo: owner._id,
    });

    if (!isFollowing) {
      throw new ApiError(
        403,
        "You cannot view this post as the owner has a private account"
      );
    }
  }

  // Attach the post to the request so the next middleware can use it
  req.post = post;
  next();
});

export { canViewPost };
