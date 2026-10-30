import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const groups = [
 ["Overview", [["Dashboard","/training-institute"],["Institute Profile","/training-institute/profile"],["Verification","/training-institute/verification"]]],
 ["Courses", [["All Courses","/training-institute/courses"],["Create Course","/training-institute/courses/create"],["Categories","/training-institute/categories"],["Curriculum","/training-institute/curriculum"]]],
 ["Students", [["Applications","/training-institute/applications"],["Enrolled Students","/training-institute/students"],["Attendance","/training-institute/attendance"],["Performance","/training-institute/performance"]]],
 ["Operations", [["Batches","/training-institute/batches"],["Schedule","/training-institute/schedule"],["Instructors","/training-institute/instructors"],["Assignments","/training-institute/assignments"]]],
 ["Finance", [["Payments","/training-institute/payments"],["Invoices","/training-institute/invoices"],["Revenue","/training-institute/revenue"]]],
 ["Growth", [["Analytics","/training-institute/analytics"],["Placements","/training-institute/placements"],["Leads","/training-institute/leads"],["Messages","/training-institute/messages"]]],
 ["Settings", [["Settings","/training-institute/settings"],["Support","/training-institute/support"]]]
];
export default function TrainingInstituteLayout(){
 return <div className="min-h-screen bg-[#080d20] text-white md:flex">
  <aside className="w-full shrink-0 border-b border-[#243047] bg-[#0b1224] p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
   <a href="/training-institute" className="mb-6 block text-xl font-extrabold">JobOrbit <span className="text-blue-400">Training</span></a>
   <nav className="space-y-5">{groups.map(([group,links])=><div key={group}><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">{group}</p><div className="space-y-1">{links.map(([label,to])=><NavLink end={to==="/training-institute"} key={to} to={to} className={({isActive})=>`block rounded-lg px-3 py-2 text-sm ${isActive?"bg-blue-600 text-white":"text-slate-300 hover:bg-[#17213a]"}`}>{label}</NavLink>)}</div></div>)}</nav>
  </aside>
  <div className="min-w-0 flex-1"><Outlet/></div>
 </div>;
}
