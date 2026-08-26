import crypto from "crypto";


export const generateOtp = () => {

    const otp = crypto.randomInt(100000, 1000000);

    return otp.toString();

};


export const hashOtp = (otp) => {

    return crypto
        .createHmac("sha256", process.env.OTP_SECRET)
        .update(otp)
        .digest("hex");

};

console.log("OTP:", generateOtp());