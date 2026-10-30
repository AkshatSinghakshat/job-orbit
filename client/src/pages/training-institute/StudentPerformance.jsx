import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentPerformance() {
  return <TrainingEntityPage
    title="Student Performance"
    endpoint="/student-performance"
    description="Manage student performance for your JobOrbit Training Institute."
  />;
}
