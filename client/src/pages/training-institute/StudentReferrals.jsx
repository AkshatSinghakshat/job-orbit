import React from "react";
import TrainingEntityPage from "./TrainingEntityPage";

export default function StudentReferrals() {
  return <TrainingEntityPage
    title="Student Referrals"
    endpoint="/student-referrals"
    description="Manage student referrals for your JobOrbit Training Institute."
  />;
}
