import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        comments:{
            type:Schema.Types.ObjectId,
            ref:"comments",
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"video",
        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"Tweet",
        }
    },
    {
        timestamps:true,
    }
);

export const likes = mongoose.model("likes",likeSchema);