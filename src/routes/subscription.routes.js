import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscriber, toggleSubscription } from "../controllers/subscription.controllers.js";

const router = Router();

router.route("/c/:channelId/subscribe").post(verifyJWT,toggleSubscription);
router.route("/c/:channelId/subscriber").get(verifyJWT,getUserChannelSubscriber);
router.route("/c/:subscriberId/subscribed").get(verifyJWT,getSubscribedChannels);

export default router;