import Observation from "../../models/observation.model.js";
import {
  getMetricTypes,
  getMetricUom,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

const isMeaningfulValue = (value) => {
  return (
    isValidValue(value) &&
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0.0001
  );
};

export const saveNutritionEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const nutritionEvents =
      webhookData.body_health?.events?.nutrition_event;

    if (!nutritionEvents || nutritionEvents.length === 0) return;

    const METRIC_TYPE = await getMetricTypes();
    const METRIC_UOM = await getMetricUom();

    const metricsToSave = [];

    for (const event of nutritionEvents) {
      const metadata = event.metadata || {};

      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();

      const sourceArray = metadata.sources_of_data_array || ["Unknown"];
      const source = sourceArray[0];

      const sourceType = getSourceType(event.non_structured_data_array);

      const nutritionData = event.nutrition || {};

      const nutritionMetricsMap = [
        {
          type: METRIC_TYPE.PROTEIN_INTAKE,
          value: nutritionData.protein_intake_g_float,
          unit: METRIC_UOM[METRIC_TYPE.PROTEIN_INTAKE],
        },
        {
          type: METRIC_TYPE.FAT_INTAKE,
          value: nutritionData.fat_intake_g_float,
          unit: METRIC_UOM[METRIC_TYPE.FAT_INTAKE],
        },
        {
          type: METRIC_TYPE.CARBS_INTAKE,
          value: nutritionData.carbohydrates_intake_g_float,
          unit: METRIC_UOM[METRIC_TYPE.CARBS_INTAKE],
        },
        {
          type: METRIC_TYPE.FIBER_INTAKE,
          value: nutritionData.fiber_intake_g_float,
          unit: METRIC_UOM[METRIC_TYPE.FIBER_INTAKE],
        },
        {
          type: METRIC_TYPE.SUGAR_INTAKE,
          value: nutritionData.sugar_intake_g_float,
          unit: METRIC_UOM[METRIC_TYPE.SUGAR_INTAKE],
        },
        {
          type: METRIC_TYPE.SODIUM_INTAKE,
          value: nutritionData.sodium_intake_mg_float,
          unit: METRIC_UOM[METRIC_TYPE.SODIUM_INTAKE],
        },
        {
          type: METRIC_TYPE.CHOLESTEROL_INTAKE,
          value: nutritionData.cholesterol_intake_mg_float,
          unit: METRIC_UOM[METRIC_TYPE.CHOLESTEROL_INTAKE],
        },
      ];

      for (const metric of nutritionMetricsMap) {
        if (isMeaningfulValue(metric.value)) {
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
        `Saved ${metricsToSave.length} nutrition_event metrics for ${user_id}`
      );
    } else {
      console.log(`No valid nutrition_event metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving nutrition_event:", err);
  }
};

export default saveNutritionEvent;
