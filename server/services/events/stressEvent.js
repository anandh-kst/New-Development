import Observation from "../../models/observation.model.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

export const saveStressEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const stressEvents =
      webhookData.physical_health?.events?.stress_event;

    if (!stressEvents || stressEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];

    for (const event of stressEvents) {
      const metadata = event.metadata || {};

      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();

      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const stressData = event.stress || {};

      const stressMetricsMap = [
        {
          type: METRIC_TYPE.STRESS_AVG,
          value: stressData.stress_avg_level_int,
          unit: METRIC_UOM[METRIC_TYPE.STRESS_AVG],
        },
        {
          type: METRIC_TYPE.STRESS_MAX,
          value: stressData.stress_maximum_level_int,
          unit: METRIC_UOM[METRIC_TYPE.STRESS_MAX],
        },
      ];

      for (const metric of stressMetricsMap) {
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
        `Saved ${metricsToSave.length} stress_event metrics for ${user_id}`
      );
    } else {
      console.log(`No valid stress_event metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving stress_event:", err);
  }
};

export default saveStressEvent;
