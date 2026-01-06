import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, searchProducts, updateProduct, filterProducts, getCategories } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getProducts);
productRouter.get("/filter", filterProducts);
productRouter.get("/categories", getCategories);
productRouter.get("/search/:id", searchProducts);
productRouter.delete("/:productID", deleteProduct);
productRouter.get("/:id", getProductById);
productRouter.put("/:productID", updateProduct);

export default productRouter;
