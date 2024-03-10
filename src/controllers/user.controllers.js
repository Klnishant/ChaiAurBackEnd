import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler( async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName,userName,email,password}=req.body;

    if( [fullName,userName,email,password].some((field)=>field?.trim()==="")){
        throw new apiError(400,"all fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{userName},{email}]
    });

    if(existedUser){
        throw new apiError(409,"userName and email already existed");
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;
    console.log(avtarLocalPath);

    if (!avtarLocalPath) {
        throw new apiError(409,"avtar is required");
    }

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath);
    const coverImage= await uploadOnCloudinary(coverImageLocalPath);

    if (!avtar) {
        throw new apiError(400,"avtar is required");
    }

    const user = await User.create({
        fullName,
        avtar:avtar.url,
        coverImage:coverImage.url,
        email,
        password,
        userName:userName.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new apiError(500,"something went wrong while registering the users");
    }

    return res.send(201).json(
        new apiResponse(200,createdUser,"user created successfully")
    );

});

export { registerUser }