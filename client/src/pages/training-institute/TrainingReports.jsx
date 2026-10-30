import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingReports() {
  return <TrainingEntityPage
    title="Training Reports"
    endpoint="/reports"
    description="Manage training reports for your JobOrbit Training Institute."
  />;
}
