import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentAttendance() {
  return <TrainingEntityPage
    title="Student Attendance"
    endpoint="/student-attendance"
    description="Manage student attendance for your JobOrbit Training Institute."
  />;
}
