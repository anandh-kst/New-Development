export const validateWebhookPayload = (payload) => {
  if (!payload) return { valid: false, message: "Payload is missing" };
  if (!payload.data_structure) return { valid: false, message: "Missing data_structure" };
  if (!payload.user_id) return { valid: false, message: "Missing user_id" };
  if (!payload.client_uuid) return { valid: false, message: "Missing client_uuid" };

  const summaries = ["physical_summary", "body_summary", "sleep_summary"];
  const events = ["heart_rate_event", "blood_pressure_event", "steps_event","body_metrics_event","activity_event"];

  if (summaries.includes(payload.data_structure)) {
    if (!payload[payload.data_structure.replace("_summary", "_health")]) {
      return { valid: false, message: `Missing ${payload.data_structure.replace("_summary", "_health")}` };
    }
  }

  return { valid: true };
};
