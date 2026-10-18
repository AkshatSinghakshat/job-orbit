
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../services/notificationService";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchCount = async () => {
      if (!localStorage.getItem("token")) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const response = await getUnreadCount();
        if (active) {
          const count = Number(response?.count ?? 0);
          setUnreadCount(
            Number.isFinite(count) ? Math.max(0, count) : 0
          );
        }
      } catch (error) {
        if (active) setUnreadCount(0);
        console.error("Notification count error:", error);
      }
    };

    fetchCount();
    const intervalId = setInterval(fetchCount, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications: ${unreadCount} unread`}
      title="Notifications"
      className="relative inline-flex h-10 w-10 shrink-0 items-center
                 justify-center rounded-full text-gray-700
                 transition hover:bg-gray-100 focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
    >
      <Bell size={22} />

      {unreadCount > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5
                     items-center justify-center rounded-full
                     bg-red-600 px-1 text-xs font-bold text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
