import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  Image,
  Send,
  Loader2,
  User,
  LogOut,
  Home,
  BriefcaseBusiness,
  Users,
  MoreHorizontal,
  Globe2,
  Heart,
  MessageCircle,
  Share2,
  X,
  Bell,
  Bookmark,
  Repeat2,
  Flag,
  EyeOff,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  Smile,
  Reply,
  Maximize2,
  RefreshCw,
  TrendingUp,
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Settings,
  UserPlus,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

function Feed() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(null);

  // ==========================================
  // CREATE POST
  // ==========================================

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);

  // ==========================================
  // FEED
  // ==========================================

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // SEARCH / FILTER
  // ==========================================

  const [searchTerm, setSearchTerm] = useState("");
  const [feedFilter, setFeedFilter] = useState("all");

  const [hiddenPostIds, setHiddenPostIds] =
    useState([]);

  const [refreshing, setRefreshing] =
    useState(false);

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [pendingPostId, setPendingPostId] =
    useState(null);

  // ==========================================
  // LOAD USER + FEED
  // ==========================================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user");

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Invalid user data:",
          error
        );

        localStorage.removeItem("user");
      }
    }

    try {
      const savedHiddenPosts =
        JSON.parse(
          localStorage.getItem(
            "joborbit_hidden_posts"
          ) || "[]"
        );

      setHiddenPostIds(
        Array.isArray(savedHiddenPosts)
          ? savedHiddenPosts.map(Number)
          : []
      );
    } catch (error) {
      console.error(
        "Hidden posts load error:",
        error
      );
    }

    fetchFeed();
    fetchUnreadCount();
    fetchNotifications();
  }, []);

  // ==========================================
  // URL POST SUPPORT
  // /feed?post=123
  // ==========================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const postId =
      Number(params.get("post"));

    if (postId) {
      setPendingPostId(postId);
    }
  }, []);

  // ==========================================
  // HASHTAG SEARCH EVENT
  // ==========================================

  useEffect(() => {
    const handleJobOrbitSearch =
      (event) => {
        setSearchTerm(
          String(event.detail || "")
        );

        setFeedFilter("all");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      };

    window.addEventListener(
      "joborbit-search",
      handleJobOrbitSearch
    );

    return () =>
      window.removeEventListener(
        "joborbit-search",
        handleJobOrbitSearch
      );
  }, []);

  // ==========================================
  // FETCH FEED
  // ==========================================

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response =
        await axios.get(
          `${API_URL}/posts/feed`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.data.success) {
        setPosts(
          response.data.posts || []
        );
      }
    } catch (error) {
      console.error(
        "Feed Error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load feed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications =
    async () => {
      try {
        setNotificationLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) return;

        const response =
          await axios.get(
            `${API_URL}/notifications`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (response.data.success) {
          setNotifications(
            response.data.notifications ||
              []
          );
        }
      } catch (error) {
        console.error(
          "Fetch Notifications Error:",
          error.response?.data ||
            error.message
        );
      } finally {
        setNotificationLoading(
          false
        );
      }
    };

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const fetchUnreadCount =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) return;

        const response =
          await axios.get(
            `${API_URL}/notifications/unread-count`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (response.data.success) {
          setUnreadCount(
            Number(
              response.data.count
            ) || 0
          );
        }
      } catch (error) {
        console.error(
          "Unread Count Error:",
          error.response?.data ||
            error.message
        );
      }
    };

  // ==========================================
  // NOTIFICATION POLLING
  // ==========================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        fetchUnreadCount();

        if (notificationOpen) {
          fetchNotifications();
        }
      }, 15000);

    return () =>
      clearInterval(interval);
  }, [notificationOpen]);

  // ==========================================
  // MARK NOTIFICATION READ
  // ==========================================

  const markNotificationAsRead =
    async (notificationId) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) return;

        await axios.put(
          `${API_URL}/notifications/${notificationId}/read`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setNotifications(
          (prev) =>
            prev.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      isRead: true,
                    }
                  : notification
            )
        );

        setUnreadCount(
          (prev) =>
            Math.max(0, prev - 1)
        );
      } catch (error) {
        console.error(
          "Mark Notification Read Error:",
          error.response?.data ||
            error.message
        );
      }
    };

  // ==========================================
  // NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick =
    async (notification) => {
      try {
        if (!notification.isRead) {
          await markNotificationAsRead(
            notification.id
          );
        }

        setNotificationOpen(false);

        if (!notification.postId) {
          return;
        }

        const postId =
          Number(
            notification.postId
          );

        if (!postId) return;

        setPendingPostId(postId);

        const existingPost =
          posts.find(
            (post) =>
              Number(post.id) ===
              postId
          );

        if (!existingPost) {
          await fetchFeed();
        }
      } catch (error) {
        console.error(
          "Notification Click Error:",
          error.response?.data ||
            error.message
        );
      }
    };

  // ==========================================
  // SCROLL TO POST
  // ==========================================

  useEffect(() => {
    if (!pendingPostId) return;

    let attempts = 0;

    const findAndScroll = () => {
      const postElement =
        document.getElementById(
          `post-${pendingPostId}`
        );

      if (postElement) {
        postElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        postElement.classList.add(
          "ring-4",
          "ring-blue-500",
          "ring-offset-4",
          "ring-offset-slate-950"
        );

        setTimeout(() => {
          postElement.classList.remove(
            "ring-4",
            "ring-blue-500",
            "ring-offset-4",
            "ring-offset-slate-950"
          );
        }, 3000);

        setPendingPostId(null);

        return;
      }

      attempts++;

      if (attempts < 20) {
        setTimeout(
          findAndScroll,
          200
        );
      } else {
        setPendingPostId(null);
      }
    };

    findAndScroll();
  }, [pendingPostId, posts]);

  // ==========================================
  // MARK ALL NOTIFICATIONS
  // ==========================================

  const markAllNotificationsAsRead =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) return;

        await axios.put(
          `${API_URL}/notifications/read-all`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setNotifications(
          (prev) =>
            prev.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Mark All Read Error:",
          error.response?.data ||
            error.message
        );
      }
    };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const deleteNotification =
    async (notificationId) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) return;

        const notification =
          notifications.find(
            (item) =>
              item.id ===
              notificationId
          );

        await axios.delete(
          `${API_URL}/notifications/${notificationId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setNotifications(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                notificationId
            )
        );

        if (
          notification &&
          !notification.isRead
        ) {
          setUnreadCount(
            (prev) =>
              Math.max(0, prev - 1)
          );
        }
      } catch (error) {
        console.error(
          "Delete Notification Error:",
          error.response?.data ||
            error.message
        );
      }
    };

  // ==========================================
  // MEDIA SELECT
  // ==========================================

  const handleMediaChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV files are allowed."
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >
      50 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 50 MB."
      );

      e.target.value = "";

      return;
    }

    setError("");
    setMedia(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);
  };

  // ==========================================
  // REMOVE MEDIA
  // ==========================================

  const removeMedia = () => {
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setMedia(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // ==========================================
  // CREATE POST
  // ==========================================

  const handleCreatePost =
    async (e) => {
      e.preventDefault();

      if (
        !content.trim() &&
        !media
      ) {
        setError(
          "Write something or upload a photo/video."
        );

        return;
      }

      try {
        setPosting(true);
        setError("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const formData =
          new FormData();

        formData.append(
          "content",
          content.trim()
        );

        formData.append(
          "visibility",
          visibility
        );

        if (media) {
          formData.append(
            "media",
            media
          );
        }

        // IMPORTANT:
        // Correct create-post API
        const response =
          await axios.post(
            `${API_URL}/posts`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        if (response.data.success) {
          const newPost =
            response.data.post;

          setPosts(
            (prev) => [
              newPost,
              ...prev,
            ]
          );

          setContent("");
          setVisibility("public");

          removeMedia();
        }
      } catch (error) {
        console.error(
          "Create Post Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to create post"
        );
      } finally {
        setPosting(false);
      }
    };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefreshFeed =
    async () => {
      try {
        setRefreshing(true);

        await fetchFeed();
      } finally {
        setRefreshing(false);
      }
    };

  // ==========================================
  // HIDE POST
  // ==========================================

  const handleHidePost =
    (postId) => {
      const next = [
        ...new Set([
          ...hiddenPostIds,
          Number(postId),
        ]),
      ];

      setHiddenPostIds(next);

      localStorage.setItem(
        "joborbit_hidden_posts",
        JSON.stringify(next)
      );
    };

  // ==========================================
  // RESTORE HIDDEN POSTS
  // ==========================================

  const handleUndoHiddenPosts =
    () => {
      setHiddenPostIds([]);

      localStorage.removeItem(
        "joborbit_hidden_posts"
      );
    };

  // ==========================================
  // FILTER POSTS
  // ==========================================

  const filteredPosts =
    posts.filter((post) => {
      if (
        hiddenPostIds.includes(
          Number(post.id)
        )
      ) {
        return false;
      }

      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (query) {
        const postContent =
          post?.content?.toLowerCase() ||
          "";

        const author =
          post?.User?.name?.toLowerCase() ||
          "";

        const role =
          post?.User?.role?.toLowerCase() ||
          "";

        if (
          !postContent.includes(
            query
          ) &&
          !author.includes(
            query
          ) &&
          !role.includes(query)
        ) {
          return false;
        }
      }

      if (
        feedFilter ===
        "with-media"
      ) {
        return Boolean(
          post?.mediaUrl
        );
      }

      if (
        feedFilter === "text"
      ) {
        return !post?.mediaUrl;
      }

      if (
        feedFilter ===
        "following"
      ) {
        return (
          post?.visibility ===
          "followers"
        );
      }

      return true;
    });

  // ==========================================
  // ROLE-BASED DASHBOARD NAVIGATION
  // ==========================================

  const goToDashboard = () => {
    // Prefer the current in-memory user; fall back to localStorage.
    let currentUser = user;

    if (!currentUser) {
      try {
        currentUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );
      } catch (error) {
        console.error("Unable to read user role:", error);
      }
    }
    
<button
  type="button"
  onClick={() => window.location.href = "/codearena"}
  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition hover:scale-105 hover:shadow-lg"
>
  <span>💻</span>
  <span>CodeArena</span>
  <span>→</span>
</button>


    const role = String(currentUser?.role || "student")
      .trim()
      .toLowerCase();

    if (role === "company" || role === "employer") {
      navigate("/company/dashboard");
      return;
    }

    navigate("/student/dashboard");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // NOTIFICATION DATE
  // ==========================================

  const formatNotificationDate =
    (date) => {
      if (!date) return "";

      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20">
            <Loader2
              size={28}
              className="animate-spin text-blue-500"
            />
          </div>

          <div>
            <p className="font-semibold">
              Loading JobOrbit
            </p>

            <p className="text-sm text-slate-400">
              Preparing your feed...
            </p>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 shadow-xl backdrop-blur">

        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* LOGO */}

          <button
            type="button"
            onClick={() =>
              navigate("/feed")
            }
            className="shrink-0 text-left"
          >

            <h1 className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              JobOrbit
            </h1>

            <p className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
              CAREER • JOBS • NETWORK
            </p>

          </button>

          {/* SEARCH */}

          <div className="hidden max-w-xl flex-1 md:block">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search JobOrbit..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">

            {/* NOTIFICATION */}

            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  const next =
                    !notificationOpen;

                  setNotificationOpen(
                    next
                  );

                  if (next) {
                    fetchNotifications();
                    fetchUnreadCount();
                  }
                }}
                className="relative rounded-xl border border-transparent p-2.5 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-blue-400"
                title="Notifications"
              >

                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-[19px] h-[19px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white ring-2 ring-slate-900">
                    {unreadCount >
                    99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </button>

              {/* NOTIFICATION DROPDOWN */}

              {notificationOpen && (
                <div className="absolute right-0 top-14 z-[300] w-[370px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">

                    <div>
                      <h3 className="font-bold text-white">
                        Notifications
                      </h3>

                      <p className="text-xs text-slate-500">
                        Your latest activity
                      </p>
                    </div>

                    {unreadCount >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  <div className="max-h-[450px] overflow-y-auto">

                    {notificationLoading ? (
                      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">

                        <Loader2
                          size={18}
                          className="animate-spin text-blue-500"
                        />

                        Loading...

                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="py-12 text-center">

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                          <Bell size={22} />
                        </div>

                        <p className="text-sm text-slate-400">
                          No notifications
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <div
                            key={
                              notification.id
                            }
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`group cursor-pointer border-b border-slate-800 px-4 py-3 transition hover:bg-slate-800 ${
                              !notification.isRead
                                ? "bg-blue-950/40"
                                : "bg-slate-900"
                            }`}
                          >

                            <div className="flex gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                                <Bell size={17} />
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p className={`text-sm ${
                                    !notification.isRead
                                      ? "font-semibold text-white"
                                      : "text-slate-300"
                                  }`}>
                                    {
                                      notification.message
                                    }
                                  </p>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      deleteNotification(
                                        notification.id
                                      );
                                    }}
                                    className="hidden rounded-lg p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 group-hover:block"
                                  >
                                    <X size={14} />
                                  </button>

                                </div>

                                {notification.Post?.content && (
                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    "{notification.Post.content}"
                                  </p>
                                )}

                                {notification.sender?.name && (
                                  <p className="mt-1 text-[11px] text-slate-600">
                                    {
                                      notification.sender.name
                                    }
                                  </p>
                                )}

                                <p className="mt-1 text-[10px] text-slate-600">
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </p>

                              </div>

                              {!notification.isRead && (
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              )}

                            </div>

                          </div>
                        )
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* PROFILE */}

            <button
              type="button"
              onClick={goToDashboard}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-slate-700 hover:bg-slate-800"
              title="Open Dashboard"
            >

              <div className="hidden text-right sm:block">

                <p className="max-w-[130px] truncate text-sm font-semibold text-white">
                  {user?.name ||
                    "User"}
                </p>

                <p className="text-[10px] capitalize text-slate-500">
                  {user?.role ||
                    "student"}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <User size={19} />
              </div>

            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="hidden rounded-xl border border-slate-700 p-2.5 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 sm:block"
              title="Logout"
            >
              <LogOut size={18} />
            </button>

          </div>

        </div>

      </header>

      {/* PART 2 WILL CONTINUE HERE */}
      <main className="mx-auto w-full max-w-[1600px] px-2 py-4 sm:px-5 sm:py-5 lg:px-8">

  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[235px_minmax(0,1fr)_300px]">

    {/* =====================================================
        LEFT SIDEBAR
    ====================================================== */}

    <aside className="hidden lg:block">

      <div className="sticky top-24 space-y-4">

        {/* PROFILE MINI CARD */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <User size={22} />
            </div>

            <div className="min-w-0">

              <p className="truncate font-semibold text-white">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs capitalize text-slate-500">
                {user?.role || "student"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-4 w-full rounded-xl border border-blue-600/40 bg-blue-600/10 py-2.5 text-sm font-semibold text-blue-400 transition hover:bg-blue-600/20"
          >
            View Profile
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">

          <button
            type="button"
            onClick={() =>
              navigate("/feed")
            }
            className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
          >
            <Home size={19} />
            Feed
          </button>

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/jobs")
            }
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <BriefcaseBusiness size={19} />
            Jobs
          </button>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <Users size={19} />
            My Network
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/notifications")
            }
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <Bell size={19} />
            Notifications

            {unreadCount > 0 && (
              <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <GraduationCap size={19} />
            Education
          </button>

        </div>

        {/* QUICK INFO */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-blue-400"
            />

            <h3 className="font-semibold text-white">
              JobOrbit
            </h3>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Build your professional network,
            discover jobs and grow your career.
          </p>

        </div>

      </div>

    </aside>


    {/* =====================================================
        CENTER FEED
    ====================================================== */}

    <section className="min-w-0">

      {/* =================================================
          CREATE POST
      ================================================= */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">

        {/* USER */}

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <User size={21} />
          </div>

          <div className="min-w-0">

            <p className="truncate font-semibold text-white">
              {user?.name || "User"}
            </p>

            <p className="text-xs capitalize text-slate-500">
              {user?.role || "student"}
            </p>

          </div>

        </div>


        {/* FORM */}

        <form onSubmit={handleCreatePost}>

          <textarea
  value={content}
  onChange={(e) => {
    setContent(e.target.value);
    setError("");
  }}
  placeholder="What's on your mind?"
  rows={3}
  className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:p-4"
/>


          {/* MEDIA PREVIEW */}

          {preview && media && (
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-black">

              {media.type.startsWith("image/") ? (
                <img
                  src={preview}
                  alt="Post preview"
                  className="max-h-[450px] w-full object-contain"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="max-h-[450px] w-full"
                />
              )}

              <button
                type="button"
                onClick={removeMedia}
                className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-red-600"
              >
                <X size={14} />
                Remove
              </button>

            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}


          {/* QUICK TOOLS */}

          <div className="mt-4 flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                setContent((prev) =>
                  prev.includes("📊 Poll:")
                    ? prev
                    : `${prev}${prev ? "\n\n" : ""}📊 Poll: `
                )
              }
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              📊 Add Poll
            </button>

            <button
              type="button"
              onClick={() =>
                setContent((prev) =>
                  `${prev}${prev ? " " : ""}#`
                )
              }
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              # Hashtag
            </button>

            <button
              type="button"
              onClick={() =>
                setContent((prev) =>
                  `${prev}${prev ? " " : ""}@`
                )
              }
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              @ Mention
            </button>

            <button
              type="button"
              onClick={() =>
                setContent((prev) =>
                  `${prev}${prev ? " " : ""}😊`
                )
              }
              className="flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <Smile size={14} />
              Emoji
            </button>

          </div>


          {/* POST OPTIONS */}

          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center">

            <div className="flex flex-wrap items-center gap-2">

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-green-400 transition hover:bg-green-500/10"
              >
                <Image size={18} />
                Photo / Video
              </button>


              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="public">
                  🌎 Public
                </option>

                <option value="followers">
                  👥 Followers
                </option>
              </select>

            </div>


            <button
              type="submit"
              disabled={posting}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {posting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Post
                </>
              )}

            </button>

          </div>

        </form>

      </div>


      {/* =================================================
          FEED TOOLBAR
      ================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-3">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search posts, people or roles..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>


          {/* FILTER */}

          <div className="relative">

            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <select
              value={feedFilter}
              onChange={(e) =>
                setFeedFilter(e.target.value)
              }
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-9 text-sm text-slate-300 outline-none focus:border-blue-500 sm:w-48"
            >
              <option value="all">
                All Posts
              </option>

              <option value="with-media">
                With Media
              </option>

              <option value="text">
                Text Only
              </option>

              <option value="following">
                Followers Posts
              </option>
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

          </div>


          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefreshFeed}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

        </div>


        {/* FILTER STATUS */}

        {(searchTerm ||
          feedFilter !== "all") && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">

            <span>
              Showing{" "}
              <span className="font-semibold text-slate-300">
                {filteredPosts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-300">
                {posts.length}
              </span>{" "}
              posts
            </span>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFeedFilter("all");
              }}
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>

          </div>
        )}

      </div>


      {/* =================================================
          POSTS
      ================================================== */}

      <div className="mt-5 space-y-5">

        {filteredPosts.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 py-16 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400">
              <Search size={25} />
            </div>

            <h3 className="font-semibold text-white">
              {posts.length === 0
                ? "No posts yet"
                : "No matching posts"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {posts.length === 0
                ? "Be the first person to share something on JobOrbit."
                : "Try another search or filter."}
            </p>

            {hiddenPostIds.length > 0 && (
              <button
                type="button"
                onClick={
                  handleUndoHiddenPosts
                }
                className="mt-4 rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-600/10"
              >
                Restore hidden posts
              </button>
            )}

          </div>

        ) : (

          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onHide={handleHidePost}
            />
          ))

        )}

      </div>

    </section>


    {/* =====================================================
        RIGHT SIDEBAR
    ====================================================== */}

    <aside className="hidden lg:block">

      <div className="sticky top-24 space-y-5">

        {/* PROFILE CARD */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <User size={22} />
            </div>

            <div className="min-w-0">

              <p className="truncate font-semibold text-white">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs capitalize text-slate-500">
                {user?.role || "student"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-4 w-full rounded-xl border border-blue-600/40 bg-blue-600/10 py-2.5 text-sm font-semibold text-blue-400 transition hover:bg-blue-600/20"
          >
            View Dashboard
          </button>

        </div>


        {/* NETWORK */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-2">

            <Users
              size={18}
              className="text-blue-400"
            />

            <h3 className="font-semibold text-white">
              Grow your network
            </h3>

          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Follow students, companies,
            colleges and training institutes
            to discover new opportunities.
          </p>

          <button
            type="button"
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            <UserPlus size={17} />
            Explore Network
          </button>

        </div>


        {/* TRENDING */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex items-center gap-2">

            <TrendingUp
              size={18}
              className="text-blue-400"
            />

            <h3 className="font-semibold text-white">
              Trending on JobOrbit
            </h3>

          </div>

          <div className="mt-4 space-y-2">

            {[
              "#WebDevelopment",
              "#Internship",
              "#JavaScript",
              "#MCAJobs",
              "#CareerGrowth",
            ].map((tag) => (

              <button
                key={tag}
                type="button"
                onClick={() =>
                  setSearchTerm(
                    tag.replace("#", "")
                  )
                }
                className="block rounded-lg px-2 py-1 text-sm font-medium text-blue-400 transition hover:bg-blue-600/10 hover:text-blue-300"
              >
                {tag}
              </button>

            ))}

          </div>

        </div>


        {/* CAREER CARD */}

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-900 p-5">

          <div className="flex items-center gap-2">

            <Briefcase
              size={18}
              className="text-blue-400"
            />

            <h3 className="font-semibold text-white">
              Career Opportunities
            </h3>

          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Discover jobs, internships and
            training opportunities on JobOrbit.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/jobs")
            }
            className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Explore Jobs
          </button>

        </div>

      </div>

    </aside>

  </div>

</main>

    </div>
  );
}
function PostCard({ post, user, onHide }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [reactionOpen, setReactionOpen] = useState(false);

  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [likeCount, setLikeCount] = useState(
    Number(post?.likesCount || post?.likeCount || 0)
  );
  const [likeLoading, setLikeLoading] = useState(false);

  const [shareCount, setShareCount] = useState(
    Number(post?.sharesCount || post?.shareCount || 0)
  );
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(
    Number(post?.commentsCount || post?.commentCount || 0)
  );
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // ==========================================
  // LOCAL SAVE / REACTION
  // ==========================================

  useEffect(() => {
    if (!post?.id) return;

    try {
      const savedPosts = JSON.parse(
        localStorage.getItem("joborbit_saved_posts") || "[]"
      );

      const reactions = JSON.parse(
        localStorage.getItem("joborbit_reactions") || "{}"
      );

      setSaved(
        Array.isArray(savedPosts) &&
          savedPosts.map(Number).includes(Number(post.id))
      );

      setReaction(reactions?.[String(post.id)] || null);
    } catch (error) {
      console.error("Local Post State Error:", error);
    }
  }, [post?.id]);

  // ==========================================
  // SAVE
  // ==========================================

  const toggleSave = () => {
    try {
      const savedPosts = JSON.parse(
        localStorage.getItem("joborbit_saved_posts") || "[]"
      );

      let updated = savedPosts.map(Number);

      if (updated.includes(Number(post.id))) {
        updated = updated.filter(
          (id) => id !== Number(post.id)
        );
        setSaved(false);
      } else {
        updated.push(Number(post.id));
        setSaved(true);
      }

      localStorage.setItem(
        "joborbit_saved_posts",
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Save Post Error:", error);
    }

    setPostMenuOpen(false);
  };

  // ==========================================
  // REACTION
  // ==========================================

  const handleReaction = async (value) => {
  try {
    // Reaction select किया गया
    if (value) {
      // अगर अभी Like नहीं है तो backend Like भी करो
      if (!liked) {
        await handleLike();
      }

      const reactions = JSON.parse(
        localStorage.getItem("joborbit_reactions") || "{}"
      );

      reactions[String(post.id)] = value;

      localStorage.setItem(
        "joborbit_reactions",
        JSON.stringify(reactions)
      );

      setReaction(value);
      setLiked(true);
    }

    // Reaction remove किया गया
    else {
      // अगर liked है तो backend से Like remove करो
      if (liked) {
        await handleLike();
      }

      const reactions = JSON.parse(
        localStorage.getItem("joborbit_reactions") || "{}"
      );

      delete reactions[String(post.id)];

      localStorage.setItem(
        "joborbit_reactions",
        JSON.stringify(reactions)
      );

      setReaction(null);
      setLiked(false);
    }
  } catch (error) {
    console.error("Reaction Error:", error);
  }

  setReactionOpen(false);
};

    

  // ==========================================
  // REPOST
  // ==========================================

  const handleRepost = () => {
    setReposted((prev) => !prev);
    setPostMenuOpen(false);
  };

  // ==========================================
  // COPY POST LINK
  // ==========================================

  const handleCopyPostLink = async () => {
    const shareUrl =
      `${window.location.origin}/feed#post-${post.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Post link copied!");
    } catch (error) {
      console.error("Copy Link Error:", error);
    }

    setPostMenuOpen(false);
  };

  // ==========================================
  // EDIT / DELETE / REPORT
  // ==========================================

  const handleEditPost = () => {
    setPostMenuOpen(false);
    alert(
      "Edit Post UI is ready. Backend edit API will be connected later."
    );
  };

  const handleDeletePost = () => {
    setPostMenuOpen(false);
    alert(
      "Delete Post UI is ready. Backend delete API will be connected later."
    );
  };

  const handleReportPost = () => {
    setPostMenuOpen(false);
    alert(
      "Report UI is ready. Backend report API will be connected later."
    );
  };

  // ==========================================
  // REPLY
  // ==========================================

  const handleReply = (comment) => {
    setReplyTo(comment.id);
    setReplyText(
      `@${comment.User?.name || "User"} `
    );
  };

  const submitReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !replyTo) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/comments`,
        {
          postId: post.id,
          parentId: replyTo,
          content: replyText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setComments((prev) => [
          ...prev,
          response.data.comment,
        ]);

        setCommentCount((prev) => prev + 1);

        setReplyText("");
        setReplyTo(null);
      }
    } catch (error) {
      console.error("Reply Error:", error);
    }
  };

  // ==========================================
  // FOLLOW STATUS
  // ==========================================

  const loadFollowStatus = async () => {
    if (!post?.userId) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/follows/status/${post.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setFollowing(Boolean(response.data.following));

        setFollowersCount(
          Number(response.data.followersCount || 0)
        );
      }
    } catch (error) {
      console.error("Follow Status Error:", error);
    }
  };

  // ==========================================
  // FOLLOW
  // ==========================================

  const handleFollow = async () => {
    if (!post?.userId || followLoading) return;

    try {
      setFollowLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/follows`,
        {
          followingId: post.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setFollowing(
          response.data.following !== undefined
            ? response.data.following
            : !following
        );

        setFollowersCount((prev) =>
          following
            ? Math.max(0, prev - 1)
            : prev + 1
        );
      }
    } catch (error) {
      console.error("Follow Error:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // ==========================================
  // LIKE STATUS
  // ==========================================

  const loadLikeStatus = async () => {
    if (!post?.id) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/likes/${post.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setLiked(Boolean(response.data.liked));

        setLikeCount(
          Number(response.data.likeCount || 0)
        );
      }
    } catch (error) {
      console.error("Like Status Error:", error);
    }
  };

  // ==========================================
  // LIKE
  // ==========================================

  const handleLike = async () => {
    if (likeLoading) return;

    try {
      setLikeLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/likes`,
        {
          postId: post.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setLiked(
          response.data.liked !== undefined
            ? response.data.liked
            : !liked
        );

        setLikeCount(
          Number(
            response.data.likeCount ??
              (liked
                ? Math.max(0, likeCount - 1)
                : likeCount + 1)
          )
        );
      }
    } catch (error) {
      console.error("Like Error:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  // ==========================================
  // COMMENTS
  // ==========================================

  const loadComments = async () => {
    if (!post?.id) return;

    try {
      setCommentLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/comments/${post.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setComments(response.data.comments || []);

        setCommentCount(
          (response.data.comments || []).length
        );
      } else if (Array.isArray(response.data)) {
        setComments(response.data);
        setCommentCount(response.data.length);
      }
    } catch (error) {
      console.error("Load Comments Error:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // ==========================================
  // SHARE COUNT
  // ==========================================

  const loadShareCount = async () => {
    if (!post?.id) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/shares/${post.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setShareCount(
          Number(response.data.shareCount || 0)
        );
      }
    } catch (error) {
      console.error("Share Count Error:", error);
    }
  };

  // ==========================================
  // SHARE
  // ==========================================

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/shares`,
        {
          postId: post.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setShareCount(
          Number(
            response.data.shareCount ??
              shareCount + 1
          )
        );
      }
    } catch (error) {
      console.error("Share Error:", error);
    }
  };

  // ==========================================
  // LOAD POST DATA
  // ==========================================

  useEffect(() => {
    if (!post?.id) return;

    loadLikeStatus();
    loadComments();
    loadShareCount();
    loadFollowStatus();
  }, [post?.id]);

  // ==========================================
  // AUTHOR DATA
  // ==========================================

  const author = post?.User;

  const authorName =
    author?.name || "JobOrbit User";

  const authorRole =
    author?.role || "user";

  const mediaUrl = post?.mediaUrl
    ? `${SERVER_URL}${post.mediaUrl}`
    : null;

  const formattedDate =
    post?.createdAt
      ? new Date(
          post.createdAt
        ).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

  // ==========================================
  // SHARE OPTIONS
  // ==========================================

  const handleShareOption = async (type) => {
    const shareUrl =
      `${window.location.origin}` +
      `/feed#post-${post.id}`;

    const shareText =
      "Check out this post on JobOrbit";

    try {
      await handleShare();

      if (
        type === "native" &&
        navigator.share
      ) {
        await navigator.share({
          title: "JobOrbit",
          text: shareText,
          url: shareUrl,
        });
      }

      if (type === "copy") {
        await navigator.clipboard.writeText(
          shareUrl
        );

        alert("Post link copied!");
      }

      if (type === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${shareText}\n${shareUrl}`
          )}`,
          "_blank"
        );
      }

      if (type === "email") {
        window.location.href =
          `mailto:?subject=${encodeURIComponent(
            "JobOrbit Post"
          )}` +
          `&body=${encodeURIComponent(
            `${shareText}\n\n${shareUrl}`
          )}`;
      }

      if (type === "linkedin") {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
      }

      if (type === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
      }

      if (type === "x") {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
      }
    } catch (error) {
      console.error(
        "Share Option Error:",
        error
      );
    } finally {
      setShareMenuOpen(false);
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/10 transition-all duration-300 hover:border-slate-700"
    >
      {/* =====================================
          POST HEADER
      ===================================== */}

      <div className="flex items-start justify-between p-5">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <User size={21} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-white">
                {authorName}
              </p>

              {post?.userId !== user?.id && (
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    following
                      ? "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {followLoading
                    ? "..."
                    : following
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="capitalize">
                {authorRole}
              </span>

              {followersCount > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {followersCount} followers
                  </span>
                </>
              )}

              {formattedDate && (
                <>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </>
              )}

              <span>•</span>
              <Globe2 size={12} />
            </div>
          </div>
        </div>

        {/* POST MENU */}

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setPostMenuOpen(
                (prev) => !prev
              )
            }
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            title="Post options"
          >
            <MoreHorizontal size={20} />
          </button>

          {postMenuOpen && (
            <div className="absolute right-0 top-10 z-[120] w-60 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
              <button
                type="button"
                onClick={toggleSave}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                <Bookmark
                  size={17}
                  fill={
                    saved
                      ? "currentColor"
                      : "none"
                  }
                />
                {saved
                  ? "Remove Saved Post"
                  : "Save Post"}
              </button>

              <button
                type="button"
                onClick={handleRepost}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                <Repeat2 size={17} />
                {reposted
                  ? "Undo Repost"
                  : "Repost"}
              </button>

              <button
                type="button"
                onClick={handleCopyPostLink}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                🔗
                Copy Post Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostMenuOpen(false);
                  onHide?.(post.id);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                <EyeOff size={17} />
                Hide Post
              </button>

              {Number(post?.userId) ===
                Number(user?.id) && (
                <>
                  <div className="my-1 border-t border-slate-800" />

                  <button
                    type="button"
                    onClick={handleEditPost}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Pencil size={17} />
                    Edit Post
                  </button>

                  <button
                    type="button"
                    onClick={handleDeletePost}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={17} />
                    Delete Post
                  </button>
                </>
              )}

              {Number(post?.userId) !==
                Number(user?.id) && (
                <button
                  type="button"
                  onClick={handleReportPost}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Flag size={17} />
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================
          POST CONTENT
      ===================================== */}

      {post?.content && (
        <div className="px-5 pb-4">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-300">
            {post.content
              .split(
                /(#[a-zA-Z0-9_]+)/g
              )
              .map((part, index) =>
                part.startsWith("#") ? (
                  <button
                    key={`${part}-${index}`}
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent(
                          "joborbit-search",
                          {
                            detail:
                              part.slice(1),
                          }
                        )
                      )
                    }
                    className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {part}
                  </button>
                ) : (
                  <span
                    key={`${index}-${part}`}
                  >
                    {part}
                  </span>
                )
              )}
          </p>
        </div>
      )}

      {/* =====================================
          IMAGE
      ===================================== */}

      {mediaUrl &&
        post.mediaType === "image" && (
          <div className="bg-black">
            <div className="group relative">
              <img
                src={mediaUrl}
                alt="Post"
                onClick={() =>
                  setFullscreen(true)
                }
                className="max-h-[600px] w-full cursor-zoom-in object-contain"
              />

              <button
                type="button"
                onClick={() =>
                  setFullscreen(true)
                }
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100"
                title="View fullscreen"
              >
                <Maximize2 size={17} />
              </button>
            </div>
          </div>
        )}

      {/* =====================================
          VIDEO
      ===================================== */}

      {mediaUrl &&
        post.mediaType === "video" && (
          <div className="bg-black">
            <video
              src={mediaUrl}
              controls
              preload="metadata"
              className="max-h-[600px] w-full"
            />
          </div>
        )}

      {/* =====================================
          FULLSCREEN
      ===================================== */}

      {fullscreen && mediaUrl && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 p-4"
          onClick={() =>
            setFullscreen(false)
          }
        >
          <button
            type="button"
            onClick={() =>
              setFullscreen(false)
            }
            className="absolute right-5 top-5 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>

          <img
            src={mediaUrl}
            alt="Fullscreen post"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="max-h-[92vh] max-w-[95vw] object-contain"
          />
        </div>
      )}

      {/* =====================================
          ACTIONS
      ===================================== */}

      <div className="px-5 py-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-500">
          <span>
            {likeCount}{" "}
            {likeCount === 1
              ? "Like"
              : "Likes"}
          </span>

          <span>
            {commentCount} Comments
            {" • "}
            {shareCount} Shares
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-2 sm:grid-cols-5">
          {/* LIKE */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (reaction) {
                  handleReaction(null);
                } else {
                  handleLike();
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setReactionOpen(
                  (prev) => !prev
                );
              }}
              disabled={likeLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                reaction || liked
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-slate-400 hover:bg-slate-800"
              } disabled:opacity-60`}
              title="Click to like. Right-click for reactions."
            >
              <Heart
                size={18}
                fill={
                  reaction || liked
                    ? "currentColor"
                    : "none"
                }
              />
              {reaction ||
                (liked
                  ? "Liked"
                  : "Like")}
            </button>

            {reactionOpen && (
              <div className="absolute bottom-full left-1/2 z-[150] mb-2 flex -translate-x-1/2 gap-1 rounded-full border border-slate-700 bg-slate-900 p-2 shadow-xl">
                {[
                  ["👍", "Like"],
                  ["❤️", "Love"],
                  ["🎉", "Celebrate"],
                  ["💪", "Support"],
                  ["💡", "Interesting"],
                ].map(
                  ([emoji, name]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        handleReaction(
                          name
                        )
                      }
                      title={name}
                      className="rounded-full p-2 text-lg transition hover:scale-125 hover:bg-slate-800"
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* COMMENT */}

          <button
            type="button"
            onClick={() => {
              const nextState =
                !commentOpen;

              setCommentOpen(
                nextState
              );

              if (nextState) {
                loadComments();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <MessageCircle size={18} />
            Comment
          </button>

          {/* SHARE */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShareMenuOpen(
                  (prev) => !prev
                )
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <Share2 size={18} />
              Share
            </button>

            {shareMenuOpen && (
              <div className="absolute bottom-full left-1/2 z-[100] mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                {typeof navigator !==
                  "undefined" &&
                  navigator.share && (
                    <button
                      type="button"
                      onClick={() =>
                        handleShareOption(
                          "native"
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      📱 Share via device
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() =>
                    handleShareOption(
                      "whatsapp"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  💬 WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleShareOption(
                      "copy"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  📋 Copy Link
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleShareOption(
                      "email"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  ✉️ Email
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleShareOption(
                      "linkedin"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  🔗 LinkedIn
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleShareOption(
                      "facebook"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  📘 Facebook
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleShareOption("x")
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  𝕏 X (Twitter)
                </button>
              </div>
            )}
          </div>

          {/* SAVE */}

          <button
            type="button"
            onClick={toggleSave}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              saved
                ? "text-blue-400 hover:bg-blue-500/10"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Bookmark
              size={18}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />
            {saved ? "Saved" : "Save"}
          </button>

          {/* REPOST */}

          <button
            type="button"
            onClick={handleRepost}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              reposted
                ? "text-green-400 hover:bg-green-500/10"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Repeat2 size={18} />
            {reposted
              ? "Reposted"
              : "Repost"}
          </button>
        </div>
      </div>

      {/* =====================================
          COMMENTS
      ===================================== */}

      {commentOpen && (
        <div className="border-t border-slate-800 px-5 py-4">
          {/* COMMENT INPUT */}

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!commentText.trim()) {
                return;
              }

              try {
                setCommentSubmitting(
                  true
                );

                const token =
                  localStorage.getItem(
                    "token"
                  );

                const response =
                  await axios.post(
                    `${API_URL}/comments`,
                    {
                      postId:
                        post.id,
                      content:
                        commentText.trim(),
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                if (
                  response.data
                    .success
                ) {
                  setComments(
                    (prev) => [
                      ...prev,
                      response.data
                        .comment,
                    ]
                  );

                  setCommentCount(
                    (prev) =>
                      prev + 1
                  );

                  setCommentText("");
                }
              } catch (error) {
                console.error(
                  "Add Comment Error:",
                  error
                );
              } finally {
                setCommentSubmitting(
                  false
                );
              }
            }}
            className="flex gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <User size={17} />
            </div>

            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
                }
                placeholder="Write a comment..."
                className="min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                disabled={
                  commentSubmitting ||
                  !commentText.trim()
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Send Comment"
              >
                {commentSubmitting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>

          {/* COMMENTS LIST */}

          <div className="mt-4 space-y-3">
            {commentLoading ? (
              <div className="flex items-center justify-center py-3 text-sm text-slate-500">
                <Loader2
                  size={17}
                  className="mr-2 animate-spin"
                />
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <p className="py-2 text-center text-sm text-slate-500">
                No comments yet.
              </p>
            ) : (
              comments.map(
                (comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                      <User size={17} />
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2">
                      <p className="text-sm font-semibold text-white">
                        {comment.User
                          ?.name ||
                          "User"}
                      </p>

                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-300">
                        {comment.content}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        {comment.createdAt
                          ? new Date(
                              comment.createdAt
                            ).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute:
                                  "2-digit",
                              }
                            )
                          : ""}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleReply(
                            comment
                          )
                        }
                        className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                      >
                        <Reply size={12} />
                        Reply
                      </button>

                      {replyTo ===
                        comment.id && (
                        <form
                          onSubmit={
                            submitReply
                          }
                          className="mt-2 flex gap-2"
                        >
                          <input
                            value={
                              replyText
                            }
                            onChange={(
                              e
                            ) =>
                              setReplyText(
                                e.target
                                  .value
                              )
                            }
                            autoFocus
                            placeholder="Write a reply..."
                            className="min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                          />

                          <button
                            type="submit"
                            className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default Feed;