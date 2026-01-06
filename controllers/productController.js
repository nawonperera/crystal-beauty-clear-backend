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

// Filter products with query parameters
export async function filterProducts(req, res) {
    try {
        const { 
            search, 
            category, 
            minPrice, 
            maxPrice, 
            sortBy,
            page = 1,
            limit = 20 
        } = req.query;

        // Build filter object
        const filter = {};

        // Search by name or altNames
        if (search && search.trim() !== "") {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { altNames: { $elemMatch: { $regex: search, $options: "i" } } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by category
        if (category && category !== "all") {
            filter.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case "price-low":
                sort = { price: 1 };
                break;
            case "price-high":
                sort = { price: -1 };
                break;
            case "newest":
                sort = { createdAt: -1 };
                break;
            case "name-asc":
                sort = { name: 1 };
                break;
            case "name-desc":
                sort = { name: -1 };
                break;
            default:
                sort = { createdAt: -1 }; // Default: newest first
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalProducts: totalCount,
                hasMore: skip + products.length < totalCount
            }
        });
    } catch (err) {
        console.error("Filter error:", err);
        res.status(500).json({
            message: "Error filtering products",
        });
    }
}

// Get all unique categories
export async function getCategories(req, res) {
    try {
        const categories = await Product.distinct("category");
        res.json({ categories });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching categories",
        });
    }
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
