import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingNotifications() {
  return <TrainingEntityPage
    title="Training Notifications"
    endpoint="/notifications"
    description="Manage training notifications for your JobOrbit Training Institute."
  />;
}
