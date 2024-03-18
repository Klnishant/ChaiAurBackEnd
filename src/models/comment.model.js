import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true,
            trim:true,
        },
        videos:{
            type:Schema.Types.ObjectId,
            ref:"video",
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        }
    },
    {
        timestamps:true,
    }
);

export const comments = mongoose.model("comments",commentSchema);