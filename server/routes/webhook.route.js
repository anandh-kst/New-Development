import bodyParser from "body-parser";
import webhookController from "../controller/webhook.controller.js";
import express from "express";

const webhookRouter = express.Router();
webhookRouter.use(bodyParser.json());
webhookRouter.post("/", webhookController.webhook);

export default webhookRouter;
