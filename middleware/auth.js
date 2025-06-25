import jwt from 'jsonwebtoken'

export default function verifyJWT(req,res,next){
    // Retrieve the "Authorization" header from the request
    const header = req.header("Authorization")
    if(header != null){           // Check if the header is not null (i.e., it exists)
        const token = header.replace("Bearer ","")   // Extract the token by removing the "Bearer " prefix
        jwt.verify(token,process.env.JWT_KEY, (err, decoded)=>{   // Verify the JWT token using the secret key ("random456")
            console.log(decoded);   // Log the decoded token to the console (for debugging)
            if(decoded != null){    // If the token is valid, attach the decoded information to the request object
                req.user = decoded  // Add the decoded token (e.g., user data) to the request
            }
        })          
    }
    // Call the next middleware in the stack
    next()
}