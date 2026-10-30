import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingAnnouncements() {
  return <TrainingEntityPage
    title="Training Announcements"
    endpoint="/training-announcements"
    description="Manage training announcements for your JobOrbit Training Institute."
  />;
}
