import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import "./src/utils/otp.js";
//import { sendTestEmail } from "./src/services/mail.service.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
// console.log(typeof PORT)

const startServer = async () => {

    await connectDB();

    // await sendTestEmail();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

};


startServer();