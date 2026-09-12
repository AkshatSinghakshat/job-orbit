import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Building2,
  BriefcaseBusiness,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const accountTypes = [
    {
      role: "student",
      title: "Student",
      description: "Create your student account",
      icon: GraduationCap,
    },
    {
      role: "college",
      title: "College",
      description: "Register your college",
      icon: Building2,
    },
    {
      role: "company",
      title: "Company",
      description: "Hire candidates and manage jobs",
      icon: BriefcaseBusiness,
    },
    {
      role: "training",
      title: "Training Institute",
      description: "Manage training programs",
      icon: BookOpen,
    },
  ];

  const handleContinue = () => {
    if (!selectedRole) return;

    const routes = {
      student: "/register/student",
      college: "/register/college",
      company: "/register/company",
      training: "/register/training",
    };

    navigate(routes[selectedRole]);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4">
            <BriefcaseBusiness size={28} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Join JobOrbit
          </h1>

          <p className="text-slate-400 mt-2">
            Select your account type to continue
          </p>

        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7 md:p-9">

          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Create your account
          </h2>

          <p className="text-slate-500 text-center mt-2 mb-8">
            Choose the type of account you want to create
          </p>

          {/* Account Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {accountTypes.map((account) => {
              const Icon = account.icon;
              const isSelected =
                selectedRole === account.role;

              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() =>
                    setSelectedRole(account.role)
                  }
                  className={`
                    text-left rounded-xl border-2 p-5
                    transition-all duration-200
                    ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }
                  `}
                >

                  <div
                    className={`
                      w-12 h-12 rounded-xl
                      flex items-center justify-center
                      mb-4
                      ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="font-bold text-lg text-slate-900">
                    {account.title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {account.description}
                  </p>

                </button>
              );
            })}

          </div>

          {/* Continue */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full mt-7 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>

          {/* Login */}
          <div className="text-center mt-6">

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Already have an account? Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;