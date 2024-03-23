import express, { urlencoded } from "express";
import  cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true,
}));

app.use(express.json({limit:'16kb'}));
app.use(urlencoded({extended:true,limit:'16kb'}));
app.use(express.static("public"));
app.use(cookieParser());


import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";

app.use("/user",userRouter);
app.use("/videos",videoRouter);
app.use("/tweet",tweetRouter);

export {app};