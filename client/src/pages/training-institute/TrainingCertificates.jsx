import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingCertificates() {
  return <TrainingEntityPage
    title="Training Certificates"
    endpoint="/certificates"
    description="Manage training certificates for your JobOrbit Training Institute."
  />;
}
