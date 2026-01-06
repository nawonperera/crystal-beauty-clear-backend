import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: "",
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "unread",
        enum: ["unread", "read", "replied"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("messages", messageSchema);
export default Message;
