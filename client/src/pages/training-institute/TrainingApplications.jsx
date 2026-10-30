import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingApplications() {
  return <TrainingEntityPage
    title="Training Applications"
    endpoint="/applications"
    description="Manage training applications for your JobOrbit Training Institute."
  />;
}
