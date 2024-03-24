import mongoose, { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { video} from "../models/video.model.js";
import { PlayList } from "../models/playList.model.js";
import { User } from "../models/user.model.js"

const createPlayList = asyncHandler( async (req,res)=> {
    const {name,description} = req.body;
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"invalid videoId");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);

    const userId = decodedToken?._id;
    console.log(userId);

    const videos = await video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId),
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ]);

    if (!videos) {
        throw new apiError(400,"No any videos are available");
    }

    const PlayLists = await PlayList.create({
        name:name,
        description:description,
        videos:videoId,
        owner:userId,
    });

    if (!PlayLists) {
        throw new apiError(500,"PlayList not created");
    }

    return res.status(200).json(new apiResponse(200,PlayLists,"PlayList created successfully"));
});

const getUserPlayLists = asyncHandler( async (req,res)=> {
    const {userId} = req.params;

    if (!isValidObjectId(userId)) {
        throw new apiError(400,"Invalid userId");
    }

    const validUser = await User.findById(userId);

    if (!validUser) {
        throw new apiError(400,"channel not found");
    }

    const PlayLists = await PlayList.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $group:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                videos:1
            }
        }
    ]);

    if (!PlayLists) {
        throw new apiError(400,"playLists not found");
    }

    return res.status(200).json(new apiResponse(200,PlayLists,"playList fetched successfully"));
});

const getPlayListById = asyncHandler( async (req,res)=> {
    const {PlayListId} = req.params;

    if (!isValidObjectId(PlayListId)) {
        throw new apiError(400,"Invalid PlayList Id");
    }

    const playLists = await PlayList.findById(PlayListId);

    if (!playLists) {
        throw new apiError(200,"playList not found");
    }

    return res.status(200).json(new apiResponse(200,playLists,"Playlist fetched successfully"));
});

const addVideoToPlayList = asyncHandler( async (req,res)=> {
    const {PlayListId,videoId} = req.params;
    
    if (!(isValidObjectId(PlayListId) && isValidObjectId(videoId))) {
        throw new apiError(400,"invalid playlist and video id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);

    const userId = decodedToken?._id;
    console.log(userId);

    const videos = await video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId),
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ]);

    if (!videos) {
        throw new apiError(400,"Invalid credentials");
    }

    const addedVideos = await PlayList.findByIdAndUpdate(
        PlayListId,
        {
            $addToSet:{
                videos:videoId,
            }
        },
        {
            new:true
        }
    );

    if (!addedVideos) {
        throw new apiError(500,"video not added");
    }

    return res.status(200).json(new apiResponse(200,addedVideos,"video added successfully"));

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new apiError(400,"invalid playlist and video id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);

    const userId = decodedToken?._id;
    console.log(userId);

    const videos = await video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId),
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ]);

    if (!videos) {
        throw new apiError(400,"invalid credentials");
    }

    const playlist = await PlayList.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId,
            }
        },
        {
            new:true,
        }
    );

    if (!playlist) {
        throw new apiError(400,"playList not found");
    }

    return res.status(200).json(200,playlist,"video remove successfully");
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400,"invalid playlist id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);

    const userId = decodedToken?._id;
    console.log(userId);

    const playlist = await PlayList.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId),
                owner:new mongoose.Types.ObjectId(playlistId),
            }
        }
    ]);

    if (!playlist) {
        throw new apiError(400,"invalid credential");
    }

    await PlayList.findByIdAndDelete(playlistId);

    return res.status(200).json(200,{},"playList Deleted successfully");
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400,"invalid playList id");
    }

    const {accessToken,refreshToken} = req.cookies;
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECERET);

    const userId = decodedToken?._id;
    console.log(userId);
    
    const playlist = await PlayList.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId),
                owner:new mongoose.Types.ObjectId(playlistId),
            }
        }
    ]);

    if (!playlist) {
        throw new apiError(400,"invalid credential");
    }

    const updatedPlayList = await PlayList.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name:name,
                description:description,
            }
        },
        {
            new:true,
        }
    );

    if (!updatedPlayList) {
        throw new apiError(400,"playList not found for update")
    }

    return res.status(200).json(new apiResponse(200,updatedPlayList,"playList updated successfully"));
});

export {
    createPlayList,
    getUserPlayLists,
    getPlayListById,
    addVideoToPlayList,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
}