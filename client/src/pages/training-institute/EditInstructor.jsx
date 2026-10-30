import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function EditInstructor() {
  return <TrainingEntityPage
    title="Edit Instructor"
    endpoint="/edit-instructor"
    description="Manage edit instructor for your JobOrbit Training Institute."
  />;
}
