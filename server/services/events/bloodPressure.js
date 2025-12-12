import Observation from "../../models/observation.model.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

export const saveBloodPressureEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const bpEvents = webhookData.body_health?.events?.blood_pressure_event;
    if (!bpEvents || bpEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];

    for (const event of bpEvents) {
      const metadata = event.metadata || {};
      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();
      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const bpData = event.blood_pressure?.blood_pressure_avg_object || {};

      const bpMetricsMap = [
        {
          type: METRIC_TYPE.BLOOD_PRESSURE_SYSTOLIC,
          value: bpData.systolic_mmHg_int,
          unit: METRIC_UOM[METRIC_TYPE.BLOOD_PRESSURE_SYSTOLIC],
        },
        {
          type: METRIC_TYPE.BLOOD_PRESSURE_DIASTOLIC,
          value: bpData.diastolic_mmHg_int,
          unit: METRIC_UOM[METRIC_TYPE.BLOOD_PRESSURE_DIASTOLIC],
        },
      ];

      for (const metric of bpMetricsMap) {
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
        `Saved ${metricsToSave.length} blood_pressure_event metrics for ${user_id}`
      );
    } else {
      console.log(
        `No valid blood_pressure_event metrics to save for ${user_id}`
      );
    }
  } catch (err) {
    console.error("Error saving blood_pressure_event:", err);
  }
};

export default saveBloodPressureEvent;
