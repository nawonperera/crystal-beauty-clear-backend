import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, searchProducts, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getProducts);
productRouter.get("/search/:id", searchProducts);
productRouter.delete("/:productID", deleteProduct);
productRouter.get("/:id", getProductById);
productRouter.put("/:productID", updateProduct);

export default productRouter;
