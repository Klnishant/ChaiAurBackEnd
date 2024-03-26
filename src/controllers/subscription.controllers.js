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

    const subscriptions = await subscription.findOne(
        {
            channel:channelId,
            subscriber:userId
        }
    );
    console.log(subscriptions);

    if (!(subscriptions==null)) {
        await subscription.findByIdAndDelete(subscriptions?._id);

        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "channel unsubscribed successfully"
            )
        );
    }

    else{
        const subscriptionss = await subscription.create(
            {
                channel:channelId,
                subscriber:userId,
            }
        );

        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                subscriptionss,
                "channel subscribed successfully"
            )
        );
    }   
});

const getUserChannelSubscriber = asyncHandler( async (req,res)=> {
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        throw new apiError(400,"Invalid channelId");
    }

    const subscribers = await subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id:"$subscriber",
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"_id",
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
            $unwind:"$subscribers",
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
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400,"Invalid subscriber Id");
    }

    const subscribedChannels = await subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $group:{
                _id:"$channel"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"_id",
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
            $unwind:"$channels"
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

    return res
    .status(200)
    .json(
        new apiResponse(200,subscribedChannels,"channels found successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels,
}