import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function RevenueReports() {
  return <TrainingEntityPage
    title="Revenue Reports"
    endpoint="/revenue-reports"
    description="Manage revenue reports for your JobOrbit Training Institute."
  />;
}
