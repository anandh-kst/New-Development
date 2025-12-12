import mongoose from "mongoose";
import Observation from "../../models/observation.model.js";
import METRIC_TYPES from "../../constants/metricTypes.js";
import { getMetricTypes, getSourceType, isValidValue } from "../../utils/service-helper.js";

export const saveStepsEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const stepsEvents = webhookData.physical_health?.events?.steps_event;
    if (!stepsEvents || stepsEvents.length === 0) return;

    const res = await getMetricTypes();
    const METRIC_TYPE = Object.keys(res || {}).length > 0 ? res : METRIC_TYPES;

    const metricsToSave = [];

    for (const event of stepsEvents) {
      const metadata = event.metadata || {};
      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();
      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const stepsCount = event.steps?.accumulated_steps_int;
      if (isValidValue(stepsCount)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.STEPS,
            metric_value: stepsCount,
            metric_unit: "count",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
    }

    if (metricsToSave.length > 0) {
      await Observation.insertMany(metricsToSave);
      console.log(
        `Saved ${metricsToSave.length} steps_event metrics for ${user_id}`
      );
    } else {
      console.log(`No valid steps_event metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving steps_event:", err);
  }
};

export default saveStepsEvent;
