import { Router } from "express";
import { getAllVideos, publishAVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/").get(verifyJWT,getAllVideos);
router.route("/publish").post(upload.fields([
    {
        name:"videoFile",
        maxCount:1,
    },
    {
        name:"thumbnail",
        maxCount:1,
    },
]),verifyJWT,publishAVideo);

export default router;