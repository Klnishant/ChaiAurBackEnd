import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList,
    createPlayList,
    deletePlaylist,
    getPlayListById,
    getUserPlayLists,
    removeVideoFromPlaylist,
    updatePlaylist } from "../controllers/playList.controllers.js";

const router = Router();

router.route("/create/v/:videoId").post(verifyJWT,createPlayList);
router.route("/u/:userId").get(verifyJWT,getUserPlayLists);
router.route("/p/:PlayListId").get(verifyJWT,getPlayListById);
router.route("/add/p/:PlayListId/v/:videoId").patch(verifyJWT,addVideoToPlayList);
router.route("/remove/p/:playListId/v/:videoId").patch(verifyJWT,removeVideoFromPlaylist);
router.route("/del/p/:playlistId").delete(verifyJWT,deletePlaylist);
router.route("/update/p/:playlistId").patch(verifyJWT,updatePlaylist);

export default router;