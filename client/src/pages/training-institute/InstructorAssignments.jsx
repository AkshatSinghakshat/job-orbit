import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function InstructorAssignments() {
  return <TrainingEntityPage
    title="Instructor Assignments"
    endpoint="/instructor-assignments"
    description="Manage instructor assignments for your JobOrbit Training Institute."
  />;
}
