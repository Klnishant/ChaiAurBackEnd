import { Router } from "express";
import { getAllVideos } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT,getAllVideos);

export default router;