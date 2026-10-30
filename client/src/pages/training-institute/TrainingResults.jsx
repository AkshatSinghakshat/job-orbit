import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingResults() {
  return <TrainingEntityPage
    title="Training Results"
    endpoint="/training-results"
    description="Manage training results for your JobOrbit Training Institute."
  />;
}
