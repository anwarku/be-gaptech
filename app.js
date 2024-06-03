import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// connected to mongodb database
try {
  await mongoose.connect("mongodb+srv://12210952:LxUAJMyLgwk42asF@db-gaptech.m5swohz.mongodb.net/?retryWrites=true&w=majority&appName=db-gaptech");
  console.log("Database connected");
} catch (error) {
  console.log(error);
}

app.use(cors({ credentials: true, origin: "https://wms-gaptech.vercel.app" }));
app.use(cookieParser());
app.use(express.json());
app.get("/", (req, res) => res.send("<h1>Selamat datang WMS Gaptech</h1>"));
app.use(router);

app.listen(port, () => console.log(`Server running in port ${port}`));
