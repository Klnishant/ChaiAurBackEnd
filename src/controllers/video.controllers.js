import mongoose from "mongoose";
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

export {
    getAllVideos,
    publishAVideo,
}