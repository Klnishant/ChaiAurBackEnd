import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet 
} from "../controllers/tweet.controllers.js";

const router = Router();

router.route("/create/tweet").post(verifyJWT,createTweet);
router.route("/get/:userId/tweet").get(getUserTweets);
router.route("/update/:tweetId").patch(verifyJWT,updateTweet);
router.route("/delete/:tweetId").delete(verifyJWT,deleteTweet);

export default router;