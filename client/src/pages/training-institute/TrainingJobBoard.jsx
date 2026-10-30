import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingJobBoard() {
  return <TrainingEntityPage
    title="Training Job Board"
    endpoint="/training-job-board"
    description="Manage training job board for your JobOrbit Training Institute."
  />;
}
