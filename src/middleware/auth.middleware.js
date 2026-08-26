import jwt from "jsonwebtoken";


export const verifyAuth = (req, res, next) => {

    try {

        // Get token from cookie
        const token = req.cookies.access_token;


        // Check token exists
        if (!token) {
            return res.status(401).json({
                message: "Please login first"
            });
        }


        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Store decoded user information in request
        req.user = decoded;


        // Continue to controller
        next();


    } catch (error) {

        console.log("Auth error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};