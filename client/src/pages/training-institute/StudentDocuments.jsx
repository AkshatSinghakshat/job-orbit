import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentDocuments() {
  return <TrainingEntityPage
    title="Student Documents"
    endpoint="/student-documents"
    description="Manage student documents for your JobOrbit Training Institute."
  />;
}
