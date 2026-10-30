import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Notifications ab navbar dropdown mein hi open hote hain,
    // isliye user ko smoothly feed par bhej diya jata hai.
    const timer = setTimeout(() => {
      navigate("/feed", { replace: true });
    }, 600);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 mb-4 animate-bounce">
        <Bell size={28} />
      </div>
      <h2 className="text-lg font-semibold">Opening Notifications</h2>
      <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin text-blue-500" />
        Redirecting to your feed with quick navbar access...
      </p>
    </div>
  );
};

export default Notifications;