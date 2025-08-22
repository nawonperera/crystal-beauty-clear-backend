import Product from "../models/product.js";

export async function createProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first",
        });
        return;
    }

    if (req.user.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to create a product",
        });
        return;
    }

    const product = new Product(req.body);

    try {
        await product.save();
        res.json({
            message: "Product saved successfully",
        });
    } catch (err) {
        res.status(500).json({
            message: "Product not saved.",
        });
    }
}

export function getProducts(req, res) {
    Product.find()
        .then((products) => {
            res.json(products);
        })
        .catch((err) => {
            res.status(500).json({
                message: "Product not found",
            });
        });
}

export async function getProductById(req, res) {
    const productId = req.params.id;
    const product = await Product.findOne({ productID: productId });
    if (product == null) {
        res.status(404).json({
            message: "Product not found.",
        });
        return;
    }
    res.json({
        product: product,
    });
}

export function deleteProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first",
        });
        return;
    }

    if (req.user.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to create a product",
        });
        return;
    }

    Product.findOneAndDelete({
        // Filter the product to delete by its ID from the request parameters
        // req.params contains route parameters (e.g., productID in the URL: /products/:productID)
        productID: req.params.productID,
    })
        .then(() => {
            res.json({
                message: "Product deleted successfully",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Product not deleted",
            });
        });
}

export function updateProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first",
        });
        return;
    }

    if (req.user.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to create a product",
        });
        return;
    }

    Product.findOneAndUpdate(
        {
            productID: req.params.productID,
        },
        req.body,
    )
        .then(() => {
            res.json({
                message: "Product updated successfully",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Product not updated",
            });
        });
}

export async function searchProducts(req, res) {
    const search = req.params.id; // Get the search term from the request parameters(eg: /search/:searchTerm)
    try {
        const products = await Product.find({
            $or: [
                // $or → lets you specify multiple conditions.
                // If ANY of them match, the document will be returned.

                // Search by product name
                // $regex → allows pattern matching (like SQL's LIKE)
                // regex -> evem half of the name will match
                // $options: "i" → makes the regex case-insensitive (so "Apple" == "apple")
                { productName: { $regex: search, $options: "i" } },

                // Search by alternative names array
                // $elemMatch → used when the field is an array and you want to check if
                // at least one element matches the condition
                { altNames: { $elemMatch: { $regex: search, $options: "i" } } },
            ],
        });

        res.json({
            products: products, // Return the found products
        });
    } catch (err) {
        res.status(500).json({
            message: "Error searching products",
        });
    }
}
