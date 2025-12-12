import bodyParser from "body-parser";
import webhookController from "../controller/webhook.controller.js";
import express from "express";
import { getMetricTypes } from "../utils/service-helper.js";

const webhookRouter = express.Router();
webhookRouter.use(bodyParser.json());
webhookRouter.post("/", webhookController.webhook);
webhookRouter.get("/metricTypes", async(req,res) => {
     try{
        const metricTypes = await getMetricTypes();
        return res.status(200).json({metricTypes});
     }
     catch(error){
        console.error("Error fetching metrics:", error);
        return res.status(500).json({ error: "Internal server error" });
     }
});

export default webhookRouter;
