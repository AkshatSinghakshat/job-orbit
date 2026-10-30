import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingSchedule() {
  return <TrainingEntityPage
    title="Training Schedule"
    endpoint="/training-schedule"
    description="Manage training schedule for your JobOrbit Training Institute."
  />;
}
