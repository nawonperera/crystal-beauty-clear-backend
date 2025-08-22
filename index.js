import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import verifyJWT from "./middleware/auth.js";
import orderRouter from "./routes/orderRouter.js";
import dotenv from "dotenv";
import cors from "cors";
import bannerRouter from "./routes/bannerRoute.js";

dotenv.config(); //Loading data that include in the ".env" file to this file

const app = express();

app.use(cors());

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to the database");
    })
    .catch(() => {
        console.log("Connection failed");
    });

app.use(bodyParser.json());
app.use(verifyJWT); // Middleware to authenticate users based on the "Authorization" header

app.use("/api/user", userRouter);

app.use("/api/product", productRouter);

app.use("/api/order", orderRouter);

app.use("/api/banner", bannerRouter);

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
