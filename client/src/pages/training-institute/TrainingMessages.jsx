import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingMessages() {
  return <TrainingEntityPage
    title="Training Messages"
    endpoint="/messages"
    description="Manage training messages for your JobOrbit Training Institute."
  />;
}
