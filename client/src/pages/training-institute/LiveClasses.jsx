import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function LiveClasses() {
  return <TrainingEntityPage
    title="Live Classes"
    endpoint="/live-classes"
    description="Manage live classes for your JobOrbit Training Institute."
  />;
}
