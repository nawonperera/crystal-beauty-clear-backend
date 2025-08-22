import mongoose from "mongoose";

const BannerSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        img: { type: String, required: true },
    },

    { timestamps: true }, // adds createdAt and updatedAt fields automatically
);

const Banner = mongoose.model("Banner", BannerSchema);
export default Banner;
