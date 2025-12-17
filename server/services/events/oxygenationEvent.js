import Observation from "../../models/observation.model.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

export const saveOxygenationEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const oxygenationEvents =
      webhookData.body_health?.events?.oxygenation_event;

    if (!oxygenationEvents || oxygenationEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];

    for (const event of oxygenationEvents) {
      const metadata = event.metadata || {};

      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();

      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const oxygenationData = event.oxygenation || {};

      const oxygenationMetricsMap = [
        {
          type: METRIC_TYPE.OXYGENATION_SATURATION,
          value: oxygenationData.saturation_avg_percentage_int,
          unit: METRIC_UOM[METRIC_TYPE.OXYGENATION_SATURATION],
        },
        {
          type: METRIC_TYPE.VO2MAX,
          value: oxygenationData.vo2max_mL_per_min_per_kg_int,
          unit: METRIC_UOM[METRIC_TYPE.VO2MAX],
        },
      ];

      for (const metric of oxygenationMetricsMap) {
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
        `Saved ${metricsToSave.length} oxygenation_event metrics for ${user_id}`
      );
    } else {
      console.log(
        `No valid oxygenation_event metrics to save for ${user_id}`
      );
    }
  } catch (err) {
    console.error("Error saving oxygenation_event:", err);
  }
};

export default saveOxygenationEvent;
