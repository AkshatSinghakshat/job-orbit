import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MessageCircle,
  Heart,
  UserPlus,
  Share2,
  Briefcase,
  X,
} from "lucide-react";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      if (data?.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error(
        "Notification load error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart size={18} />;

      case "comment":
        return <MessageCircle size={18} />;

      case "follow":
        return <UserPlus size={18} />;

      case "share":
        return <Share2 size={18} />;

      case "application":
      case "application_status":
        return <Briefcase size={18} />;

      default:
        return <Bell size={18} />;
    }
  };

  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const handleRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Mark read error:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all read error:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error.response?.data || error.message
      );
    }
  };

  // ==========================================
  // CLICK NOTIFICATION
  // ==========================================

 
const handleNotificationClick = async (notification) => {
  await handleRead(notification);

  // Open the related job
  if (
    notification.jobId &&
    (
      notification.type === "application_status" ||
      notification.type === "application"
    )
  ) {
    navigate(`/jobs/${notification.jobId}`);
    return;
  }

  // Open the related post
  if (notification.postId) {
    navigate(`/feed?post=${notification.postId}`);
  }
};


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <Bell size={20} className="animate-pulse" />
          Loading notifications...
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
              <Bell size={24} />
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with your JobOrbit activity.
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}

        </div>


        {/* EMPTY STATE */}

        {notifications.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <Bell
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-semibold text-slate-700">
              No notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You're all caught up.
            </p>

          </div>

        ) : (

          /* NOTIFICATION LIST */

          <div className="space-y-3">

            {notifications.map((notification) => (

              <div
                key={notification.id}
                onClick={() =>
                  handleNotificationClick(notification)
                }
                className={`group relative cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
                  notification.isRead
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >

                <div className="flex gap-3">

                  {/* ICON */}

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>


                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-sm font-semibold text-slate-800">

                          {notification.sender?.name ||
                            "Someone"}

                        </p>

                        <p className="mt-0.5 text-sm text-slate-600">
                          {notification.message}
                        </p>

                      </div>


                      {/* UNREAD DOT */}

                      {!notification.isRead && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                      )}

                    </div>


                    {/* DATE */}

                    <p className="mt-2 text-xs text-slate-400">
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>

                  </div>


                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Notifications;