import { Navigate, useParams } from "react-router-dom";

export default function EditCourse() {
  const { id } = useParams();
  return <Navigate to={id ? `/training-institute/courses/${encodeURIComponent(id)}` : "/training-institute/courses"} replace />;
}
