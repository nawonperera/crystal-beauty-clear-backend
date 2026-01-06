import Message from "../models/message.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Email transporter (same as OTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.RESET_PASSWORD_EMAIL,
        pass: process.env.RESET_PASSWORD_APP_PASSWORD,
    },
});

// Create a new message (public - from contact form)
export async function createMessage(req, res) {
    try {
        const { firstName, lastName, email, phone, message } = req.body;

        if (!firstName || !email || !message) {
            return res.status(400).json({
                message: "First name, email, and message are required",
            });
        }

        // Generate message ID
        const lastMessage = await Message.findOne().sort({ createdAt: -1 });
        let messageId = "MSG0001";
        
        if (lastMessage && lastMessage.messageId) {
            const lastNum = parseInt(lastMessage.messageId.replace("MSG", ""));
            messageId = "MSG" + String(lastNum + 1).padStart(4, "0");
        }

        const newMessage = new Message({
            messageId,
            firstName,
            lastName: lastName || "",
            email,
            phone: phone || "",
            message,
        });

        await newMessage.save();

        res.status(201).json({
            message: "Message sent successfully",
            messageId,
        });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({
            message: "Failed to send message",
        });
    }
}

// Get all messages (admin only)
export async function getMessages(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Unauthorized - Admin access required",
            });
        }

        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            message: "Failed to fetch messages",
        });
    }
}

// Update message status (admin only)
export async function updateMessageStatus(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Unauthorized - Admin access required",
            });
        }

        const { messageId } = req.params;
        const { status } = req.body;

        if (!["unread", "read", "replied"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const message = await Message.findOneAndUpdate(
            { messageId },
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        res.json({
            message: "Status updated successfully",
            data: message,
        });
    } catch (error) {
        console.error("Error updating message:", error);
        res.status(500).json({
            message: "Failed to update message",
        });
    }
}

// Delete message (admin only)
export async function deleteMessage(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Unauthorized - Admin access required",
            });
        }

        const { messageId } = req.params;
        const message = await Message.findOneAndDelete({ messageId });

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        res.json({
            message: "Message deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({
            message: "Failed to delete message",
        });
    }
}

// Reply to message via email (admin only)
export async function replyToMessage(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Unauthorized - Admin access required",
            });
        }

        const { messageId } = req.params;
        const { subject, replyMessage } = req.body;

        if (!subject || !replyMessage) {
            return res.status(400).json({
                message: "Subject and reply message are required",
            });
        }

        // Find the original message
        const originalMessage = await Message.findOne({ messageId });

        if (!originalMessage) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        // Send email reply
        const mailOptions = {
            from: process.env.RESET_PASSWORD_EMAIL,
            to: originalMessage.email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1B9C85 0%, #10b981 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">CRISTAL</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Beauty & Skincare</p>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Dear ${originalMessage.firstName} ${originalMessage.lastName || ''},
                        </p>
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Thank you for contacting us. Here is our response to your inquiry:
                        </p>
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1B9C85;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.8; white-space: pre-wrap; margin: 0;">
                                ${replyMessage}
                            </p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        <p style="color: #6b7280; font-size: 14px;">
                            <strong>Your original message:</strong>
                        </p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px;">
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                                "${originalMessage.message}"
                            </p>
                        </div>
                    </div>
                    <div style="background: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © 2026 CRISTAL Beauty. All rights reserved.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                            This email was sent in response to your inquiry.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        // Update message status to replied
        await Message.findOneAndUpdate(
            { messageId },
            { status: "replied" },
            { new: true }
        );

        res.json({
            message: "Reply sent successfully",
        });
    } catch (error) {
        console.error("Error sending reply:", error);
        res.status(500).json({
            message: "Failed to send reply: " + (error.message || "Unknown error"),
        });
    }
}
