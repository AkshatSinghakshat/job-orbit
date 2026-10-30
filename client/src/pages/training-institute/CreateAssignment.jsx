
import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function CreateAssignment() {
  return (
    <TrainingEntityPage
      title="Create Assignment"
      endpoint="/training/assignments"
      description="Create, view, and manage assignments for your JobOrbit Training Institute."
    />
  );
}
