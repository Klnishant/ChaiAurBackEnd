import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, 
    toggleCommentLike, 
    toggleTweetLike, 
    toggleVideoLike } from "../controllers/like.controllers.js";

const router = Router();

router.route("/video/v/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/comment/c/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/tweet/t/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/liked/videos").get(verifyJWT,getLikedVideos);

export default router;