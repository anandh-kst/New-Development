import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import webhookRouter from "./routes/webhook.route.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/webhook", webhookRouter);

mongoose.connect(process.env.MONGO_URL, {dbName: process.env.DB_NAME})
.then(() => {
        app.listen(3001, () => console.log("Server is running on port 3001"));
 })
.catch((error) => console.log(error));
app.get("/", (req, res) => {
  res.send("New Development is running");
});
