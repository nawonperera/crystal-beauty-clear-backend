import Order from "../models/order.js"

export function createOrder(req, res){

    if(req.user == null){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }
    const body = req.body
    const orderData = {
        orderId : "",
        email: req.user.email,
        name: body.name,
        address: body.address,
        phoneNumber: body.phoneNumber,
        billItems:[],
        total: 0
    }

    // Retrieve the most recent order by sorting all orders in descending order based on the 'date' field and limiting the result to only one document.
    Order.find().sort({ date: -1 }).limit(1).then((lastBills) =>{
        if(lastBills.length == 0){ 
            orderData.orderId = "ORD001"  // If no previous orders exist, start with the first order ID
        }else{
    
            const lastBill = lastBills[0]      // Retrieve the last bill from the list
            const lastOrderId = lastBill.orderId    // Extract the last order ID (e.g., "ORD0061")
            const lastOrderNumber = lastOrderId.replace("ORD", "")     // Remove the "ORD" prefix to get only the numeric part (e.g., "0061")
            const lastOrderNumberInt = parseInt(lastOrderNumber)     // Convert the extracted numeric part to an integer (e.g., 61)
            const newOrderNumberInt = lastOrderNumberInt + 1      // Increment the order number (e.g., 62)
            const newOrderNumberStr = newOrderNumberInt.toString().padStart(4, '0')    // Convert the new number back to a string and pad with zeros to maintain format (e.g., "0062")
    
            orderData.orderId = "ORD" + newOrderNumberStr     // Construct the new order ID (e.g., "ORD0062")
    
        }
        
        for(let i = 0;  i< body.billItems.length; i++){
            const billItem = body.billItems[i]
            //check if product exists
        }
    
        const order = new Order(orderData)
        order.save().then(() => {
            res.json({
                message: "Order saved successfully"
            })
        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Order not saved"
            })
            
        })
    })    
}

export function getOrders(req,res){

    if(req.user == null){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }

    if (req.user.role == "admin"){
        Order.find().then(
            (orders)=>{
                res.json(orders)
            }
        ).catch(
            (err)=>{
                res.status(500).json({
                    message: "Orders not found"
                })
            }
        )
    }else{
        Order.find({
            email: req.user.email
        }).then(
            (orders)=>{
                res.json(orders)
            }
        ).catch(
            (err)=>{
                console.log(err);
                
                res.status(500).json({
                    message: "Orders not found"
                })
            }
        )
    }
}