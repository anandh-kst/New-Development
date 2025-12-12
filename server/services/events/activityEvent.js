import Observation from "../../models/observation.model.js";
import METRIC_TYPES from "../../constants/metricTypes.js";
import {
  getMetricTypes,
  getSourceType,
  isValidValue,
} from "../../utils/service-helper.js";

const METRIC_TYPE = METRIC_TYPES;
const getActivityMetricType = (name) => {
  if (!name) return METRIC_TYPE.ACTIVITY_OTHER;
  const map = {
    Running: METRIC_TYPE.ACTIVITY_RUNNING,
    Walking: METRIC_TYPE.ACTIVITY_WALKING,
    Cycling: METRIC_TYPE.ACTIVITY_CYCLING,
    Swim: METRIC_TYPE.ACTIVITY_SWIMMING,
    Swimming: METRIC_TYPE.ACTIVITY_SWIMMING,
    Hiking: METRIC_TYPE.ACTIVITY_HIKING,
    Yoga: METRIC_TYPE.ACTIVITY_YOGA,
    "Strength Training": METRIC_TYPE.ACTIVITY_STRENGTH_TRAINING,
    Cardio: METRIC_TYPE.ACTIVITY_CARDIO,
  };
  return map[name] || METRIC_TYPE.ACTIVITY_OTHER;
};

export const saveActivityEvent = async (webhookData) => {
  try {
    const client_uuid = webhookData.client_uuid;
    const user_id = webhookData.user_id;
    const events = webhookData.physical_health?.events?.activity_event;
    if (!events || events.length === 0) return;

    const res = await getMetricTypes();
    METRIC_TYPE = Object.keys(res || {}).length > 0 ? res : METRIC_TYPES;

    const metricsToSave = [];

    for (const event of events) {
      const metadata = event.metadata || {};
      const activity = event.activity || {};
      const calories = event.calories || {};
      const distance = event.distance || {};
      const heartRate = event.heart_rate || {};
      const date = metadata.datetime_string
        ? new Date(metadata.datetime_string)
        : new Date();
      const source = metadata.sources_of_data_array?.[0] || "Unknown";
      const sourceType = getSourceType(event.non_structured_data_array);
      const activityValue = activity.activity_duration_seconds_int;
      const activityType = getActivityMetricType(
        activity.activity_type_name_string
      );
      if (activityValue && isValidValue(activityValue)) {
        metricsToSave.push(
          new Observation({
            client_uuid,
            user_id,
            metric_type: activityType,
            metric_value: activityValue,
            metric_unit: "seconds",
            metric_source: source,
            source_type: sourceType,
            date,
          })
        );
      }

      const metricsMap = [
        {
          type: METRIC_TYPE.CALORIES_EXPENDITURE,
          value: calories.calories_expenditure_kcal_float,
          unit: "kcal",
        },
        {
          type: METRIC_TYPE.WALKED_DISTANCE,
          value: distance.walked_distance_meters_float,
          unit: "meters",
        },
        { type: METRIC_TYPE.STEPS, value: distance.steps_int, unit: "steps" },
        {
          type: METRIC_TYPE.HR_AVG,
          value: heartRate.hr_avg_bpm_int,
          unit: "bpm",
        },
        {
          type: METRIC_TYPE.HR_MAX,
          value: heartRate.hr_maximum_bpm_int,
          unit: "bpm",
        },
        {
          type: METRIC_TYPE.HR_MIN,
          value: heartRate.hr_minimum_bpm_int,
          unit: "bpm",
        },
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
      console.log(
        `Saved ${metricsToSave.length} activity_event metrics for user ${user_id}`
      );
    } else {
      console.log(`No valid activity_event metrics found for user ${user_id}`);
    }
  } catch (err) {
    console.error("Error saving activity_event:", err);
  }
};

export default saveActivityEvent;
