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
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

function Feed() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD USER + FEED
  // ==========================================

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
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
      }
    }

    fetchFeed();
  }, []);

  // ==========================================
  // FETCH FEED
  // ==========================================

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await axios.get(
        `${API_URL}/posts/feed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error("Feed Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

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
  // MEDIA SELECT
  // ==========================================

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

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
      setError(
        "Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV files are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50 MB.");

      e.target.value = "";
      return;
    }

    setError("");

    setMedia(file);

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
  };

  // ==========================================
  // REMOVE MEDIA
  // ==========================================

  const removeMedia = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setMedia(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // CREATE POST
  // ==========================================

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      setError(
        "Write something or upload a photo/video."
      );

      return;
    }

    try {
      setPosting(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const formData = new FormData();

      formData.append(
        "content",
        content.trim()
      );

      formData.append(
        "visibility",
        visibility
      );

      if (media) {
        formData.append("media", media);
      }

      const response = await axios.post(
        `${API_URL}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const newPost = response.data.post;

        setPosts((prev) => [
          newPost,
          ...prev,
        ]);

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
        error.response?.data?.message ||
          error.message ||
          "Failed to create post"
      );
    } finally {
      setPosting(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />

          <span className="font-medium">
            Loading JobOrbit Feed...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ======================================
          HEADER
      ======================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

          {/* LOGO */}

          <div
            className="cursor-pointer"
            onClick={() => navigate("/feed")}
          >
            <h1 className="text-2xl font-bold text-blue-600">
              JobOrbit
            </h1>

            <p className="text-xs text-slate-500">
              Career • Jobs • Network
            </p>
          </div>


{/* USER */}

<div className="flex items-center gap-3">

  {/* PROFILE / DASHBOARD */}
  <button
    type="button"
    onClick={() => navigate("/student/dashboard")}
    className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
    title="Open Dashboard"
  >
    <div className="hidden text-right sm:block">
      <p className="text-sm font-semibold text-slate-800">
        {user?.name || "User"}
      </p>

      <p className="text-xs capitalize text-slate-500">
        {user?.role || "user"}
      </p>
    </div>

    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
      <User size={20} />
    </div>
  </button>

  {/* LOGOUT */}
  <button
    type="button"
    onClick={handleLogout}
    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
    title="Logout"
  >
    <LogOut size={19} />
  </button>

</div>
        </div>

      </header>

      {/* ======================================
          MAIN
      ======================================= */}

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,650px)_260px]">

        {/* ====================================
            LEFT SIDEBAR
        ===================================== */}

        <aside className="hidden lg:block">

          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4">

            <button
              onClick={() => navigate("/feed")}
              className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-3 text-left font-medium text-blue-600"
            >
              <Home size={19} />
              Feed
            </button>

            <button
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-slate-600 transition hover:bg-slate-50"
            >
              <Users size={19} />
              My Network
            </button>

            <button
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-slate-600 transition hover:bg-slate-50"
            >
              <BriefcaseBusiness size={19} />
              Dashboard
            </button>

          </div>

        </aside>

        {/* ====================================
            CENTER FEED
        ===================================== */}

        <section>

          {/* ==================================
              CREATE POST
          =================================== */}

          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <div className="mb-4 flex gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <User size={21} />
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>

                <p className="text-xs capitalize text-slate-500">
                  {user?.role || "user"}
                </p>

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
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {/* MEDIA PREVIEW */}

              {preview && media && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-black">

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
                    className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-sm text-white transition hover:bg-black"
                  >
                    <X size={15} />
                    Remove
                  </button>

                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* POST OPTIONS */}

              <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

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
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
                  >
                    <Image size={18} />
                    Photo / Video
                  </button>

                  <select
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500"
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
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* ==================================
              FEED
          =================================== */}

          <div className="mt-5 space-y-5">

            {posts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Users size={25} />
                </div>

                <h3 className="font-semibold text-slate-800">
                  No posts yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Be the first person to share
                  something on JobOrbit.
                </p>

              </div>
            ) : (
              posts.map((post) => (
               <PostCard
  key={post.id}
  post={post}
  user={user}
/>
              ))
            )}

          </div>

        </section>

        {/* ====================================
            RIGHT SIDEBAR
        ===================================== */}

        <aside className="hidden lg:block">

          <div className="sticky top-24 space-y-5">

            {/* PROFILE CARD */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User size={23} />
                </div>

                <div>

                  <p className="font-semibold text-slate-800">
                    {user?.name || "User"}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {user?.role || "user"}
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate("/student/dashboard")
                }
                className="mt-4 w-full rounded-lg border border-blue-600 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                View Profile
              </button>

            </div>

            {/* NETWORK CARD */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">

              <h3 className="font-semibold text-slate-800">
                Grow your network
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Follow students, companies,
                colleges and training institutes
                to discover new opportunities.
              </p>

              <button
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Users size={17} />
                Explore Network
              </button>

            </div>

          </div>

        </aside>

      </main>

    </div>
  );
}
// ==========================================
// POST CARD
// ==========================================

