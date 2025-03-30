import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export function saveUser(req,res){

    if(req.body.role == "admin"){
        if(req.user == null){
            res.status(403).json({
                message: "Please login as admin before creating an admin account"
            })
            return
        }
        if(req.user.role != "admin"){
            res.status(403).json({
                message: "You are not authorized to create an admin account"
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10) //Password will hashed 10 times
    const user = new User({
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : hashedPassword,
        role : req.body.role,
    })


    user.save().then(
        () => {
            res.json({
                message: "User saved successfully"
            })
    }).catch(
        () => {
            res.status(500).json({
                message: "User not saved"
            })
    })
    
}

export function loginUser(req, res){

    const email = req.body.email
    const password = req.body.password

    // Find a user in the database by their email
    User.findOne({
        email : email // Search for a user with the provided email
    }).then((user)=>{
        // Check if no user was found
        if(user == null){
            // Send a 404 response with a message if the email is not found
            res.status(404).json({
                message : "Invalid email"
            })
        }else{
            const isPasswordCorrect = bcrypt.compareSync(password, user.password)
            if(isPasswordCorrect){
                
                // Extracting user data and creating an object with relevant fields
                const userData = {        
                    email: user.email,           // User's email address
                    firstName: user.firstName,   // User's first name
                    lastName: user.lastName,     // User's last name
                    role: user.role,             // User's role (e.g., admin, user, etc.)
                    phone: user.phone,           // User's phone number
                    isDisabled: user.isDisabled, // Indicates whether the user's account is disabled
                    isEmailVerifies: user.isEmailVerified // Indicates whether the user's email is verified (Note: Typo in "isEmailVerifies")
                }
                
                // Generating a JWT (JSON Web Token) using the userData object
                // "random456" is the secret key used to sign the token
                const token = jwt.sign(userData, "random456")
                
                // Sending a JSON response with a success message and the generated token
                res.json({
                    message: "Login Successful", // Success message for the login process
                    token: token,                // JWT token to be used for authentication/authorization
                })

            }else{
                res.status(403).json({
                    message : "Invalid Password"
                })
            }
        }    
    })
}