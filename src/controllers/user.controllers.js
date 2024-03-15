import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        console.log(userId);
        const user = await User.findById(userId);
        console.log(user);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        console.log(accessToken);
    
        user.refreshToken=refreshToken;
    
        await user.save({validateBeforeSave:false});
    
        return {accessToken,refreshToken}
    } catch (error) {
        throw new apiError(500,"something went wrong while generating access and refresh token");
    }
}
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

    console.log(req.files?.avtar[0]?.path);

    const avatarLocalPath = req.files?.avtar[0]?.path;
    console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new apiError(409,"avtar file is missing");
    }

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avtar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage= await uploadOnCloudinary(coverImageLocalPath);

    if (!avtar) {
        throw new apiError(400,"avtar is required");
    }

    const user = await User.create({
        fullName,
        avtar:avtar.url,
        coverImage:coverImage?.url,
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

    return res.status(201).json(
        new apiResponse(200,createdUser,"user created successfully")
    );

});

const logedInUser = asyncHandler( async (req,res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    try {
        const {userName,email,password} = req.body;

        
    
        if (!userName && !email) {
            throw new apiError(401,"userName or email are required");
        }

        console.log(email);
    
        const user = await User.findOne({
            $or:[{userName},{email}]
        });

        console.log(user);
    
        if (!user) {
            throw new apiError(404,"Invalid userName or email");
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password);

        console.log(isPasswordValid);
    
        if(!isPasswordValid){
            throw new apiError(404,"Invalid credential");
        }
    
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

        console.log(accessToken);
    
        const logedInUser = await User.findById(user._id).select("-password -refreshToken");
    
        const options={
            httpOnly:true,
            secure:true,
        }
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new apiResponse(
                200,
                {
                    user:logedInUser,accessToken,refreshToken
                },
                "User logedIn successsfully",
            )
        )
    } catch (error) {
        throw new apiError(404,"error occured while loged in");
    }

})

const logOutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1,
        },
        
    },
    {
        new:true,
    }
    )

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new apiResponse(200,{},"User loggedOut successfully")
    )
});

const refreshAccessToken = asyncHandler(async (req,res) =>{
    try {
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingToken) {
            throw new apiError(401,"Unauthorized request");
        }

        const decodeToken = jwt.verify(incomingToken,process.env.REFERESH_TOKEN_SECERET);

        const user = await User.findById(decodeToken?._id);

        if (!user) {
            throw new apiError(401,"Invalid refresh token");
        }

        const options = {
            httpOnly:true,
            secure:true,
        }

        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res.status(201)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new apiError(error?.message || "accessToken expired");
    }
});

const changeCurrentPassword = asyncHandler(async (req,res) =>{
    try {
        const {oldPassword,newPassword} = req.body;

        const user = await User.findById(req.user?._id);
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordCorrect){
            throw new apiError(401,"Invalid old password");
        }

        user.password = newPassword;

        await user.save({validateBeforeSave:false});

        return res.status(200)
        .json(
            200,{},"Password changed successfully"
        )

    } catch (error) {
        throw new apiError(400,"Invalid credential");
    }
});

const getCurrentUser = asyncHandler( async (req,res) =>{
    return res.
    status(200).
    json(
        new apiResponse(200,req.user,"user fetched successfully")
    )
});

const updateAccountDetails = asyncHandler( async (req,res) =>{
    const {fullName,email} = req.body;

    if(!(fullName || email)){
        throw new apiError(400,"fullName or email are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email,
            }
        },
        {
            new:true,
        }
    ).select("-password")

    return res.
    status(200).
    json( new apiResponse(200,user,"account updated successfully"));
});

const updateAvtar = asyncHandler( async (req,res) =>{
    const avtarLocalPath = req.file?.path;

    if (!avtarLocalPath) {
        throw new apiError(400,"avtar local file missing");
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath);

    if (!avtar) {
        throw new apiError(400,"avtar not uploaded on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avtar:avtar.url
            }
        },
        {
            new:true,
        }
    ).select("-password -email");

    return res.
    status(200).
    json( new apiResponse(200,user,"avtar updated successfully"));
});

const updateCoverImage = asyncHandler( async (req,res) =>{
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new apiError(400,"cover image missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if (!coverImage) {
        throw new apiError(400,"cover image not uploaded on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url,
            }
        },
        {
            new:true,
        }
    ).select("-password -email");

    return res
    .status(200)
    .json( new apiResponse(200,user,"cover image updated successfully"));
})

export {
    registerUser,
    logedInUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvtar,
    updateCoverImage,

}