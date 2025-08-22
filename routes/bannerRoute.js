import express from "express";
import { createBanner, deleteBanner, getAllBanners, getRandomBanner } from "../controllers/bannerController.js";

const bannerRouter = express.Router();

// CREATE BANNER ROUTE
bannerRouter.post("/", createBanner);

//GET ALL BANNERs ROUTE
bannerRouter.get("/", getAllBanners);

//DELETE BANNERS ROUTE
bannerRouter.delete("/:id", deleteBanner);

//GET RANDOM BANNER
bannerRouter.get("/random", getRandomBanner);

export default bannerRouter;
