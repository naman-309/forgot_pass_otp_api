import pool from "../../config/db.js";

export const getProfile = async (req, res) => {

    try {

        const userId = req.user.userId;


        const result = await pool.query(
            `SELECT id, name, email
             FROM users
             WHERE id = $1`,
            [userId]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        return res.status(200).json({
            message: "Profile fetched successfully",
            user: result.rows[0]
        });


    } catch (error) {

        console.log("Profile error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};
