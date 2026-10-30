import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function InstructorAvailability() {
  return <TrainingEntityPage
    title="Instructor Availability"
    endpoint="/instructor-availability"
    description="Manage instructor availability for your JobOrbit Training Institute."
  />;
}
