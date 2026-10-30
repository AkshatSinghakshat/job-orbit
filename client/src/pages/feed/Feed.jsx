import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FeedNavbar from "./FeedNavbar";

import {
  Image,
  Send,
  Loader2,
  User,
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
  UserPlus,
  Sparkles,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

// Helper for formatting media URLs (handles both Cloudinary/S3 and Local uploads)
const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

function Feed() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // User State
  const [user, setUser] = useState(null);

  // Create Post States
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);

  // Feed States
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Search / Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [feedFilter, setFeedFilter] = useState("all");
  const [hiddenPostIds, setHiddenPostIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingPostId, setPendingPostId] = useState(null);

  // Load User, Feed & Saved Preferences
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user data:", err);
        localStorage.removeItem("user");
      }
    }

    try {
      const savedHidden = JSON.parse(
        localStorage.getItem("joborbit_hidden_posts") || "[]"
      );
      setHiddenPostIds(Array.isArray(savedHidden) ? savedHidden.map(Number) : []);
    } catch (err) {
      console.error("Hidden posts load error:", err);
    }

    fetchFeed();
    fetchUnreadCount();
    fetchNotifications();
  }, [navigate]);

  // Clean-up blob preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Read URL query params: /feed?post=123
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = Number(params.get("post"));
    if (postId) {
      setPendingPostId(postId);
    }
  }, []);

  // Hashtag Search Global Event
  useEffect(() => {
    const handleJobOrbitSearch = (event) => {
      setSearchTerm(String(event.detail || ""));
      setFeedFilter("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("joborbit-search", handleJobOrbitSearch);
    return () => window.removeEventListener("joborbit-search", handleJobOrbitSearch);
  }, []);

  // Fetch Feed API
  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await axios.get(`${API_URL}/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setPosts(response.data.posts || []);
      }
    } catch (err) {
      console.error("Feed Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }
      setError(err.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error("Fetch Notifications Error:", err.response?.data || err.message);
    }
  };

  // Fetch Unread Count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setUnreadCount(Number(response.data.count) || 0);
      }
    } catch (err) {
      console.error("Unread Count Error:", err.response?.data || err.message);
    }
  };

  // Polling for Notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (notificationOpen) {
        fetchNotifications();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [notificationOpen]);

  // Handle Media File Selection
  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
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

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    if (preview) URL.revokeObjectURL(preview);

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (preview) URL.revokeObjectURL(preview);
    setMedia(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) {
      setError("Write something or upload a photo/video.");
      return;
    }

    try {
      setPosting(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("visibility", visibility);
      if (media) formData.append("media", media);

      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        const newPost = response.data.post;
        // Ensure post has User object so UI renders smoothly
        if (!newPost.User && user) {
          newPost.User = user;
        }
        setPosts((prev) => [newPost, ...prev]);
        setContent("");
        setVisibility("public");
        removeMedia();
      }
    } catch (err) {
      console.error("Create Post Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const handleRefreshFeed = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const handleHidePost = (postId) => {
    const next = [...new Set([...hiddenPostIds, Number(postId)])];
    setHiddenPostIds(next);
    localStorage.setItem("joborbit_hidden_posts", JSON.stringify(next));
  };

  const handleUndoHiddenPosts = () => {
    setHiddenPostIds([]);
    localStorage.removeItem("joborbit_hidden_posts");
  };

  // Filter Posts
  const filteredPosts = posts.filter((post) => {
    if (hiddenPostIds.includes(Number(post.id))) return false;

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      const postContent = post?.content?.toLowerCase() || "";
      const author = post?.User?.name?.toLowerCase() || "";
      const role = post?.User?.role?.toLowerCase() || "";

      if (!postContent.includes(query) && !author.includes(query) && !role.includes(query)) {
        return false;
      }
    }

    if (feedFilter === "with-media") return Boolean(post?.mediaUrl);
    if (feedFilter === "text") return !post?.mediaUrl;
    if (feedFilter === "following") return post?.visibility === "followers";

    return true;
  });

  // Navigate to Dashboard according to role
  const goToDashboard = () => {
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem("user") || "null");
      } catch (err) {
        console.error("Unable to read user:", err);
      }
    }

    const storedRole = localStorage.getItem("role");
    const role = String(currentUser?.role || currentUser?.userType || storedRole || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const dashboardPaths = {
      student: "/student/dashboard",
      company: "/company/dashboard",
      employer: "/company/dashboard",
      training: "/training-institute/dashboard",
      "training-institute": "/training-institute/dashboard",
      training_institute: "/training-institute/dashboard",
      admin: "/developer/dashboard",
      developer: "/developer/dashboard",
    };

    const dashboardPath = dashboardPaths[role];
    if (dashboardPath) {
      navigate(dashboardPath);
    } else {
      navigate("/student/dashboard");
    }
  };

  // Scroll to targeted post if coming from notification or deep link
  useEffect(() => {
    if (!pendingPostId) return;

    let attempts = 0;
    const findAndScroll = () => {
      const el = document.getElementById(`post-${pendingPostId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-blue-500", "ring-offset-4", "ring-offset-slate-950");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-blue-500", "ring-offset-4", "ring-offset-slate-950");
        }, 3000);
        setPendingPostId(null);
        return;
      }

      attempts++;
      if (attempts < 20) {
        setTimeout(findAndScroll, 200);
      } else {
        setPendingPostId(null);
      }
    };

    findAndScroll();
  }, [pendingPostId, posts]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
          <div>
            <p className="font-semibold">Loading JobOrbit</p>
            <p className="text-sm text-slate-400">Preparing your feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <FeedNavbar />

      <main className="mx-auto w-full max-w-[1600px] px-2 py-4 sm:px-5 sm:py-5 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[190px_minmax(0,1fr)_230px] xl:grid-cols-[220px_minmax(0,1fr)_260px]">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <User size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{user?.name || "User"}</p>
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
                  onClick={() => navigate("/feed")}
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
                  onClick={() => navigate("/jobs")}
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
                  onClick={() => navigate("/notifications")}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <Bell size={19} />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
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
                  <Sparkles size={18} className="text-blue-400" />
                  <h3 className="font-semibold text-white">JobOrbit</h3>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Build your professional network, discover jobs and grow your career.
                </p>
              </div>
            </div>
          </aside>

          {/* CENTER FEED */}
          <section className="min-w-0">
            {/* CREATE POST */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <User size={21} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{user?.name || "User"}</p>
                  <p className="text-xs capitalize text-slate-500">{user?.role || "student"}</p>
                </div>
              </div>

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
                      <video src={preview} controls className="max-h-[450px] w-full" />
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
                        prev.includes("📊 Poll:") ? prev : `${prev}${prev ? "\n\n" : ""}📊 Poll: `
                      )
                    }
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                  >
                    📊 Add Poll
                  </button>

                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev}${prev ? " " : ""}#`)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                  >
                    # Hashtag
                  </button>

                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev}${prev ? " " : ""}@`)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                  >
                    @ Mention
                  </button>

                  <button
                    type="button"
                    onClick={() => setContent((prev) => `${prev}${prev ? " " : ""}😊`)}
                    className="flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                  >
                    <Smile size={14} />
                    Emoji
                  </button>
                </div>

                {/* POST ACTIONS */}
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
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-green-400 transition hover:bg-green-500/10"
                    >
                      <Image size={18} />
                      Photo / Video
                    </button>

                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
                    >
                      <option value="public">🌎 Public</option>
                      <option value="followers">👥 Followers</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={posting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {posting ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
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

            {/* FEED TOOLBAR */}
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search posts, people or roles..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <select
                    value={feedFilter}
                    onChange={(e) => setFeedFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-9 text-sm text-slate-300 outline-none focus:border-blue-500 sm:w-48"
                  >
                    <option value="all">All Posts</option>
                    <option value="with-media">With Media</option>
                    <option value="text">Text Only</option>
                    <option value="following">Followers Posts</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRefreshFeed}
                  disabled={refreshing}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  title="Refresh feed"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {(searchTerm || feedFilter !== "all") && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
                  <span>
                    Showing <span className="font-semibold text-slate-300">{filteredPosts.length}</span> of{" "}
                    <span className="font-semibold text-slate-300">{posts.length}</span> posts
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

            {/* POSTS LIST */}
            <div className="mt-5 space-y-5">
              {filteredPosts.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400">
                    <Search size={25} />
                  </div>
                  <h3 className="font-semibold text-white">
                    {posts.length === 0 ? "No posts yet" : "No matching posts"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {posts.length === 0
                      ? "Be the first person to share something on JobOrbit."
                      : "Try another search or filter."}
                  </p>
                  {hiddenPostIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUndoHiddenPosts}
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

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <User size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{user?.name || "User"}</p>
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

              {/* NETWORK CARD */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-400" />
                  <h3 className="font-semibold text-white">Grow your network</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Follow students, companies, colleges and training institutes to discover new opportunities.
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
                  <TrendingUp size={18} className="text-blue-400" />
                  <h3 className="font-semibold text-white">Trending on JobOrbit</h3>
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
                      onClick={() => setSearchTerm(tag.replace("#", ""))}
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
                  <Briefcase size={18} className="text-blue-400" />
                  <h3 className="font-semibold text-white">Career Opportunities</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Discover jobs, internships and training opportunities on JobOrbit.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
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
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
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

  // References for outside click dismissal
  const postMenuRef = useRef(null);
  const shareMenuRef = useRef(null);
  const reactionMenuRef = useRef(null);
  const moreActionsRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target)) {
        setPostMenuOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShareMenuOpen(false);
      }
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(e.target)) {
        setReactionOpen(false);
      }
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target)) {
        setMoreActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Sync Saved & Reaction states from LocalStorage
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
        Array.isArray(savedPosts) && savedPosts.map(Number).includes(Number(post.id))
      );
      setReaction(reactions?.[String(post.id)] || null);
    } catch (err) {
      console.error("Local Post State Error:", err);
    }
  }, [post?.id]);

  // Toggle Save Post
  const toggleSave = () => {
    try {
      const savedPosts = JSON.parse(
        localStorage.getItem("joborbit_saved_posts") || "[]"
      );
      let updated = savedPosts.map(Number);

      if (updated.includes(Number(post.id))) {
        updated = updated.filter((id) => id !== Number(post.id));
        setSaved(false);
      } else {
        updated.push(Number(post.id));
        setSaved(true);
      }

      localStorage.setItem("joborbit_saved_posts", JSON.stringify(updated));
    } catch (err) {
      console.error("Save Post Error:", err);
    }
    setPostMenuOpen(false);
  };

  // Like or Unlike Request
  const handleLike = async () => {
    if (likeLoading) return;
    try {
      setLikeLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/likes`,
        { postId: post.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const isNowLiked =
          response.data.liked !== undefined ? response.data.liked : !liked;
        setLiked(isNowLiked);

        if (!isNowLiked) {
          // Remove emoji reaction if user unlikes
          setReaction(null);
          const reactions = JSON.parse(
            localStorage.getItem("joborbit_reactions") || "{}"
          );
          delete reactions[String(post.id)];
          localStorage.setItem("joborbit_reactions", JSON.stringify(reactions));
        }

        setLikeCount(
          Number(
            response.data.likeCount ??
              (isNowLiked ? likeCount + 1 : Math.max(0, likeCount - 1))
          )
        );
      }
    } catch (err) {
      console.error("Like Error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  // Reactions Handler
  const handleReaction = async (value) => {
    try {
      const reactions = JSON.parse(
        localStorage.getItem("joborbit_reactions") || "{}"
      );

      if (value) {
        if (!liked) {
          await handleLike();
        }
        reactions[String(post.id)] = value;
        localStorage.setItem("joborbit_reactions", JSON.stringify(reactions));
        setReaction(value);
        setLiked(true);
      } else {
        if (liked) {
          await handleLike();
        }
        delete reactions[String(post.id)];
        localStorage.setItem("joborbit_reactions", JSON.stringify(reactions));
        setReaction(null);
        setLiked(false);
      }
    } catch (err) {
      console.error("Reaction Error:", err);
    }
    setReactionOpen(false);
  };

  const handleRepost = () => {
    setReposted((prev) => !prev);
    setPostMenuOpen(false);
  };

  const handleCopyPostLink = async () => {
    const shareUrl = `${window.location.origin}/feed?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Post link copied!");
    } catch (err) {
      console.error("Copy Link Error:", err);
    }
    setPostMenuOpen(false);
  };

  // Comments Loading
  const loadComments = async () => {
    if (!post?.id) return;
    try {
      setCommentLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/comments/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setComments(response.data.comments || []);
        setCommentCount((response.data.comments || []).length);
      } else if (Array.isArray(response.data)) {
        setComments(response.data);
        setCommentCount(response.data.length);
      }
    } catch (err) {
      console.error("Load Comments Error:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Reply submission
  const handleReply = (comment) => {
    setReplyTo(comment.id);
    setReplyText(`@${comment.User?.name || "User"} `);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const newReply = response.data.comment;
        if (!newReply.User && user) newReply.User = user;

        setComments((prev) => [...prev, newReply]);
        setCommentCount((prev) => prev + 1);
        setReplyText("");
        setReplyTo(null);
      }
    } catch (err) {
      console.error("Reply Error:", err);
    }
  };

  // Follow Status
  const loadFollowStatus = async () => {
    if (!post?.userId || post.userId === user?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/follows/status/${post.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setFollowing(Boolean(response.data.following));
        setFollowersCount(Number(response.data.followersCount || 0));
      }
    } catch (err) {
      console.error("Follow Status Error:", err);
    }
  };

  const handleFollow = async () => {
    if (!post?.userId || followLoading) return;
    try {
      setFollowLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/follows`,
        { followingId: post.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const nextFollowing =
          response.data.following !== undefined ? response.data.following : !following;
        setFollowing(nextFollowing);
        setFollowersCount((prev) =>
          nextFollowing ? prev + 1 : Math.max(0, prev - 1)
        );
      }
    } catch (err) {
      console.error("Follow Error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Like Status
  const loadLikeStatus = async () => {
    if (!post?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/likes/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setLiked(Boolean(response.data.liked));
        setLikeCount(Number(response.data.likeCount || 0));
      }
    } catch (err) {
      console.error("Like Status Error:", err);
    }
  };

  // Share Count & Share Request
  const loadShareCount = async () => {
    if (!post?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/shares/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setShareCount(Number(response.data.shareCount || 0));
      }
    } catch (err) {
      console.error("Share Count Error:", err);
    }
  };

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/shares`,
        { postId: post.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setShareCount(
          Number(response.data.shareCount ?? shareCount + 1)
        );
      }
    } catch (err) {
      console.error("Share Error:", err);
    }
  };

  const handleShareOption = async (type) => {
    const shareUrl = `${window.location.origin}/feed?post=${post.id}`;
    const shareText = "Check out this post on JobOrbit";

    try {
      await handleShare();

      if (type === "native" && typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "JobOrbit",
          text: shareText,
          url: shareUrl,
        });
      } else if (type === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        alert("Post link copied!");
      } else if (type === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, "_blank");
      } else if (type === "email") {
        window.location.href = `mailto:?subject=${encodeURIComponent("JobOrbit Post")}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
      } else if (type === "linkedin") {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
      } else if (type === "facebook") {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
      } else if (type === "x") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
      }
    } catch (err) {
      console.error("Share Option Error:", err);
    } finally {
      setShareMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!post?.id) return;
    loadLikeStatus();
    loadComments();
    loadShareCount();
    loadFollowStatus();
  }, [post?.id]);

  const author = post?.User;
  const authorName = author?.name || "JobOrbit User";
  const authorRole = author?.role || "user";
  const mediaUrl = getMediaUrl(post?.mediaUrl);

  // Check if media is video by mediaType or URL extension
  const isVideo =
    post?.mediaType === "video" ||
    (mediaUrl && /\.(mp4|webm|mov|ogg)$/i.test(mediaUrl));

  const formattedDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <article
      id={`post-${post.id}`}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/10 transition-all duration-300 hover:border-slate-700"
    >
      {/* POST HEADER */}
      <div className="flex items-start justify-between p-5">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <User size={21} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-white">{authorName}</p>

              {user && post?.userId !== user?.id && (
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
                  {followLoading ? "..." : following ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="capitalize">{authorRole}</span>
              {followersCount > 0 && (
                <>
                  <span>•</span>
                  <span>{followersCount} followers</span>
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
        <div className="relative" ref={postMenuRef}>
          <button
            type="button"
            onClick={() => setPostMenuOpen((prev) => !prev)}
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
                <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                {saved ? "Remove Saved Post" : "Save Post"}
              </button>

              <button
                type="button"
                onClick={handleRepost}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                <Repeat2 size={17} />
                {reposted ? "Undo Repost" : "Repost"}
              </button>

              <button
                type="button"
                onClick={handleCopyPostLink}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                🔗 Copy Post Link
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

              {Number(post?.userId) === Number(user?.id) ? (
                <>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setPostMenuOpen(false);
                      alert("Edit Post feature coming soon!");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Pencil size={17} />
                    Edit Post
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPostMenuOpen(false);
                      alert("Delete Post feature coming soon!");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={17} />
                    Delete Post
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPostMenuOpen(false);
                    alert("Report Post submitted.");
                  }}
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

      {/* POST CONTENT */}
      {post?.content && (
        <div className="px-5 pb-4">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-300">
            {post.content.split(/(#[a-zA-Z0-9_]+)/g).map((part, index) =>
              part.startsWith("#") ? (
                <button
                  key={`${part}-${index}`}
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("joborbit-search", {
                        detail: part.slice(1),
                      })
                    )
                  }
                  className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {part}
                </button>
              ) : (
                <span key={`${index}-${part}`}>{part}</span>
              )
            )}
          </p>
        </div>
      )}

      {/* MEDIA (IMAGE OR VIDEO) */}
      {mediaUrl && (
        <div className="bg-black">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              preload="metadata"
              className="mx-auto max-h-[460px] w-full"
            />
          ) : (
            <div className="group relative">
              <img
                src={mediaUrl}
                alt="Post"
                onClick={() => setFullscreen(true)}
                className="mx-auto max-h-[460px] w-full cursor-zoom-in object-contain"
              />
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100"
                title="View fullscreen"
              >
                <Maximize2 size={17} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN PREVIEW */}
      {fullscreen && mediaUrl && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-5 top-5 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <img
            src={mediaUrl}
            alt="Fullscreen post"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] max-w-[95vw] object-contain"
          />
        </div>
      )}

      {/* ACTIONS ROW */}
      <div className="min-w-0 px-3 py-3 sm:px-4 lg:px-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-800 pb-3 text-xs text-slate-500">
          <span>
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
          <span>
            {commentCount} Comments • {shareCount} Shares
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-4 gap-1 pt-2 sm:grid-cols-5">
          {/* LIKE / REACTION */}
          <div className="relative" ref={reactionMenuRef}>
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
                setReactionOpen((prev) => !prev);
              }}
              disabled={likeLoading}
              className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 text-xs font-medium transition ${
                reaction || liked
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-slate-400 hover:bg-slate-800"
              } disabled:opacity-60`}
              title="Click to like. Right click for emoji reactions."
            >
              <Heart
                size={18}
                fill={reaction || liked ? "currentColor" : "none"}
              />
              {reaction || (liked ? "Liked" : "Like")}
            </button>

            {reactionOpen && (
              <div className="absolute bottom-full left-1/2 z-[150] mb-2 flex -translate-x-1/2 gap-1 rounded-full border border-slate-700 bg-slate-900 p-2 shadow-xl">
                {[
                  ["👍", "Like"],
                  ["❤️", "Love"],
                  ["🎉", "Celebrate"],
                  ["💪", "Support"],
                  ["💡", "Interesting"],
                ].map(([emoji, name]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleReaction(name)}
                    title={name}
                    className="rounded-full p-2 text-lg transition hover:scale-125 hover:bg-slate-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COMMENT */}
          <button
            type="button"
            onClick={() => {
              const nextState = !commentOpen;
              setCommentOpen(nextState);
              if (nextState) loadComments();
            }}
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white sm:text-sm"
          >
            <MessageCircle size={18} />
            Comment
          </button>

          {/* SHARE */}
          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setShareMenuOpen((prev) => !prev)}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white sm:text-sm"
            >
              <Share2 size={18} />
              Share
            </button>

            {shareMenuOpen && (
              <div className="absolute bottom-full left-1/2 z-[100] mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    type="button"
                    onClick={() => handleShareOption("native")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    📱 Share via device
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleShareOption("whatsapp")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleShareOption("copy")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  📋 Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => handleShareOption("linkedin")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  🔗 LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => handleShareOption("facebook")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  📘 Facebook
                </button>
                <button
                  type="button"
                  onClick={() => handleShareOption("x")}
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
            className={`hidden items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 text-xs font-medium transition sm:flex ${
              saved
                ? "text-blue-400 hover:bg-blue-500/10"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>

          {/* REPOST */}
          <button
            type="button"
            onClick={handleRepost}
            className={`hidden items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 text-xs font-medium transition sm:flex ${
              reposted
                ? "text-green-400 hover:bg-green-500/10"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Repeat2 size={18} />
            {reposted ? "Reposted" : "Repost"}
          </button>

          {/* MOBILE MORE MENU */}
          <div className="relative sm:hidden" ref={moreActionsRef}>
            <button
              type="button"
              onClick={() => setMoreActionsOpen((open) => !open)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <MoreHorizontal size={19} />
              More
            </button>
            {moreActionsOpen && (
              <div className="absolute bottom-full right-0 z-[120] mb-2 w-40 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    toggleSave();
                    setMoreActionsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-slate-800 ${
                    saved ? "text-blue-400" : "text-slate-300"
                  }`}
                >
                  <Bookmark size={17} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRepost();
                    setMoreActionsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-slate-800 ${
                    reposted ? "text-green-400" : "text-slate-300"
                  }`}
                >
                  <Repeat2 size={17} />
                  {reposted ? "Reposted" : "Repost"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      {commentOpen && (
        <div className="border-t border-slate-800 px-5 py-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!commentText.trim()) return;

              try {
                setCommentSubmitting(true);
                const token = localStorage.getItem("token");

                const response = await axios.post(
                  `${API_URL}/comments`,
                  {
                    postId: post.id,
                    content: commentText.trim(),
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data?.success) {
                  const newComment = response.data.comment;
                  if (!newComment.User && user) newComment.User = user;

                  setComments((prev) => [...prev, newComment]);
                  setCommentCount((prev) => prev + 1);
                  setCommentText("");
                }
              } catch (err) {
                console.error("Add Comment Error:", err);
              } finally {
                setCommentSubmitting(false);
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
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Send Comment"
              >
                {commentSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
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
                <Loader2 size={17} className="mr-2 animate-spin" />
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <p className="py-2 text-center text-sm text-slate-500">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                    <User size={17} />
                  </div>

                  <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-800 px-4 py-2">
                    <p className="text-sm font-semibold text-white">
                      {comment.User?.name || "User"}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-300">
                      {comment.content}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleReply(comment)}
                      className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <Reply size={12} />
                      Reply
                    </button>

                    {replyTo === comment.id && (
                      <form onSubmit={submitReply} className="mt-2 flex gap-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
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
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default Feed;