import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingLeads() {
  return <TrainingEntityPage
    title="Training Leads"
    endpoint="/leads"
    description="Manage training leads for your JobOrbit Training Institute."
  />;
}
