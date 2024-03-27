import mongoose, { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { video } from "../models/video.model.js";
import { likes } from "../models/like.model.js";
import jwt from "jsonwebtoken";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"invalid video id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const like = await likes.findOne(
        {
            video:videoId,
            likedBy:userId,
        }
    );

    console.log(like);

    if (!like) {
        const videoLike = await likes.create(
            {
                video:videoId,
                likedBy:userId,
            }
        );

        return res.status(200).json(new apiResponse(200,videoLike,"liked successfully"));
    }

    await likes.findByIdAndDelete(like?._id);

    return res.status(200).json(new apiResponse(200,{},"Unliked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    
    if (!isValidObjectId(commentId)) {
        throw new apiError(400,"invalid video id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const like = await likes.findOne(
        {
            comments:commentId,
            likedBy:userId,
        }
    );

    if (!like) {
        const commentLike = await likes.create(
            {
                comments:commentId,
                likedBy:userId,
            }
        );

        return res.status(200).json(new apiResponse(200,commentLike,"liked successfully"));
    }

    await likes.findByIdAndDelete(like?._id);

    return res.status(200).json(new apiResponse(200,{},"Unliked successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400,"invalid video id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const like = await likes.findOne(
        {
            tweet:tweetId,
            likedBy:userId,
        }
    );

    if (!like) {
        const tweetLike = await likes.create(
            {
                tweet:tweetId,
                likedBy:userId,
            }
        );

        return res.status(200).json(new apiResponse(200,tweetLike,"liked successfully"));
    }

    await likes.findByIdAndDelete(like?._id);

    return res.status(200).json(new apiResponse(200,{},"Unliked successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const likedVideos = await likes.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $group:{
                _id:"$video"
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        userName:1,
                                        fullName:1,
                                        avtar:1,
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner",
                            }
                        }
                    },
                    {
                        $project:{
                            videoFile:1,
                            thumbnail:1,
                            owner:1,
                        }
                    },
                ]
            }
        },
        {
            $addFields:{
                videos:{
                    $first:"$videos",
                }
            }
        },
    ]);

    if (!likedVideos) {
        throw new apiError(400,"no liked video found");
    }

    return res.status(200).json(new apiResponse(200,likedVideos,"liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}