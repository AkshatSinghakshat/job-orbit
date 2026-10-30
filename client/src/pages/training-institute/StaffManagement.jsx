import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StaffManagement() {
  return <TrainingEntityPage
    title="Staff Management"
    endpoint="/staff-management"
    description="Manage staff management for your JobOrbit Training Institute."
  />;
}
