import express from "express"
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.post("/",createProduct)
productRouter.get("/",getProducts)
productRouter.delete("/:productID",deleteProduct)
productRouter.put("/:productID",updateProduct)

export default productRouter