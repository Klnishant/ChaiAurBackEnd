import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment,
    deleteComment,
    getVideoComments,
    updateComment } from "../controllers/comment.controllers.js";

const router = Router();

router.route("/create/v/:videoId").post(verifyJWT,addComment);
router.route("/get/v/:videoId").get(verifyJWT,getVideoComments);
router.route("/update/c/:commentId").patch(verifyJWT,updateComment);
router.route("/del/c/:commentId").delete(verifyJWT,deleteComment);

export default router;