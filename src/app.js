import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";


const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


app.get("/", (req, res) => {
  res.json({
    message: "Forgot Password API is running"
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


export default app;