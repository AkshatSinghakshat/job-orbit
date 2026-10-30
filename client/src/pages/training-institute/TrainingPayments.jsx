import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingPayments() {
  return <TrainingEntityPage
    title="Training Payments"
    endpoint="/payments"
    description="Manage training payments for your JobOrbit Training Institute."
  />;
}
