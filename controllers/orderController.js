import Order from "../models/order.js";
import Product from "../models/product.js";

export function createOrder(req, res) {
    if (req.user == null) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    const body = req.body;

    const orderData = {
        orderId: "",
        email: req.user.email,
        name: body.name,
        address: body.address,
        phoneNumber: body.phoneNumber,
        billItems: [],
        total: 0,
    };

    Order.find()
        .sort({ date: -1 })
        .limit(1)
        .then(async (lastBills) => {
            if (lastBills.length === 0) {
                orderData.orderId = "ORD001";
            } else {
                const lastBill = lastBills[0];
                const lastOrderId = lastBill.orderId;
                const lastOrderNumber = lastOrderId.replace("ORD", "");
                const lastOrderNumberInt = parseInt(lastOrderNumber);
                const newOrderNumberInt = lastOrderNumberInt + 1;
                const newOrderNumberStr = newOrderNumberInt.toString().padStart(4, "0");

                orderData.orderId = "ORD" + newOrderNumberStr;
            }

            for (let i = 0; i < body.billItems.length; i++) {
                //check if the product exists
                const product = await Product.findOne({
                    productID: body.billItems[i].productId,
                });
                if (product === null) {
                    res.status(404).json({
                        message: "Product with product id " + body.billItems[i].productId + " not found.",
                    });
                    return;
                }

                orderData.billItems[i] = {
                    productId: product.productID,
                    productName: product.name,
                    image: product.images[0],
                    quantity: body.billItems[i].quantity,
                    price: product.price,
                };
                orderData.total = orderData.total + product.price * body.billItems[i].quantity;
            }

            const order = new Order(orderData);
            order
                .save()
                .then(() => {
                    res.json({
                        message: "Order saved successfully",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        message: "Order not saved",
                    });
                });
        });
}

export function getOrders(req, res) {
    if (req.user == null) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    if (req.user.role === "admin") {
        Order.find()
            .sort({ date: -1 })
            .then((orders) => {
                res.json(orders);
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Orders not found",
                });
            });
    } else {
        Order.find({
            email: req.user.email,
        })
            .sort({ date: -1 })
            .then((orders) => {
                res.json(orders);
            })
            .catch((err) => {
                console.log(err);

                res.status(500).json({
                    message: "Orders not found",
                });
            });
    }
}

export async function updateOrder(req, res) {
    try {
        if (req.user == null) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const orderId = req.params.orderId; // Get orderId from the URL parameters
        const order = await Order.findOneAndUpdate({ orderId: orderId }, req.body); // Find the order by orderId and update it with the request body

        res.json({
            message: "Order update Successfully.",
        });
    } catch (error) {
        res.status(500).json({
            message: "Order not updated",
        });
    }
}
