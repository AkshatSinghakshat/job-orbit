import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentReports() {
  return <TrainingEntityPage
    title="Student Reports"
    endpoint="/student-reports"
    description="Manage student reports for your JobOrbit Training Institute."
  />;
}
