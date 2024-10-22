import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    commentedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: String,
      required: [True, "comment can not be empty"],
    },
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
