import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentFeedback() {
  return <TrainingEntityPage
    title="Student Feedback"
    endpoint="/student-feedback"
    description="Manage student feedback for your JobOrbit Training Institute."
  />;
}
