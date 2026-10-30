import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentDetails() {
  return <TrainingEntityPage
    title="Student Details"
    endpoint="/student-details"
    description="Manage student details for your JobOrbit Training Institute."
  />;
}
