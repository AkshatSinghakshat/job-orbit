import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function InstructorDetails() {
  return <TrainingEntityPage
    title="Instructor Details"
    endpoint="/instructor-details"
    description="Manage instructor details for your JobOrbit Training Institute."
  />;
}
