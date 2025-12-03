import Observation from "../../models/observation.model.js";
import METRIC_TYPE from "../../constants/metricTypes.js";
import { getSourceType,isValidValue } from "../../utils/service-helper.js";


export const saveBodyMetricsEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const events = webhookData.body_health?.events?.body_metrics_event;
    if (!events || events.length === 0) return;

    const metricsToSave = [];

    for (const event of events) {
      const metadata = event.metadata || {};
      const date = metadata.datetime_string ? new Date(metadata.datetime_string) : new Date();

      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const bm = event.body_metrics || {};

      const metricsMap = [
        { type: METRIC_TYPE.WEIGHT, value: bm.weight_kg_float, unit: "kg" },
        { type: METRIC_TYPE.HEIGHT, value: bm.height_cm_int, unit: "cm" },
        { type: METRIC_TYPE.BMI, value: bm.bmi_float, unit: "bmi" },

        { type: METRIC_TYPE.BODY_FAT, value: bm.body_fat_percentage_int, unit: "%" },
        { type: METRIC_TYPE.MUSCLE_MASS, value: bm.muscle_composition_percentage_int, unit: "%" },
        { type: METRIC_TYPE.BONE_MASS, value: bm.bone_composition_percentage_int, unit: "%" },
        { type: METRIC_TYPE.WATER_PERCENTAGE, value: bm.water_composition_percentage_int, unit: "%" },

        { type: METRIC_TYPE.WAIST_CIRCUMFERENCE, value: bm.waist_circumference_cm_int, unit: "cm" },
        { type: METRIC_TYPE.HIP_CIRCUMFERENCE, value: bm.hip_circumference_cm_int, unit: "cm" },
        { type: METRIC_TYPE.CHEST_CIRCUMFERENCE, value: bm.chest_circumference_cm_int, unit: "cm" },
      ];

      for (const metric of metricsMap) {
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
      console.log(`Saved ${metricsToSave.length} body_metrics_event metrics for ${user_id}`);
    } else {
      console.log(`No valid body_metrics_event metrics to save for ${user_id}`);
    }

  } catch (err) {
    console.error("Error saving body_metrics_event:", err);
  }
};

export default saveBodyMetricsEvent;
