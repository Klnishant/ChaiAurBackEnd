import mongoose, { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler( async (req,res)=> {
    const {page=1, limit=10, query, sortBy, sortType, userId} = req.query;

    const filter = {};

    if (userId) {
        filter.userId = userId;
    }

    const sort = {};

    if (sortBy) {
        sort[sortBy]=sortType==='desc'?-1:1;
    }

    const options = {
        page : parseInt(page),
        limit : parseInt(limit),
        sort,
    };

    const queryObject = query ? { $text: { $search: query } }:{};

    if (!queryObject) {
        throw new apiError(400,"queryObject not created");
    }

    const result = await video.aggregatePaginate({...queryObject, ...filter},options);

    if (!result) {
        throw new apiError(400,"result not find");
    }

    return res.status(200)
    .json(new apiResponse(200,result,"video fetched succesfully"))
});

const publishAVideo = asyncHandler( async (req,res)=> {
    const {title,description} = req.body;

    if ([title,description].some((field)=>field?.trim()==="")) {
        throw new apiError(400,"All fields are required");
    }

    const videoFilePath = req.files?.videoFile[0]?.path;
    console.log(videoFilePath);

    if (!videoFilePath) {
        throw new apiError(400,"video is missing");
    }

    const thumbnailPath = req.files?.thumbnail[0]?.path;
    console.log(thumbnailPath);

    if (!thumbnailPath) {
        throw new apiError(400,"thumbnail is missing");
    }

    const videoFile = await uploadOnCloudinary(videoFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    console.log(videoFile);

    if (!videoFile) {
        throw new apiError(500,"video file is required");
    }

    if(!thumbnail){
        throw new apiError(500,"thumbnail is required");
    }

    const videos = await video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration: videoFile.duration,
    });

    const createdVideo = await video.findById(videos?._id);

    if (!createdVideo) {
        throw new apiError(500,"videos File not created");
    }

    return res.status(200)
    .json(
        new apiResponse(200,createdVideo,"video file created successfully")
    );
});

const getVideoById = asyncHandler( async (req,res)=> {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"video id not valid");
    }

    const videos = await video.findById(videoId).select("-isPublished")

    if (!videos) {
        throw new apiError(400,"Video not found");
    }

    return res.status(200)
    .json(
        new apiResponse(200,videos,"video fetched successfully!!"),
    );
});

const updateVideo = asyncHandler( async (req,res)=> {
    const {videoId} = req.params;

    
    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"video id not valid");
    }

    const {title,description} = req.body;
    console.log(title);

    const thumbnailPath = req.file?.path;
    console.log(thumbnailPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    console.log(thumbnail);

    const videos = await video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title,
                description:description,
                thumbnail:thumbnail.url,
            }
        },
        {
            new:true,
        }
    );

    if (!videos) {
        throw new apiError(500,"video not updated!!");
    }

    return res.status(200)
    .json(
        new apiResponse(200,videos,"video updated successfully")
    );
});

const deleteVideo = asyncHandler( async (req,res)=> {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"video id not valid");
    }

    await video.deleteOne({ _id: new mongoose.Types.ObjectId(videoId)});

    return res.status(200).json(new apiResponse(200,{},"video deleted successfully"));
});

const togglePublishStatus = asyncHandler( async (req,res)=> {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"video id not valid");
    }

    
    await video.updateOne(
        {
            _id: new mongoose.Types.ObjectId(videoId)
        },
        {
            $set:{
                isPublished:!"$isPublished",
            }
        },
        {
            new:true,
        }
    );

    return res.status(200).json(new apiResponse(200,{},"toggle publish status succesfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}