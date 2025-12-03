import serviceMap from "../utils/serviceMap.js";
import { validateWebhookPayload } from "../utils/validateWebhookPayload.js";

export default{
   webhook:async (req, res) => {
  try {
    const payload = req.body;
    const { valid, message } = validateWebhookPayload(payload);
    if (!valid) return res.status(400).json({ error: message });

    const service = serviceMap[payload.data_structure];
    if (!service) return res.status(400).json({ error: `No service implemented for ${payload.data_structure}` });

    await service(payload);

    return res.status(200).json({ message: `${payload.data_structure} processed successfully` });
  } catch (err) {
    console.error(`[Webhook] Error processing ${req.body.data_structure}:`, err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
}
