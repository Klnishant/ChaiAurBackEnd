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


import healthCheckRouter from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playListRouter from "./routes/playList.routes.js"
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";

app.use("/healthCheck",healthCheckRouter);
app.use("/user",userRouter);
app.use("/videos",videoRouter);
app.use("/tweet",tweetRouter);
app.use("/subscribe",subscriptionRouter);
app.use("/playList",playListRouter);
app.use("/like",likeRouter);
app.use("/comment",commentRouter);

export {app};