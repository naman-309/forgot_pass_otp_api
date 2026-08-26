import transporter from "../config/mailer.js";


export const sendOtpEmail = async (email, otp) => {

    try {

        const mailOptions = {
            from: process.env.MAIL_FROM,

            to: email,

            subject: "Password Reset OTP",

            text: `Your password reset OTP is ${otp}. This OTP will expire in 2 minutes.`
        };


        const info = await transporter.sendMail(mailOptions);


        console.log("OTP EMAIL SENT!!!!");
        console.log("Message ID:", info.messageId);


    } catch (error) {

        console.log("OTP EMAIL ERROR:", error);

        throw error;
    }

};