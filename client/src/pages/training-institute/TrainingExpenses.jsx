import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingExpenses() {
  return <TrainingEntityPage
    title="Training Expenses"
    endpoint="/training-expenses"
    description="Manage training expenses for your JobOrbit Training Institute."
  />;
}
