import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { subscription,} from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";

const toggleSubscription = asyncHandler( async (req,res)=>{
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        throw new apiError(400,"Invalid channelId");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);
    const userId = decodedToken?._id;

    const subscriptions = await subscription.findOne({channelId,userId});

    if (subscriptions) {
        await subscription.aggregate([
            {
                $match:{
                    channel:new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $set:{
                    subscriber:null,
                }
            },
        ]);
    }

    else{
        await subscription.aggregate([
            {
                $match:{
                    channel:new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $set:{
                    subscriber:userId,
                }
            },
        ]);
    }

    return res.status(200).json(new apiResponse(200,subscriptions,"Toggle subscription successfully"));
});

const getUserChannelSubscriber = asyncHandler( async (req,res)=> {
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        throw new apiError(400,"Invalid channelId");
    }

    const subscribers = await subscription.aggregate([
        {
            $match:new mongoose.Types.ObjectId(channelId)
        },
        {
            $group:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers",
                pipeline:[
                    {
                        $project:{
                            userName:1,
                            fullName:1,
                            avtar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscribers:"$subscribers"
            }
        }
    ]);

    if (!subscribers) {
        throw new apiError(400,"channel subscribers not available");
    }

    return res.status(200).json(new apiResponse(200,subscribers,"subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400,"Invalid subscriber Id");
    }

    const subscribedChannels = await subscription.aggregate([
        {
            $match:new mongoose.Types.ObjectId(subscriberId)
        },
        {
            $group:{
                channel:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channels",
                pipeline:[
                    {
                        $project:{
                            userName:1,
                            fullName:1,
                            avtar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channels:"$channels"
            }
        }
    ]);

    if (!subscribedChannels) {
        throw new apiError(400,"No any channels subscribed");
    }
});

export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels,
}