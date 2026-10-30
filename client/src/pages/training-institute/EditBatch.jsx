import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function EditBatch() {
  return <TrainingEntityPage
    title="Edit Batch"
    endpoint="/edit-batch"
    description="Manage edit batch for your JobOrbit Training Institute."
  />;
}
