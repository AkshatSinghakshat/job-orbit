
import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function CreateBatch() {
  return (
    <TrainingEntityPage
      title="Create Batch"
      endpoint="/training/batches"
      description="Create, view, and manage training batches, including batch schedules, capacity, instructors, and enrollment details."
    />
  );
}
