import Observation from "../../models/observation.model.js";
import METRIC_TYPES from "../../constants/metricTypes.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

export const saveHeartRateEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const hrEvents = webhookData.body_health?.events?.heart_rate_event;
    if (!hrEvents || hrEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];
    for (const event of hrEvents) {
      const metadata = event.metadata || {};
      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();
      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const hrData = event.heart_rate || {};

      const hrMetricsMap = [
        {
          type: METRIC_TYPE.HR_AVG,
          value: hrData.hr_avg_bpm_int,
          unit: METRIC_UOM[METRIC_TYPE.HR_AVG],
        },
        {
          type: METRIC_TYPE.HR_EVENT_RESTING,
          value: hrData.hr_resting_bpm_int,
          unit: METRIC_UOM[METRIC_TYPE.HR_EVENT_RESTING],
        },
        {
          type: METRIC_TYPE.HR_MAX,
          value: hrData.hr_maximum_bpm_int,
          unit: METRIC_UOM[METRIC_TYPE.HR_MAX],
        },
        {
          type: METRIC_TYPE.HR_MIN,
          value: hrData.hr_minimum_bpm_int,
          unit: METRIC_UOM[METRIC_TYPE.HR_MIN],
        },
        {
          type: METRIC_TYPE.HRV_RMSSD,
          value: hrData.hrv_avg_rmssd_float,
          unit: METRIC_UOM[METRIC_TYPE.HRV_RMSSD],
        },
        {
          type: METRIC_TYPE.HRV_SDNN,
          value: hrData.hrv_avg_sdnn_float,
          unit: METRIC_UOM[METRIC_TYPE.HRV_SDNN],
        },
      ];

      for (const metric of hrMetricsMap) {
        if (isValidValue(metric.value)) {
          metricsToSave.push(
            new Observation({
              client_uuid: client_uuid,
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
        `Saved ${metricsToSave.length} heart_rate_event metrics for ${user_id}`
      );
    } else {
      console.log(`No valid heart_rate_event metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving heart_rate_event:", err);
  }
};

export default saveHeartRateEvent;
