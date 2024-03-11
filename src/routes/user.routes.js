import { Router } from "express";
import { logOutUser, logedInUser, registerUser } from "../controllers/user.controllers.js";
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
router.route("/logOut").post(verifyJWT,logOutUser)

export default router;