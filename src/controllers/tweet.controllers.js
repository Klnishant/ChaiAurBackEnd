import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { Tweet } from "../models/tweet.model";
import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler( async (req,res)=>{
    const {content} = req.body;
    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    if (!(content || userId)) {
        throw new apiError(400,"content are required or unauthrized accessing");
    }

    const tweet = await Tweet.create({
        content:content,
        owner:userId,
    });

    if (!tweet) {
        throw new apiError(500,"tweet not created");
    }

    return res.status(200).json(new apiResponse(200,tweet,"tweet created successfully"));
});

const getUserTweets = asyncHandler( async (req,res)=> {
    const {userId} = req.params;

    if (!(isValidObjectId(userId))) {
        throw new apiError(400,"Invalid user id");
    }

    const tweet = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
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
            $addFields:{
                owner:{
                    $arrayElmAt:["$owner",0],
                }
            }
        },
        {
            $project:{
                content:1,
                owner:1,
            }
        },
        {
            $sort:-1,
        }
    ]);

    if (!tweet) {
        throw new apiError(500,"Tweet not found");
    }

    return res.status(200).json(new apiResponse(200,tweet,"Tweets founded"));
});

const updateTweet = asyncHandler( async (req,res)=>{
    const {tweetId} = req.params;
    const {content} = req.body;

    if (!(isValidObjectId(tweetId))) {
        throw new apiError(400,"Invalid tweet id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const validUser = await Tweet.findById(tweetId);
    const validUserId = validUser.owner;

    if (!(userId === validUser.owner.toString())) {
        throw new apiError(400,"unauthorized user");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:content
            }
        },
        {
            new:true,
        }
    );

    if (!tweet) {
        throw new apiError(500,"Tweet not updated");
    }

    return res.status(200).json(new apiResponse(200,tweet,"Tweet updated succesfully"));

});

const deleteTweet = asyncHandler( async (req,res)=> {
    const {tweetId} = req.params;

    if (!(isValidObjectId(tweetId))) {
        throw new apiError(400,"Invalid tweet id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const validUser = await Tweet.findById(tweetId);
    const validUserId = validUser.owner;

    if (!(userId === validUser.owner.toString())) {
        throw new apiError(400,"unauthorized user");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new apiResponse(200,{},"tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}