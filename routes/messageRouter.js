import express from "express";
import { createMessage, getMessages, updateMessageStatus, deleteMessage, replyToMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

// Public route - create message from contact form
messageRouter.post("/", createMessage);

// Admin routes
messageRouter.get("/", getMessages);
messageRouter.put("/:messageId", updateMessageStatus);
messageRouter.delete("/:messageId", deleteMessage);
messageRouter.post("/:messageId/reply", replyToMessage);

export default messageRouter;
