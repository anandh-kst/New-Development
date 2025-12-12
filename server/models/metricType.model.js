import mongoose from "mongoose";

const metricTypeSchema = new mongoose.Schema({
  metric_type: {
    type: Number,
    required: true,
  },
  metric_name: {
    type: String,
    required: true,
  },
  metric_category: {
    type: String,
    required: true,
  },
});

const MetricType =
  mongoose.models.MetricType || mongoose.model("metric_type", metricTypeSchema);
export default MetricType;
