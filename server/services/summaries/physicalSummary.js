import mongoose from "mongoose";
import Observation from "../../models/observation.model.js";
import METRIC_TYPE from "../../constants/metricTypes.js";
import { getSourceType, isValidValue } from "../../utils/service-helper.js";

export const savePhysicalSummary = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const summary = webhookData.physical_health?.summary?.physical_summary;
    if (!summary) return;

    const date = summary.metadata?.datetime_string
      ? new Date(summary.metadata.datetime_string)
      : new Date();

    const sourceArray = summary.metadata?.sources_of_data_array || ["Unknown"];
    const source = sourceArray.length > 1 ? sourceArray.join("+") : sourceArray[0];
    const sourceType = getSourceType(summary.non_structured_data_array);

    const metricsToSave = [];
    const activity = summary.activity;
    if (activity) {
      if (isValidValue(activity.active_seconds_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.ACTIVE_SECONDS,
            metric_value: activity.active_seconds_int,
            metric_unit: "seconds",
            metric_source: "summary",
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(activity.rest_seconds_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.REST_SECONDS,
            metric_value: activity.rest_seconds_int,
            metric_unit: "seconds",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(activity.low_intensity_seconds_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.LOW_INTENSITY_SECONDS,
            metric_value: activity.low_intensity_seconds_int,
            metric_unit: "seconds",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(activity.moderate_intensity_seconds_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.MODERATE_INTENSITY_SECONDS,
            metric_value: activity.moderate_intensity_seconds_int,
            metric_unit: "seconds",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(activity.vigorous_intensity_seconds_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.VIGOROUS_INTENSITY_SECONDS,
            metric_value: activity.vigorous_intensity_seconds_int,
            metric_unit: "seconds",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
    }

    /** CALORIES **/
    const calories = summary.calories;
    if (calories) {
      if (isValidValue(calories.calories_expenditure_kcal_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.CALORIES_EXPENDITURE,
            metric_value: calories.calories_expenditure_kcal_float,
            metric_unit: "kcal",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(calories.calories_net_active_kcal_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.CALORIES_NET_ACTIVE,
            metric_value: calories.calories_net_active_kcal_float,
            metric_unit: "kcal",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
    }

    /** DISTANCE **/
    const distance = summary.distance;
    if (distance) {
      if (isValidValue(distance.steps_int)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.STEPS,
            metric_value: distance.steps_int,
            metric_unit: "steps",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(distance.traveled_distance_meters_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.WALKED_DISTANCE,
            metric_value: distance.traveled_distance_meters_float,
            metric_unit: "meters",
            metric_source: 'summary',
            source_type: sourceType,
            date,
          })
        );
      }
      if (isValidValue(distance.swimming_num_strokes_float)) {
        metricsToSave.push(
          new Observation({
            client_uuid: client_uuid,
            user_id,
            metric_type: METRIC_TYPE.SWIMMING_NUM_STROKES,
            metric_value: distance.swimming_num_strokes_float,
            metric_unit: "strokes",
            metric_source: 'summary',
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
          metric_source: 'summary',
          source_type: sourceType,
          date,
        })
      );
    }

    const stress = summary.stress;
    if (stress && isValidValue(stress.stress_duration_seconds_int)) {
      metricsToSave.push(
        new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.STRESS_DURATION,
          metric_value: stress.stress_duration_seconds_int,
          metric_unit: "seconds",
          metric_source: 'summary',
          source_type: sourceType,
          date,
        })
      );
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
          metric_source: 'summary',
          source_type: sourceType,
          date,
        })
      );
    }

    if (metricsToSave.length > 0) {
      await Observation.insertMany(metricsToSave);
      console.log(
        `Saved ${metricsToSave.length} physical_summary metrics for ${user_id}`
      );
    } else {
      console.log(`No valid metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving physical_summary:", err);
  }
};

export default savePhysicalSummary;
