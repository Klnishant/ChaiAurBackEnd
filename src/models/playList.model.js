import mongoose, {Schema} from "mongoose";

const playListSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        description:{
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
        },
    },
    {
        timestamps:true,
    }
)