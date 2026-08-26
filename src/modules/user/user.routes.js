import express from "express";
import { getProfile } from "./user.controller.js";
import { verifyAuth } from "../../middleware/auth.middleware.js";


const router = express.Router();

// get  user  profile api 
router.get("/profile", verifyAuth, getProfile);


export default router;