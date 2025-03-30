import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true, // Email is definitely required
        unique : true // Ensures the email must be unique
    },
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    role : {
        type : String,
        required : true,
        default : "user" //customer
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true,
        default : "Not given"
    },
    isDisabled : {
        type : Boolean,
        required : true,
        default : false
    },
    isEmailVerified : {
        type : Boolean,
        required : true,
        default : false

    }
})

const User = mongoose.model("users", userSchema)
export default User