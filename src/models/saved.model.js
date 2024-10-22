import { Schema, model } from "mongoose";

const saveSchema = new Schema(
  {
    savedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    savedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const Save = model("Save", saveSchema);
