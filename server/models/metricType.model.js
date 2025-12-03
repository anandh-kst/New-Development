import mongoose from "mongoose";

const metricTypeSchema = new mongoose.Schema({
    metric_type: {
        type: Number,
        required: true
    },
    metric_name: {
        type: String,
        required: true
    }
});

export default mongoose.model("MetricType", metricTypeSchema);