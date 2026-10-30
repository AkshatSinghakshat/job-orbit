import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function EmployerConnections() {
  return <TrainingEntityPage
    title="Employer Connections"
    endpoint="/employer-connections"
    description="Manage employer connections for your JobOrbit Training Institute."
  />;
}
