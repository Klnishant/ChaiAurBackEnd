import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { video } from "../models/video.model.js";
import { comments } from "../models/comment.model.js";
import { tweets } from "../models/tweet.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;
    console.log(req.user._id);

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
                as:"totalvideos",
            }
        },
        {
            $unwind:"$totalvideos",
        },
        {
            $addFields:{
                totalVideos:"$totalvideos",
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{
                    $sum:1,
                },
                totalViews:{
                    views:"$totalvideos.views",
                },
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"_id",
                foreignField:"_id",
                as:"totalsubscribers"
            }
        },
        {
            $addFields:{
                totalsubscribers:{
                    $first:"$totalsubscribers",
                }
            }
        },
        {
            $project:{
                userName:1,
                avtar:1,
                totalvideos:1,
                totalsubscribers:1,
                views:1,
            }
        }
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
                localField:"owner",
                foreignField:"video",
                as:"totalvideolikes"
            }
        },
        {
            $unwind:"$totalvideolikes",
        },
        {
            $group:{
                _id:"$video"
            }
        },
        {
            $addFields:{
                totalVideoLike:{
                    totalVideoLike:{
                        $sum:1,
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                totalVideoLike:1,
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
                localField:"owner",
                foreignField:"comments",
                as:"totalcommentslikes"
            }
        },
        {
            $unwind:"$totalcommentslikes",
        },
        {
            $group:{
                _id:"$comments"
            }
        },
        {
            $addFields:{
                totalCommentLike:{
                    totalCommentLike:{
                        $sum:1,
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                totalCommentLike:1,
            }
        }
    ]);

    if (!totalCommentLike) {
        obj["totalCommentLike"]=0;
    }

    const totalTweetLike = await tweets.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"owner",
                foreignField:"twwet",
                as:"totaltweetlikes"
            }
        },
        {
            $unwind:"$totaltweetlikes",
        },
        {
            $group:{
                _id:"$tweet"
            }
        },
        {
            $addFields:{
                totalTweetLike:{
                    totalTweetLike:{
                        $sum:1,
                    }
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