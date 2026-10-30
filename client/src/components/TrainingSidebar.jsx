import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Wallet,
  BarChart3,
  Users,
  UserPlus,
  BriefcaseBusiness,
  Award,
  Video,
  FileCheck,
} from "lucide-react";

const menuGroups = [
  {
    title: "MAIN MENU",
    items: [
      {
        label: "Dashboard",
        path: "/training-institute/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "COURSE MANAGEMENT",
    items: [
      {
        label: "Course Categories",
        path: "/training-institute/course-categories",
        icon: Layers,
      },
      {
        label: "Course Curriculum",
        path: "/training-institute/course-curriculum",
        icon: FileText,
      },
      {
        label: "Course Details",
        path: "/training-institute/course-details",
        icon: BookOpen,
      },
      {
        label: "Course Fees",
        path: "/training-institute/course-fees",
        icon: Wallet,
      },
      {
        label: "Course Performance",
        path: "/training-institute/course-performance",
        icon: BarChart3,
      },
      {
        label: "Batch Details",
        path: "/training-institute/batch-details",
        icon: Users,
      },
    ],
  },
  {
    title: "STUDENT & CAREER",
    items: [
      {
        label: "Application Details",
        path: "/training-institute/application-details",
        icon: FileCheck,
      },
      {
        label: "Add Instructor",
        path: "/training-institute/add-instructor",
        icon: UserPlus,
      },
      {
        label: "Career Support",
        path: "/training-institute/career-support",
        icon: BriefcaseBusiness,
      },
      {
        label: "Certificate Verification",
        path: "/training-institute/certificate-verification",
        icon: Award,
      },
      {
        label: "Class Recordings",
        path: "/training-institute/class-recordings",
        icon: Video,
      },
    ],
  },
];

export default function TrainingSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <h2 className="text-xl font-extrabold text-blue-700">
          JobOrbit
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Training Institute Portal
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-slate-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/training-institute/dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="text-xs text-slate-500">
          JobOrbit Training Institute
        </p>
      </div>
    </aside>
  );
}
