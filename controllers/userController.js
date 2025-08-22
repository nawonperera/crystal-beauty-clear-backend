import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.RESET_PASSWORD_EMAIL, // Your email address
        pass: process.env.RESET_PASSWORD_APP_PASSWORD, // Your email password or app password
    },
});

export function saveUser(req, res) {
    if (req.body.role == "admin") {
        if (req.user == null) {
            res.status(403).json({
                message: "Please login as admin before creating an admin account",
            });
            return;
        }
        if (req.user.role != "admin") {
            res.status(403).json({
                message: "You are not authorized to create an admin account",
            });
            return;
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10); //Password will hashed 10 times
    const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        role: req.body.role,
    });

    user.save()
        .then(() => {
            res.json({
                message: "User saved successfully",
            });
        })
        .catch(() => {
            res.status(500).json({
                message: "User not saved",
            });
        });
}

export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    // Find a user in the database by their email
    User.findOne({
        email: email, // Search for a user with the provided email
    }).then((user) => {
        // Check if no user was found
        if (user == null) {
            // Send a 404 response with a message if the email is not found
            res.status(404).json({
                message: "Invalid email",
            });
        } else {
            const isPasswordCorrect = bcrypt.compareSync(password, user.password);
            if (isPasswordCorrect) {
                // Extracting user data and creating an object with relevant fields
                const userData = {
                    email: user.email, // User's email address
                    firstName: user.firstName, // User's first name
                    lastName: user.lastName, // User's last name
                    role: user.role, // User's role (e.g., admin, user, etc.)
                    phone: user.phone, // User's phone number
                    isDisabled: user.isDisabled, // Indicates whether the user's account is disabled
                    isEmailVerifies: user.isEmailVerified, // Indicates whether the user's email is verified (Note: Typo in "isEmailVerifies")
                };

                // Generating a JWT (JSON Web Token) using the userData object
                // JWT_KEY is the secret key used to sign the token
                const token = jwt.sign(userData, process.env.JWT_KEY);

                // Sending a JSON response with a success message and the generated token
                res.json({
                    message: "Login Successful", // Success message for the login process
                    token: token, // JWT token to be used for authentication/authorization
                    user: userData,
                });
            } else {
                res.status(403).json({
                    message: "Invalid Password",
                });
            }
        }
    });
}

export async function googleLogin(req, res) {
    const accessToken = req.body.accessToken;

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        const user = await User.findOne({
            email: response.data.email,
        });

        if (user == null) {
            const newUser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                isEmailVerified: true,
                password: accessToken,
            });

            await newUser.save();
            const userData = {
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                role: "user",
                phone: "Not given",
                isDisabled: false,
                isEmailVerifies: true,
            };

            const token = jwt.sign(userData, process.env.JWT_KEY);

            res.json({
                message: "Login Successful",
                token: token,
                user: userData,
            });
        } else {
            const userData = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone,
                isDisabled: user.isDisabled,
                isEmailVerifies: user.isEmailVerified,
            };

            const token = jwt.sign(userData, process.env.JWT_KEY);

            res.json({
                message: "Login Successful",
                token: token,
                user: userData,
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Google login failed",
        });
    }
}

export function getCurrentUser(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "please login to get user details",
        });
        return;
    }
    res.json({
        user: req.user,
    });
}

export async function sendOTP(req, res) {
    const email = req.body.email;

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    const message = {
        from: process.env.RESET_PASSWORD_EMAIL, // Sender's email address
        to: email, // Recipient's email address
        subject: "OPT for email verification",
        text: `Your OTP for email verification is ${otp}.`,
    };

    // Save the OTP to the database
    const newOtp = new OTP({
        email: email,
        otp: otp,
    });

    newOtp.save().then(() => {
        console.log("OTP saved successfully");
    });

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({
                message: "Failed to send OTP",
            });
        } else {
            console.log("Email sent:", info.response);
            res.json({
                message: "OTP sent successfully",
                otp: otp, // Return the OTP for verification
            });
        }
    });
}

export async function changePassword(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const otp = req.body.otp;

    try {
        const lastOTPData = await OTP.findOne({
            email: email,
        }).sort({ createdAt: -1 });

        if (lastOTPData == null) {
            res.status(404).json({
                message: "No OTP found for this email",
            });
            return;
        }

        if (lastOTPData.otp !== otp) {
            res.status(403).json({
                message: "Invalid OTP",
            });
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10); // Hash the new password
        await User.updateOne({ email: email }, { password: hashedPassword });
        res.json({
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            message: "Failed to change password",
        });
    }
}
