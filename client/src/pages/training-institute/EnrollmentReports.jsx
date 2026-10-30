import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function EnrollmentReports() {
  return <TrainingEntityPage
    title="Enrollment Reports"
    endpoint="/enrollment-reports"
    description="Manage enrollment reports for your JobOrbit Training Institute."
  />;
}
