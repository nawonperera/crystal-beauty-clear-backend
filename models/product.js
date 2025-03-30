import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    productID : {
        type : String,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true,
    },
    altNames : {
        type : [String],
        default : []
    },
    price : {
        type : Number,
        required : true,
    },
    labeledPrice : {
        type : Number,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    images : {
        type : [String],
        required : true,
        default : ["https://i.insider.com/64381bd0e955f50018fab9d2?width=700&format=jpeg&auto=webp"]
    },
    stock : {
        type : Number,
        required : true,
    }
})

const Product = mongoose.model("products",productSchema)
export default Product