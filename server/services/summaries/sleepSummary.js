import mongoose from "mongoose";
import Observation  from "../../models/observation.model.js";
import  METRIC_TYPE  from "../../constants/metricTypes.js";


const isValidValue = (value) => {
  return value !== null && value !== undefined && !Number.isNaN(value) && value !== 0;
};

const getSourceType = (nonStructuredArray) => {
  if (!nonStructuredArray || nonStructuredArray.length === 0) return true;
  const logType = nonStructuredArray[0]?.logType || nonStructuredArray[0]?.type || "device";
  return logType !== "manual"; // true if device, false if manual
};

export const saveSleepSummary = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;

    const summary = webhookData.sleep_health?.summary?.sleep_summary;
    if (!summary) return;

    const date = summary.metadata?.datetime_string
      ? new Date(summary.metadata.datetime_string)
      : new Date();

    const sourceArray = summary.metadata?.sources_of_data_array || ["Unknown"];
    const source = sourceArray[0];

    const sourceType = getSourceType(summary.non_structured_data_array);

    const metricsToSave = [];


    const duration = summary.duration;
    if (duration) {
      if (isValidValue(duration.sleep_duration_seconds_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.SLEEP_DURATION,
          metric_value: duration.sleep_duration_seconds_int,
          metric_unit: "seconds",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
      if (isValidValue(duration.time_in_bed_seconds_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.TIME_IN_BED,
          metric_value: duration.time_in_bed_seconds_int,
          metric_unit: "seconds",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
      if (isValidValue(duration.light_sleep_duration_seconds_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.LIGHT_SLEEP_DURATION,
          metric_value: duration.light_sleep_duration_seconds_int,
          metric_unit: "seconds",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
      if (isValidValue(duration.deep_sleep_duration_seconds_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.DEEP_SLEEP_DURATION,
          metric_value: duration.deep_sleep_duration_seconds_int,
          metric_unit: "seconds",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
      if (isValidValue(duration.rem_sleep_duration_seconds_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.REM_SLEEP_DURATION,
          metric_value: duration.rem_sleep_duration_seconds_int,
          metric_unit: "seconds",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
    }

    const hr = summary.heart_rate;
    if (hr && isValidValue(hr.hr_avg_bpm_int)) {
      metricsToSave.push(new Observation({
        client_uuid: client_uuid,
        user_id,
        metric_type: METRIC_TYPE.HR_AVG,
        metric_value: hr.hr_avg_bpm_int,
        metric_unit: "bpm",
        metric_source: source,
        source_type: sourceType,
        date,
      }));
    }

    const scores = summary.scores;
    if (scores && isValidValue(scores.sleep_efficiency_1_100_score_int)) {
      metricsToSave.push(new Observation({
        client_uuid: client_uuid,
        user_id,
        metric_type: METRIC_TYPE.SLEEP_EFFICIENCY,
        metric_value: scores.sleep_efficiency_1_100_score_int,
        metric_unit: "%",
        metric_source: source,
        source_type: sourceType,
        date,
      }));
    }


    const breathing = summary.breathing;
    if (breathing) {
      if (isValidValue(breathing.saturation_avg_percentage_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.OXYGENATION_SATURATION,
          metric_value: breathing.saturation_avg_percentage_int,
          metric_unit: "%",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
      if (isValidValue(breathing.snoring_events_count_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.SNORING_EVENTS,
          metric_value: breathing.snoring_events_count_int,
          metric_unit: "count",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
      if (isValidValue(breathing.snoring_duration_total_seconds_int)) {
        metricsToSave.push(new Observation({
          client_uuid: client_uuid,
          user_id,
          metric_type: METRIC_TYPE.SNORING_DURATION,
          metric_value: breathing.snoring_duration_total_seconds_int,
          metric_unit: "seconds",
          metric_source: source,
          source_type: sourceType,
          date,
        }));
      }
    }


    if (metricsToSave.length > 0) {
      await Observation.insertMany(metricsToSave);
      console.log(`Saved ${metricsToSave.length} sleep_summary metrics for ${user_id}`);
    } else {
      console.log(`No valid sleep_summary metrics to save for ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving sleep_summary:", err);
  }
};

export default saveSleepSummary;
