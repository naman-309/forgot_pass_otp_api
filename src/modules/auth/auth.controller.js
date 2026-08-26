import bcrypt from "bcrypt";
import pool from "../../config/db.js";
import jwt from "jsonwebtoken";
import { generateOtp, hashOtp } from "../../utils/otp.js";
import { sendOtpEmail } from "../../services/mail.service.js";
// register  user   function 

export const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }


        // Check if user already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );


        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User already exists"
            });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create user
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );


        return res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });


    } catch (error) {

        console.log("Register error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};


// login  user  function 

export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;


        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }


        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        const user = result.rows[0];


        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Create JWT
        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        // Store token in cookie
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });


        return res.status(200).json({
            message: "Login successful"
        });


    } catch (error) {

        console.log("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};



// user  logout  function 
export const logoutUser = (req, res) => {

    res.clearCookie("access_token");

    return res.status(200).json({
        message: "Logout successful"
    });

};


// FORGOT PASSWORD FUNCYION 




export const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        console.log("Forgot password email:", email);

        // Basic validation
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }


        // Find user
        const userResult = await pool.query(
            "SELECT id, email FROM users WHERE email = $1",
            [email]
        );
        console.log("User found:", userResult.rows);

        /*
         If user does not exist, we still return the same
         response to avoid revealing registered emails.
        */

        if (userResult.rows.length === 0) {
            return res.status(200).json({
                message: "If an account exists with this email, an OTP has been sent"
            });
        }


        const user = userResult.rows[0];


        // Delete previous OTP
        await pool.query(
            "DELETE FROM password_reset_otps WHERE user_id = $1",
            [user.id]
        );


        // Generate new OTP
        const otp = generateOtp();


        // Hash OTP
        const otpHash = hashOtp(otp);


        // OTP expires after 2 minutes
        const expiresAt = new Date(
            Date.now() + 2 * 60 * 1000
        );


        // Store OTP hash in database
        await pool.query(
            `INSERT INTO password_reset_otps
            (user_id, otp_hash, expires_at)
            VALUES ($1, $2, $3)`,
            [
                user.id,
                otpHash,
                expiresAt
            ]
        );


        // Send OTP to user's email
        await sendOtpEmail(
            user.email,
            otp
        );


        return res.status(200).json({
            message: "If an account exists with this email, an OTP has been sent"
        });


    } catch (error) {

        console.log("Forgot password error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};

//  verify  Otp 
export const verifyOtp = async (req, res) => {

    try {

        const { email, otp } = req.body;


        // Basic validation
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }


        // Find user
        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );


        if (userResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }


        const userId = userResult.rows[0].id;


        // Get OTP record
        const otpResult = await pool.query(
            `SELECT *
             FROM password_reset_otps
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );


        if (otpResult.rows.length === 0) {
            return res.status(400).json({
                message: "OTP not found"
            });
        }


        const otpRecord = otpResult.rows[0];


        // Check if already verified
        if (otpRecord.verified) {
            return res.status(400).json({
                message: "OTP already used"
            });
        }


        // Check expiry
        if (new Date() > new Date(otpRecord.expires_at)) {

            return res.status(400).json({
                message: "OTP has expired"
            });

        }


        // Hash entered OTP
        const otpHash = hashOtp(otp);


        // Compare OTP
        if (otpHash !== otpRecord.otp_hash) {

            return res.status(400).json({
                message: "Invalid OTP"
            });

        }


        // Mark OTP as verified
        await pool.query(
            `UPDATE password_reset_otps
             SET verified = TRUE
             WHERE id = $1`,
            [otpRecord.id]
        );

        const resetToken = jwt.sign(
            { userId: user.id, purpose: "password-reset" },
            process.env.JWT_RESET_SECRET,
            { expiresIn: "5m" }
        );

        // Send token securely in httpOnly cookie
        res.cookie("reset_token", resetToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 5 * 60 * 1000 // 5 minutes
        });

        return res.status(200).json({
            message: "OTP verified successfully"
        });


    } catch (error) {

        console.log("Verify OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};

// 6. Reset Password
export const resetPassword = async (req, res) => {
    try {
        console.log("Cookies received:", req.cookies); // Debug: Check if cookies are coming
        const { newPassword, confirmPassword } = req.body;
        const token = req.cookies.reset_token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: reset_token cookie missing or expired." });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Both password fields are required." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        } catch (err) {
            console.log("JWT verify error:", err.message);
            return res.status(401).json({ message: "Invalid or expired reset session token." });
        }

        if (decoded.purpose !== "password-reset") {
            return res.status(401).json({ message: "Invalid token purpose." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, decoded.userId]);

        // Cleanup OTP and cookie
        await pool.query("DELETE FROM password_reset_otps WHERE user_id = $1", [decoded.userId]);
        res.clearCookie("reset_token");

        return res.status(200).json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
        console.error("Reset password server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
