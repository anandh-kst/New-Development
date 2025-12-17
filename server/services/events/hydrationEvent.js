import Observation from "../../models/observation.model.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

export const saveHydrationEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const hydrationEvents =
      webhookData.body_health?.events?.hydration_event;

    if (!hydrationEvents || hydrationEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];

    for (const event of hydrationEvents) {
      const metadata = event.metadata || {};

      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();

      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const hydrationData = event.hydration || {};

      const waterIntake = hydrationData.water_total_consumption_mL_int;

      if (isValidValue(waterIntake)) {
        metricsToSave.push(
          new Observation({
            client_uuid,
            user_id,
            metric_type: METRIC_TYPE.WATER_TOTAL_CONSUMPTION,
            metric_value: waterIntake,
            metric_unit: METRIC_UOM[METRIC_TYPE.WATER_TOTAL_CONSUMPTION],
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
        `Saved ${metricsToSave.length} hydration_event metrics for ${user_id}`
      );
    } else {
      console.log(`No valid hydration_event metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving hydration_event:", err);
  }
};

export default saveHydrationEvent;
