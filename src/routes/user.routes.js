import { Router } from "express";
import { changeCurrentPassword,
    getChannelProfile, 
    getCurrentUser, 
    getWatchHistory, 
    logOutUser, 
    logedInUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateAvtar, 
    updateCoverImage } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        },
    ]),
    registerUser
);

router.route("/logIn").post(logedInUser);
router.route("/logOut").post(verifyJWT,logOutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT,changeCurrentPassword);
router.route("/user").get(verifyJWT,getCurrentUser);
router.route("/update/account").patch(verifyJWT,updateAccountDetails);
router.route("/updateAvtar").patch(verifyJWT,upload.single("avtar"),updateAvtar);
router.route("/updateCover").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);
router.route("/c/:userName").get(verifyJWT,getChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);

export default router;