import MetricType from "../models/metricType.model.js";

export const isValidValue = (value) =>
  value !== null && value !== undefined && !Number.isNaN(value) && value !== 0;

export const getSourceType = (nonStructuredArray) => {
  if (!nonStructuredArray || nonStructuredArray.length === 0) return true;
  const type =
    nonStructuredArray[0]?.logType || nonStructuredArray[0]?.type || "device";
  return type !== "manual";
};

export async function getMetricTypes() {
  try {
    const metrics = await MetricType.find({})
      .select("metric_code metric_type -_id")
      .lean();

    const METRIC_TYPES = {};
    metrics.forEach((metric) => {
      METRIC_TYPES[metric.metric_code] = metric.metric_type;
    });

    return METRIC_TYPES;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}

export async function getMetricUom() {
  try {
    const metrics = await MetricType.find({})
      .select("metric_type metric_uom -_id")
      .lean();
    const METRIC_UOM = {};
    metrics.forEach((metric) => {
      METRIC_UOM[metric.metric_type] = metric.metric_uom;
    });
    return METRIC_UOM;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}
