import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import  jwt from "jsonwebtoken";

const userSchema= new Schema(
    {
        userName: {
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            unique:true,
            index:true,
        },
        email: {
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
        },
        fullName: {
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avtar: {
            type:String,
            required:true,
        },
        coverImage: {
            type:String,
        },
        password: {
            type:String,
            required:[true, 'Password is required'],
        },
        watchHistory: [
            {
                type:Schema.Types.ObjectId,
                ref:"video"
            },
        ],
        refreshToken: {
            type:String,
        },
    },
    {
        timestamps:true,
    },
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            fullName:this.fullName,
            userName:this.userName,
        },
        `${process.env.ACCESS_TOKEN_SECERET}`,
        {
            expiresIn:`${process.env.ACCESS_TOKEN_EXPIRY}`,
        },
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        `${process.env.REFERESH_TOKEN_SECERET}`,
        {
            expiresIn:`${process.env.REFERESH_EXPIRY}`,
        },
    )
}

export const User = mongoose.model("User",userSchema);