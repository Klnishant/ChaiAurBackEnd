import mongoose, { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { video} from "../models/video.model.js";
import { comments } from "../models/comment.model.js";
import jwt from "jsonwebtoken";


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"invalid videoId");
    }

    const videos = await video.findById(videoId);

    if (!videos) {
        throw new apiError(400,"video not found");
    }

    const comment = await comments.aggregate([
        {
            $match:{
                videos:new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $group:{
                videos
            }
        },
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
                            avtar:1,
                        }
                    }
                ]
            }
        },
        {
            $sort:{
                createdAt:-1,
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner",
                }
            }
        },
        {
            $lookup:{
                content:1,
                videos:1,
                owner:1
            }
        }
    ]);

    if (!comment) {
        throw new apiError(400,"comments not found");
    }

    return res.status(200).json(new apiResponse(200,comment,"comments fetched successfully"));

});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"invalid videoId");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const comment = await comments.create(
        {
            content:content,
            videos:videoId,
            owner:userId,
        }
    );

    if (!comment) {
        throw new apiError(500,"comments not created");
    }

    return res.status(200).json(new apiResponse(200,comment,"comment created successfully"));

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if (!isValidObjectId(commentId)) {
        throw new apiError(400,"invalid comment id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const comment = await comments.findByIdAndUpdate(
        {
            commentId,userId,
        },
        {
            $set:{
                content:content,
            }
        },
        {
            new:true,
        }
    );

    if (!comment) {
        throw new apiError(400,"comment not found");
    }

    return res.status(200).json(new apiResponse(200,comment,"comment updated successfully"));

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if (!isValidObjectId(commentId)) {
        throw new apiError(400,"invalid commentId");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    await comments.findByIdAndDelete({commentId,userId});

    return res.status(200).json(new apiResponse(200,{},"comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}