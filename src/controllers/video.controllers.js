import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { video } from "../models/video.model.js"

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

    const result = video.aggregatePaginate({...queryObject, ...filter},options);

    if (!result) {
        throw new apiError(400,"result not find");
    }

    return res.status(200)
    .json(new apiResponse(200,result,"video fetched succesfully"))
});

export {
    getAllVideos,
}