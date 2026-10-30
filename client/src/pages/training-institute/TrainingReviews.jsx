import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingReviews() {
  return <TrainingEntityPage
    title="Training Reviews"
    endpoint="/reviews"
    description="Manage training reviews for your JobOrbit Training Institute."
  />;
}
