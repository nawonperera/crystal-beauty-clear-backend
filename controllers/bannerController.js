import asyncHandler from "express-async-handler";
import Banner from "../models/banner";

// CREATE BANNER
export const createBanner = asyncHandler(async (req, res) => {
    //asyncHandler to handle errors in async functions
    const newBanner = Banner(req.body);
    const savedBanner = await newBanner.save();
    if (!savedBanner) {
        res.status(400);
        throw new Error("Banner was not created"); // This will be caught by asyncHandler
    } else {
        res.status(200).json(savedBanner);
    }
});

//DELETE BANNER
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (banner) {
        res.status(400);
        throw new Error("Banner was not deleted");
    } else {
        res.status(200).json("Banner is deleted successfully");
    }
});

// GET ALL Banners
export const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await (await Banner.find()).reverse();
    if (!banners) {
        res.status(400);
        throw new Error("No orders found");
    } else {
        res.status(200).json(banners);
    }
});
// GET RANDOM BANNER
export const getRandomBanner = asyncHandler(async (req, res) => {
    const banners = await Banner.find();
    if (!banners || banners.length === 0) {
        res.status(400);
        throw new Error("No banners found");
    } else {
        const randomIndex = Math.floor(Math.random() * banners.length);
        const randomBanner = banners[randomIndex];
        res.status(200).json(randomBanner);
    }
});
