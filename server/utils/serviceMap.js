import bodySummaryService from "../services/summaries/bodySummary.js";
import physicalSummaryService from "../services/summaries/physicalSummary.js";
import sleepSummaryService from "../services/summaries/sleepSummary.js";
import heartRateEventService from "../services/events/hartRateEvent.js";
import bloodPressureEventService from "../services/events/bloodPressure.js";
import stepsEventService from "../services/events/stepsEvent.js";
import saveBodyMetricsEvent from "../services/events/bodyMetricsEvent.js";
import saveActivityEvent from "../services/events/activityEvent.js";
import saveOxygenationEvent from "../services/events/oxygenationEvent.js";
import saveTemperatureEvent from "../services/events/temperatureEvent.js";
import saveCaloriesEvent from "../services/events/caloriesEvent.js";
import saveStressEvent from "../services/events/stressEvent.js";
import saveNutritionEvent from "../services/events/nutritionEvent.js";
import saveHydrationEvent from "../services/events/hydrationEvent.js";

const serviceMap = {
  // body_summary: bodySummaryService,
  // sleep_summary: sleepSummaryService,
  // heart_rate_event: heartRateEventService,
  blood_pressure_event: bloodPressureEventService,
  steps_event: stepsEventService,
  physical_summary: physicalSummaryService,
  body_metrics_event: saveBodyMetricsEvent,
  activity_event: saveActivityEvent,
  oxygenation_event: saveOxygenationEvent,
  temperature_event: saveTemperatureEvent,
  calories_event: saveCaloriesEvent,
  stress_event: saveStressEvent,
  nutrition_event: saveNutritionEvent,
  hydration_event: saveHydrationEvent,
};

export default serviceMap;
