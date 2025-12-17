import Observation from "../../models/observation.model.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

export const saveCaloriesEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const caloriesEvents = webhookData.physical_health?.events?.calories_event;

    if (!caloriesEvents || caloriesEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];

    for (const event of caloriesEvents) {
      const metadata = event.metadata || {};

      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();

      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const caloriesData = event.calories || {};

      const caloriesMetricsMap = [
        {
          type: METRIC_TYPE.CALORIES_BMR,
          value: caloriesData.basal_float,
          unit: METRIC_UOM[METRIC_TYPE.CALORIES_NET_ACTIVE],
        },
        {
          type: METRIC_TYPE.CALORIES_NET_ACTIVE,
          value: caloriesData.active_float,
          unit: METRIC_UOM[METRIC_TYPE.CALORIES_NET_ACTIVE],
        },
      ];

      for (const metric of caloriesMetricsMap) {
        if (isValidValue(metric.value)) {
          metricsToSave.push(
            new Observation({
              client_uuid,
              user_id,
              metric_type: metric.type,
              metric_value: metric.value,
              metric_unit: metric.unit,
              metric_source: source,
              source_type: sourceType,
              date,
            })
          );
        }
      }
    }

    if (metricsToSave.length > 0) {
      await Observation.insertMany(metricsToSave);
      console.log(
        `Saved ${metricsToSave.length} calories_event metrics for ${user_id}`
      );
    } else {
      console.log(`No valid calories_event metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving calories_event:", err);
  }
};

export default saveCaloriesEvent;
