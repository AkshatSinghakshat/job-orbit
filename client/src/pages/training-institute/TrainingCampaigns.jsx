import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingCampaigns() {
  return <TrainingEntityPage
    title="Training Campaigns"
    endpoint="/training-campaigns"
    description="Manage training campaigns for your JobOrbit Training Institute."
  />;
}
