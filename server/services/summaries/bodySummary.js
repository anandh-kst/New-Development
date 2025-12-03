import mongoose from "mongoose";
import Observation  from "../../models/observation.model.js";
import  METRIC_TYPE  from "../../constants/metricTypes.js";
import { getSourceType,isValidValue } from "../../utils/service-helper.js";

export const saveBodySummary = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const summary = webhookData.body_health?.summary?.body_summary;
    if (!summary) return;

    const date = summary.metadata?.datetime_string
      ? new Date(summary.metadata.datetime_string)
      : new Date();

    const sourceArray = summary.metadata?.sources_of_data_array || ["Unknown"];
    const source = sourceArray[0];

    const sourceType = getSourceType(summary.non_structured_data_array);

    const metricsToSave = [];

    const bodyMetrics = summary.body_metrics;
    if (bodyMetrics) {
      if (isValidValue(bodyMetrics.weight_kg_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.WEIGHT,
            metric_value: bodyMetrics.weight_kg_float,
            metric_unit: "kg",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(bodyMetrics.height_cm_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.HEIGHT,
            metric_value: bodyMetrics.height_cm_int,
            metric_unit: "cm",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(bodyMetrics.bmi_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.BMI,
            metric_value: bodyMetrics.bmi_float,
            metric_unit: "bmi",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
    }

    const glucose = summary.blood_glucose;
    if (glucose && isValidValue(glucose.blood_glucose_avg_mg_per_dL_int)) {
      metricsToSave.push(
        new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.BLOOD_GLUCOSE,
          metric_value: glucose.blood_glucose_avg_mg_per_dL_int,
          metric_unit: "mg/dL",
          metric_source: source,
          source_type: sourceType,
          date,
        })
      );
    }

    const bp = summary.blood_pressure?.blood_pressure_avg_object;
    if (bp) {
      if (isValidValue(bp.systolic_mmHg_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.BLOOD_PRESSURE_SYSTOLIC,
            metric_value: bp.systolic_mmHg_int,
            metric_unit: "mmHg",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(bp.diastolic_mmHg_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.BLOOD_PRESSURE_DIASTOLIC,
            metric_value: bp.diastolic_mmHg_int,
            metric_unit: "mmHg",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
    }

    const hr = summary.heart_rate;
    if (hr && isValidValue(hr.hr_avg_bpm_int)) {
      metricsToSave.push(
        new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.HR_AVG,
          metric_value: hr.hr_avg_bpm_int,
          metric_unit: "bpm",
          metric_source: source,
          source_type: sourceType,
          date,
        })
      );
    }

    const hydration = summary.hydration;
    if (hydration && isValidValue(hydration.water_total_consumption_mL_int)) {
      metricsToSave.push(
        new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.WATER_TOTAL_CONSUMPTION,
          metric_value: hydration.water_total_consumption_mL_int,
          metric_unit: "ml",
          metric_source: source,
          source_type: sourceType,
          date,
        })
      );
    }

    const nutrition = summary.nutrition;
    if (nutrition) {
      if (isValidValue(nutrition.calories_intake_kcal_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.CALORIES_INTAKE,
            metric_value: nutrition.calories_intake_kcal_float,
            metric_unit: "kcal",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(nutrition.protein_intake_g_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.PROTEIN_INTAKE,
            metric_value: nutrition.protein_intake_g_float,
            metric_unit: "g",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(nutrition.fat_intake_g_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.FAT_INTAKE,
            metric_value: nutrition.fat_intake_g_float,
            metric_unit: "g",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(nutrition.carbohydrates_intake_g_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.CARBS_INTAKE,
            metric_value: nutrition.carbohydrates_intake_g_float,
            metric_unit: "g",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }
    }

    const oxy = summary.oxygenation;
    if (oxy && isValidValue(oxy.saturation_avg_percentage_int)) {
      metricsToSave.push(
        new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.OXYGENATION_SATURATION,
          metric_value: oxy.saturation_avg_percentage_int,
          metric_unit: "%",
          metric_source: source,
          source_type: sourceType,
          date,
        })
      );
    }

    if (metricsToSave.length > 0) {
      await Observation.insertMany(metricsToSave);
      console.log(
        `Saved ${metricsToSave.length} body_summary metrics for ${user_id}`
      );
    } else {
      console.log(`No valid body_summary metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving body_summary:", err);
  }
};

export default saveBodySummary;