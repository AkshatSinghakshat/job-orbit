import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function TrainingEnquiries() {
  return <TrainingEntityPage
    title="Training Enquiries"
    endpoint="/enquiries"
    description="Manage training enquiries for your JobOrbit Training Institute."
  />;
}
