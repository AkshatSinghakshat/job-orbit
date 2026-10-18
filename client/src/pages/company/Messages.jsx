import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCheck,
  Circle,
  FileText,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X,
  Users,
  UserPlus,
  RefreshCw,
} from "lucide-react";
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");
const FILE_BASE_URL = API_URL.replace(/\/api\/?$/, "");
const api = axios.create({ baseURL: `${API_URL}/messages` });
const directoryApi = axios.create({ baseURL: API_URL });
const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken");
const getCurrentUserId = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Number(payload.id ?? payload.userId ?? payload.user_id ?? payload.sub);
  } catch {
    return null;
  }
};
const getError = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";
const formatTime = (date) => {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const getLastMessage = (chat) => {
  if (typeof chat.lastMessage === "string") return chat.lastMessage;
  return chat.lastMessage?.content || chat.lastMessage?.attachmentName || (chat.lastMessage?.attachmentUrl ? "📎 Attachment" : "Start a conversation");
};
export default function Messages() {
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [followerIds, setFollowerIds] = useState([]);
  const [sidebarTab, setSidebarTab] = useState("chats");
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const currentUserId = useMemo(() => getCurrentUserId(), []);
  const selectedChat = [...conversations, ...directoryUsers].find(
    (chat) => Number(chat.id) === Number(selectedId)
  );
  const loadConversations = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Please log in to use messaging.");
      setLoadingChats(false);
      return;
    }
    try {
      const response = await api.get("/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data.conversations || []);
      setError("");
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoadingChats(false);
    }
  }, []);
  const loadDirectory = useCallback(async () => {
    const token = getToken();
    if (!token || !currentUserId) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [directoryResponse, followingResponse, followersResponse] = await Promise.all([
        directoryApi.get("/users/directory", { headers }),
        directoryApi.get(`/follows/following/${currentUserId}`, { headers }).catch(() => ({ data: {} })),
        directoryApi.get(`/follows/followers/${currentUserId}`, { headers }).catch(() => ({ data: {} })),
      ]);
      const usersPayload = directoryResponse.data.users || directoryResponse.data.data || [];
      const users = Array.isArray(usersPayload) ? usersPayload : [];
      const followingPayload = followingResponse.data.following || followingResponse.data.users || followingResponse.data.data || [];
      const followersPayload = followersResponse.data.followers || followersResponse.data.users || followersResponse.data.data || [];
      const following = Array.isArray(followingPayload) ? followingPayload : [];
      const followers = Array.isArray(followersPayload) ? followersPayload : [];
      const followingUserIds = following
        .map((item) => Number(item.following?.id ?? item.followingId ?? item.user?.id ?? item.User?.id ?? item.userId ?? item.id))
        .filter((id) => Number.isFinite(id) && id > 0);
      const followerUserIds = followers
        .map((item) => Number(item.follower?.id ?? item.followerId ?? item.user?.id ?? item.User?.id ?? item.userId ?? item.id))
        .filter((id) => Number.isFinite(id) && id > 0);
      setDirectoryUsers(users.filter((user) => Number(user.id) !== currentUserId));
      setFollowingIds(followingUserIds);
      setFollowerIds(followerUserIds);
    } catch (err) {
      setError(getError(err));
    }
  }, [currentUserId]);
  const loadMessages = useCallback(async (userId, silent = false) => {
    const token = getToken();
    if (!token || !userId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const response = await api.get(`/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response.data.messages || [];
      setMessages(list);
      setConversations((prev) =>
        prev.map((chat) =>
          Number(chat.id) === Number(userId)
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
      setError("");
    } catch (err) {
      setError(getError(err));
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);
  useEffect(() => {
    loadConversations();
    loadDirectory();
    const timer = setInterval(() => { loadConversations(); loadDirectory(); }, 15000);
    return () => clearInterval(timer);
  }, [loadConversations, loadDirectory]);
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedId);
    const timer = setInterval(() => loadMessages(selectedId, true), 5000);
    return () => clearInterval(timer);
  }, [selectedId, loadMessages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const visibleContacts = useMemo(() => {
    const source = sidebarTab === "chats"
      ? conversations
      : sidebarTab === "following"
        ? directoryUsers.filter((user) => followingIds.includes(Number(user.id)))
        : sidebarTab === "followers"
          ? directoryUsers.filter((user) => followerIds.includes(Number(user.id)))
          : directoryUsers;
    return source.filter((user) => {
      const matchesSearch = `${user.name || ""} ${user.role || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = sidebarTab !== "chats" || filter === "all" || (filter === "unread" && Number(user.unreadCount) > 0);
      return matchesSearch && matchesFilter;
    });
  }, [conversations, directoryUsers, followingIds, followerIds, sidebarTab, search, filter]);
  const openChat = (chat) => {
    setSelectedId(chat.id);
    setMobileChatOpen(true);
    setReplyTo(null);
    setError("");
  };
  const sendMessage = async (event) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || !selectedId || sending) return;
    const token = getToken();
    if (!token) {
      setError("Please log in again.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await api.post(
        `/${selectedId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const saved = response.data.data;
      if (saved) {
        setMessages((prev) => [...prev, saved]);
      } else {
        await loadMessages(selectedId, true);
      }
      setText("");
      setReplyTo(null);
      await loadConversations();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };
  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };
const uploadFile = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file || !selectedId || uploadingFile) return;
  if (file.size > 10 * 1024 * 1024) {
    setError("File size must be 10 MB or less.");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  setUploadingFile(true);
  setError("");
  try {
    const response = await api.post(`/${selectedId}/attachment`, formData, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (response.data.data) {
      setMessages((prev) => [...prev, response.data.data]);
    }
    await loadConversations();
  } catch (err) {
    setError(getError(err));
  } finally {
    setUploadingFile(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-950 p-3 text-slate-100 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-2.5 text-white shadow-lg shadow-blue-200">
                <MessageCircle size={23} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Messages
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Connect with candidates and recruiters.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-900 px-4 py-2 text-xs font-semibold text-emerald-300 sm:flex">
            <Circle size={8} fill="currentColor" />
            Professional messaging
          </div>
        </header>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}
        <div className="grid h-[calc(100dvh-180px)] min-h-[520px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/30 md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
          <aside
            className={`${
              mobileChatOpen ? "hidden md:flex" : "flex"
            } min-h-0 flex-col border-r border-slate-800`}
          >
            <div className="border-b border-slate-800/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Inbox</h2>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-300">
                  {sidebarTab === "chats"
                    ? conversations.length
                    : sidebarTab === "following"
                      ? directoryUsers.filter((user) => followingIds.includes(Number(user.id))).length
                      : sidebarTab === "followers"
                        ? directoryUsers.filter((user) => followerIds.includes(Number(user.id))).length
                        : directoryUsers.length} users
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 transition focus-within:border-blue-400 focus-within:bg-slate-900">
                <Search size={17} className="shrink-0 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={sidebarTab === "chats" ? "Search conversations" : "Search registered users"}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={15} className="text-slate-500" />
                  </button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 sm:grid-cols-4">
                {[["chats", "Chats", MessageCircle], ["followers", "Followers", Users], ["following", "Following", UserPlus], ["users", "All users", Users]].map(([value, label, Icon]) => (
                  <button key={value} onClick={() => { setSidebarTab(value); setFilter("all"); }} className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${sidebarTab === value ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2" style={{ display: sidebarTab === "chats" ? "flex" : "none" }}>
                {[
                  ["all", "All chats"],
                  ["unread", "Unread"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filter === value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-950 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Loading conversations...
                </div>
              ) : visibleContacts.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-slate-500">
                    <MessageCircle size={25} />
                  </div>
                  <p className="font-semibold text-slate-200">
                    No users found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {search
                      ? "Try another search."
                      : "Try another tab or search for a registered user."}
                  </p>
                </div>
              ) : (
                visibleContacts.map((chat) => {
                  const active = Number(selectedId) === Number(chat.id);
                  const isCompany = chat.role === "company";
                  return (
                    <button
                      key={chat.id}
                      onClick={() => openChat(chat)}
                      className={`flex w-full items-start gap-3 border-b border-slate-800/80 px-4 py-4 text-left transition ${
                        active
                          ? "bg-blue-500/10"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-base font-bold text-blue-300 ring-2 ring-white">
                        {(chat.name || "?").charAt(0).toUpperCase()}
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            isCompany ? "bg-violet-500" : "bg-emerald-500"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-slate-100">
                            {chat.name || "User"}
                          </p>
                          <span className="shrink-0 text-[10px] text-slate-500">
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium capitalize text-slate-500">
                          {chat.role || "Member"}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-slate-500">
                            {getLastMessage(chat)}
                          </p>
                          {Number(chat.unreadCount) > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
          <section
            className={`${
              mobileChatOpen ? "flex" : "hidden md:flex"
            } min-h-0 min-w-0 flex-col bg-slate-900`}
          >
            {!selectedChat ? (
              <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 p-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-blue-400 shadow-lg shadow-black/20">
                  <MessageCircle size={36} />
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  Your conversations, one place
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Choose a conversation to connect with candidates and recruiters.
                </p>
              </div>
            ) : (
              <>
                <div className="z-10 flex items-center gap-3 border-b border-slate-800/80 bg-slate-900 px-3 py-3.5 sm:px-5">
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="rounded-lg p-2 hover:bg-slate-800 md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 font-bold text-blue-300">
                    {(selectedChat.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="truncate text-sm font-bold sm:text-base">
                        {selectedChat.name || "User"}
                      </h2>
                      {selectedChat.role === "company" && (
                        <BadgeCheck size={17} className="shrink-0 text-blue-400" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs capitalize text-slate-500">
                      {selectedChat.role || "Member"} · JobOrbit
                    </p>
                  </div>
                  <button
                    className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-800 sm:block"
                    title="Audio call UI only"
                    aria-label="Audio call"
                  >
                    <Phone size={19} />
                  </button>
                  <button
                    className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-800 sm:block"
                    title="Video call UI only"
                    aria-label="Video call"
                  >
                    <Video size={20} />
                  </button>
                  <button
                    className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-800"
                    title="More options"
                    aria-label="More options"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50/60 via-slate-950 to-slate-950 px-3 py-5 sm:px-6">
                  {loadingMessages && messages.length === 0 ? (
                    <p className="m-auto text-sm text-slate-500">
                      Loading messages...
                    </p>
                  ) : messages.length === 0 ? (
                    <div className="m-auto max-w-xs text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-blue-500 shadow-sm">
                        <MessageCircle size={24} />
                      </div>
                      <p className="font-semibold text-slate-200">
                        Say hello 👋
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Your conversation starts here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto mb-5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 shadow-sm">
                        Conversation
                      </div>
                      {messages.map((message, index) => {
                        const senderId = Number(message.senderId);
                        const mine =
                          currentUserId !== null &&
                          senderId === currentUserId;
                        const content =
                          message.content || message.text || "";
                        return (
                          <div
                            key={message.id || `${message.createdAt}-${index}`}
                            className={`mb-3 flex ${
                              mine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-[88%] sm:max-w-[75%]">
                              <div
                                className={`rounded-2xl px-4 py-3 shadow-sm ${
                                  mine
                                    ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                    : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-100"
                                }`}
                              >
                                {message.replyToContent && (
                                  <div className={`mb-2 border-l-2 pl-2 text-xs opacity-80 ${
                                    mine ? "border-white" : "border-blue-500"
                                  }`}>
                                    {message.replyToContent}
                                  </div>
                                )}
                              {content && (
  <p className="whitespace-pre-wrap break-words text-sm leading-6">{content}</p>
)}
{message.attachmentUrl && (
  <a
    href={`${FILE_BASE_URL}${message.attachmentUrl}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-2 flex items-center gap-2 rounded-lg border border-white/20 p-3 text-sm underline"
  >
    <FileText size={20} />
    <span className="break-all">{message.attachmentName || "Download file"}</span>
    <span>↓</span>
  </a>
)}
                                <div className={`mt-1.5 flex items-center justify-end gap-1.5 ${
                                  mine ? "text-blue-100" : "text-slate-500"
                                }`}>
                                  <span className="text-[10px]">
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {mine &&
                                    (message.readAt ? (
                                      <CheckCheck size={14} />
                                    ) : (
                                      <Check size={14} />
                                    ))}
                                </div>
                              </div>
                              <div className={`mt-1 flex ${
                                mine ? "justify-end" : "justify-start"
                              }`}>
                                <button
                                  onClick={() => {
                                    setReplyTo(message);
                                    inputRef.current?.focus();
                                  }}
                                  className="rounded-full px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-900 hover:text-blue-400"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>
                <div className="relative border-t border-slate-800/80 bg-slate-900 p-3 sm:p-4">
                  {replyTo && (
                    <div className="mb-3 flex items-center gap-2 rounded-xl border-l-4 border-blue-500 bg-blue-500/10 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-blue-300">
                          Replying to message
                        </p>
                        <p className="truncate text-xs text-slate-300">
                          {replyTo.content || replyTo.text}
                        </p>
                      </div>
                      <button
                        onClick={() => setReplyTo(null)}
                        aria-label="Cancel reply"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {showEmoji && (
                    <div className="absolute bottom-full left-4 z-20 mb-2 flex gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl">
                      {["😀", "😂", "❤️", "👍", "🎉", "🙏", "🔥", "😊"].map(
                        (emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="text-xl transition hover:scale-125"
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  )}
                  <form onSubmit={sendMessage} className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmoji((value) => !value)}
                      className="hidden shrink-0 rounded-xl p-2.5 text-slate-500 hover:bg-slate-800 sm:block"
                      aria-label="Emoji"
                    >
                      <Smile size={21} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={uploadFile}
                      disabled={uploadingFile || !selectedId}
                      accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.doc,.docx,.xls,.xlsx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 rounded-xl p-2.5 text-slate-500 hover:bg-slate-800"
                      aria-label="Attach file"
                      title={uploadingFile ? "Uploading file..." : "Attach file"}
                      disabled={uploadingFile || !selectedId}
                    >
                      {uploadingFile ? <RefreshCw size={20} className="animate-spin" /> : <Paperclip size={20} />}
                    </button>
                    <input
                      ref={inputRef}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder="Write a message..."
                      maxLength={5000}
                      className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim() || sending}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[10px] text-slate-500">
                      Messages are sent through JobOrbit
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {text.length}/5000
                    </span>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
