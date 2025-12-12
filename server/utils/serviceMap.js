import bodySummaryService from "../services/summaries/bodySummary.js";
import physicalSummaryService from "../services/summaries/physicalSummary.js";
import sleepSummaryService from "../services/summaries/sleepSummary.js";
import heartRateEventService from "../services/events/hartRateEvent.js";
import bloodPressureEventService from "../services/events/bloodPressure.js";
import stepsEventService from "../services/events/stepsEvent.js";
import saveBodyMetricsEvent from "../services/events/bodyMetricsEvent.js";
import saveActivityEvent from "../services/events/activityEvent.js";

const serviceMap = {
  body_summary: bodySummaryService,
  sleep_summary: sleepSummaryService,
  heart_rate_event: heartRateEventService,
  blood_pressure_event: bloodPressureEventService,
  steps_event: stepsEventService,
  physical_summary: physicalSummaryService,
  body_metrics_event: saveBodyMetricsEvent,
  activity_event: saveActivityEvent,
};

export default serviceMap;
