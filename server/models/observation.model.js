import mongoose from "mongoose";

const observationSchema = new mongoose.Schema(
  {
    client_uuid: {
      type: String,
    },
    user_id: {
      type: String,
      required: true,
    },
    metric_type: {
      type: Number,
      required: true,
    },
    metric_value: {
      type: Number,
      required: true,
    },
    metric_unit: {
      type: String,
      required: true,
    },
    metric_source: {
      type: String,
      required: true,
    },
    source_type: {
      type: Boolean,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const  Observation = mongoose.model("Observation", observationSchema);
export default Observation;
