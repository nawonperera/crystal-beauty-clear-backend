import express from "express";
import {
    blockUser,
    changePassword,
    getCurrentUser,
    getUsers,
    googleLogin,
    loginUser,
    saveUser,
    sendOTP,
    unblockUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", saveUser);

userRouter.get("/", getUsers);

userRouter.post("/login", loginUser);

userRouter.post("/google", googleLogin);

userRouter.get("/current", getCurrentUser);

userRouter.post("/sendMail", sendOTP);

userRouter.post("/changePassword", changePassword);

userRouter.patch("/block/:userEmail", blockUser);

userRouter.patch("/unblock/:userEmail", unblockUser);

export default userRouter;