function PostCard({ post, user }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareCount, setShareCount] = useState(0);
const [shareLoading, setShareLoading] = useState(false);
const [shareMenuOpen, setShareMenuOpen] = useState(false);
const [following, setFollowing] = useState(false);
const [followersCount, setFollowersCount] = useState(0);
const [followLoading, setFollowLoading] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const author = post?.User;


const loadFollowStatus = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token || !post?.userId) return;

    const response = await axios.get(
      `${API_URL}/follows/status/${post.userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setFollowing(response.data.following);
      setFollowersCount(response.data.followersCount);
    }
  } catch (error) {
    console.error("Load Follow Status Error:", error);
  }
};

// follow and undollow function

const handleFollow = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token || !post?.userId) return;

    setFollowLoading(true);

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

    if (response.data.success) {
      setFollowing(response.data.following);
      setFollowersCount(response.data.followersCount);
    }
  } catch (error) {
    console.error("Follow Error:", error);
  } finally {
    setFollowLoading(false);
  }
};


  // ==========================================
  // LOAD LIKE STATUS
  // ==========================================

  const loadLikeStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !post?.id) return;

      const response = await axios.get(
        `${API_URL}/likes/${post.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setLiked(Boolean(response.data.liked));
        setLikeCount(Number(response.data.likeCount) || 0);
      }
    } catch (error) {
      console.error("Load Like Status Error:", error);
    }
  };

  
  // ==========================================
  // LIKE / UNLIKE
  // ==========================================

  const handleLike = async () => {
    if (likeLoading || !post?.id) return;

    try {
      setLikeLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Authentication token not found");
        return;
      }

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

      if (response.data.success) {
        setLiked(Boolean(response.data.liked));
        setLikeCount(Number(response.data.likeCount) || 0);
      }
    } catch (error) {
      console.error(
        "Like Error:",
        error.response?.data || error.message
      );
    } finally {
      setLikeLoading(false);
    }
  };

  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  const loadComments = async () => {
    try {
      setCommentLoading(true);

      const token = localStorage.getItem("token");

      if (!token || !post?.id) return;

      const response = await axios.get(
        `${API_URL}/comments/${post.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    if (response.data.success) {
  const loadedComments = response.data.comments || [];

  setComments(loadedComments);
  setCommentCount(loadedComments.length);
}
    } catch (error) {
      console.error(
        "Load Comments Error:",
        error.response?.data || error.message
      );
    } finally {
      setCommentLoading(false);
    }
  };

  // ==========================================
  // LOAD LIKE STATUS WHEN POST LOADS
  // ==========================================

useEffect(() => {
  if (post?.id) {
    loadLikeStatus();
    loadComments();
    loadShareCount();
    loadFollowStatus();
  }
}, [post?.id]);
  // ==========================================
  // AUTHOR
  // ==========================================

  const authorName =
    author?.name || "JobOrbit User";

  const authorRole =
    author?.role || "user";

  // ==========================================
  // MEDIA
  // ==========================================

  const mediaUrl = post?.mediaUrl
    ? `${SERVER_URL}${post.mediaUrl}`
    : null;

    // ==========================================
// LOAD SHARE COUNT
// ==========================================

const loadShareCount = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token || !post?.id) return;

    const response = await axios.get(
      `${API_URL}/shares/${post.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setShareCount(
        Number(response.data.shareCount) || 0
      );
    }
  } catch (error) {
    console.error(
      "Load Share Count Error:",
      error.response?.data || error.message
    );
  }
};
// ==========================================
// SHARE POST
// ==========================================

const handleShare = async () => {
  if (shareLoading || !post?.id) return;

  try {
    setShareLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authentication token not found");
      return;
    }

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

    if (response.data.success) {
      setShareCount(
        Number(response.data.shareCount) || 0
      );
    }
  } catch (error) {
    console.error(
      "Share Error:",
      error.response?.data || error.message
    );
  } finally {
    setShareLoading(false);
  }
};
  // ==========================================
  // DATE
  // ==========================================

  const formattedDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
    const handleShareOption = async (type) => {
  const shareUrl = `${window.location.origin}/feed#post-${post.id}`;
  const shareText = `Check out this post on JobOrbit`;

  try {
    // Pehle database mein share count update
    await handleShare();

    if (type === "native") {
      if (navigator.share) {
        await navigator.share({
          title: "JobOrbit",
          text: shareText,
          url: shareUrl,
        });
      }
    }

    if (type === "copy") {
      await navigator.clipboard.writeText(shareUrl);
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
        `mailto:?subject=${encodeURIComponent("JobOrbit Post")}` +
        `&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
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
        )}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    }
  } catch (error) {
    console.error("Share Option Error:", error);
  } finally {
    setShareMenuOpen(false);
  }
};

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
{/* POST HEADER */}

      <div className="flex items-start justify-between p-5">

        <div className="flex gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <User size={21} />
          </div>

         <div className="min-w-0">

  <div className="flex items-center gap-2">

    <p className="font-semibold text-slate-800">
      {authorName}
    </p>

    {post?.userId !== user?.id && (
      <button
        type="button"
        onClick={handleFollow}
        disabled={followLoading}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          following
            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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

  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="capitalize">
                {authorRole}
              </span>

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

        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
          <MoreHorizontal size={20} />
        </button>

      </div>

      {/* POST CONTENT */}

      {post?.content && (
        <div className="px-5 pb-4">

          <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
            {post.content}
          </p>

        </div>
      )}

      {/* POST MEDIA */}

      {mediaUrl && post.mediaType === "image" && (
        <div className="bg-slate-950">

          <img
            src={mediaUrl}
            alt="Post"
            className="max-h-[600px] w-full object-contain"
          />

        </div>
      )}

      {mediaUrl && post.mediaType === "video" && (
        <div className="bg-black">

          <video
            src={mediaUrl}
            controls
            preload="metadata"
            className="max-h-[600px] w-full"
          />

        </div>
      )}
{/* POST ACTIONS */}

<div className="px-5 py-3">

  <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
    <span>
      {likeCount} {likeCount === 1 ? "Like" : "Likes"}
    </span>

    <span>
      {commentCount} Comments • {shareCount} Shares
    </span>
  </div>

  <div className="grid grid-cols-2 pt-2 sm:grid-cols-3">

    {/* LIKE */}
    <button
      type="button"
      onClick={handleLike}
      disabled={likeLoading}
      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      <Heart
        size={18}
        fill={liked ? "currentColor" : "none"}
      />

      {likeLoading ? "Updating..." : "Like"}
    </button>

    {/* SHARE */}
    <div className="relative">

      <button
        type="button"
        onClick={() => setShareMenuOpen((prev) => !prev)}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
      >
        <Share2 size={18} />
        Share
      </button>

      {/* SHARE MENU */}
      {shareMenuOpen && (
        <div className="absolute bottom-full left-1/2 z-[100] mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">

          {/* DEVICE SHARE */}
          {typeof navigator !== "undefined" &&
            navigator.share && (
              <button
                type="button"
                onClick={() =>
                  handleShareOption("native")
                }
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span>📱</span>
                <span>Share via device</span>
              </button>
            )}

          {/* WHATSAPP */}
          <button
            type="button"
            onClick={() =>
              handleShareOption("whatsapp")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </button>

          {/* COPY LINK */}
          <button
            type="button"
            onClick={() =>
              handleShareOption("copy")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span>📋</span>
            <span>Copy Link</span>
          </button>

          {/* EMAIL */}
          <button
            type="button"
            onClick={() =>
              handleShareOption("email")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span>✉️</span>
            <span>Email</span>
          </button>

          {/* LINKEDIN */}
          <button
            type="button"
            onClick={() =>
              handleShareOption("linkedin")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span>🔗</span>
            <span>LinkedIn</span>
          </button>

          {/* FACEBOOK */}
          <button
            type="button"
            onClick={() =>
              handleShareOption("facebook")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span>📘</span>
            <span>Facebook</span>
          </button>

          {/* X */}
          <button
            type="button"
            onClick={() =>
              handleShareOption("x")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span>𝕏</span>
            <span>X (Twitter)</span>
          </button>

        </div>
      )}

    </div>

    {/* COMMENT */}
    <button
      type="button"
      onClick={() => {
        const nextState = !commentOpen;

        setCommentOpen(nextState);

        if (nextState) {
          loadComments();
        }
      }}
      className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
    >
      <MessageCircle size={18} />
      Comment
    </button>

  </div>

</div>

{/* COMMENTS */}

{commentOpen && (
  <div className="border-t border-slate-100 px-5 py-4">

    {/* COMMENT INPUT */}

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

            setCommentText("");
          }
        } catch (error) {
          console.error(
            "Add Comment Error:",
            error
          );
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
          onChange={(e) =>
            setCommentText(e.target.value)
          }
          placeholder="Write a comment..."
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
        comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3"
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <User size={17} />
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-100 px-4 py-2">

              <p className="text-sm font-semibold text-slate-800">
                {comment.User?.name || "User"}
              </p>

              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">
                {comment.content}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {comment.createdAt
                  ? new Date(
                      comment.createdAt
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