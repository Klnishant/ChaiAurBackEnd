import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";


const verifyJWT = asyncHandler(async (req,_,next) =>{
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","");
        if (!token) {
            throw new apiError(400,"Token not find");
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECERET);

        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new apiError(400,"Invalid accessToken");
        }

        req.user=user;
        next();

    } catch (error) {
        throw new apiError(401,error?.message || "Invalid accessToken");
    }
});

export { verifyJWT }