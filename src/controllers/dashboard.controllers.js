import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { video } from "../models/video.model.js";
import { comments } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js"
import jwt from "jsonwebtoken";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;
    console.log(userId);
    console.log(req.user?._id);

    const obj ={};  

    const videosDetails = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"videos",
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $addFields:{
                totalVideos:"$videos._id",
                toatalSubscribers:"$subscribers.subscriber",
                totalViews:"$videos.views"
            }
        },
        {
            $project:{
                totalVideos:{
                    $size:"$totalVideos"
                },
                toatalSubscribers:{
                    $size:"$toatalSubscribers"
                },
                totalViews:1,
            }
        },
        
    ]);

    if (!videosDetails) {
        obj["videoDetails"]=0;
    }

    const totalVideoLike = await video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"totalvideolikes"
            }
        },
        {
            $addFields:{
                totalLikedVideos:"$totalvideolikes._id"
            }
        },
        {
            $project:{
                totalLikedVideos:{
                    $size:"$totalLikedVideos"
                },
            }
        }
    ]);

    if (!totalVideoLike) {
        obj["totalVideoLike"]=0;
    }

    const totalCommentLike = await comments.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comments",
                as:"totalcommentslikes"
            }
        },
        {
            $unwind:"$totalcommentslikes",
        },
        {
            $group:{
                _id:"$comments",
                totalCommentLike:{
                    $sum:1,
                }
            }
        },
        {
            $project:{
                totalCommentLike:1,
            }
        }
    ]);

    if (!totalCommentLike) {
        obj["totalCommentLike"]=0;
    }

    const totalTweetLike = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"twwet",
                as:"totaltweetlikes"
            }
        },
        {
            $group:{
                _id:"$tweet",
                totalTweetLike:{
                    $sum:1,
                }
            }
        },
        {
            $project:{
                _id:1,
                totalTweetLike:1,
            }
        }
    ]);

    if (!totalTweetLike) {
        obj["totalTweetLike"]=0;
    }

    obj["totalVideoLike"]=totalVideoLike;
    obj["totalCommentLike"]=totalCommentLike;
    obj["totalTweetLike"]=totalTweetLike;
    obj["videoDetails"]=videosDetails;

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            obj,
            "videoDetails total videos,total subscribers, total views fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await video.find(
        {
            owner:req.user?._id,
        }
    );

    if (!videos) {
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "no video published yet"
            )
        );
    }
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            videos,
            "video fetched successfully"
        )
    );
});

export {
    getChannelStats, 
    getChannelVideos
}