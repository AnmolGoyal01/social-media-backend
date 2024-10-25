import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

saveSchema.plugin(mongooseAggregatePaginate);

export const Save = model("Save", saveSchema);
