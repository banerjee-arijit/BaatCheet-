import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Settings,
  User,
  Search,
  MoreVertical,
  LogOut,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    users = [],
    getUsers,
    setSelectedUser,
    isUserLoading,
  } = useChatStore();
  const { user, logout, onlineUsers, authUser } = useAuthStore();

  const currentPath = location.pathname;
  const isOverlayRoute =
    currentPath.startsWith("/chat/") ||
    currentPath === "/profile" ||
    currentPath === "/settings";

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (isOverlayRoute) setShowChat(true);
  }, [isOverlayRoute]);

  const handleChatClick = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user._id}`);
    setShowChat(true);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowChat(true);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setShowChat(true);
  };

  const handleLogout = async () => {
    await logout(navigate);
    setShowMenu(false);
  };

  const handleBack = () => {
    setShowChat(false);
    navigate("/");
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const filteredUsers = users.filter(
    (chatUser) =>
      chatUser.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatUser.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Format message preview with "You:" if sent by current user
  const getMessagePreview = (message, senderId) => {
    if (!message) return "Tap to chat";

    const maxLength = 30;
    let preview = message;

    // ✅ Add "You: " if message sent by current user
    if (senderId === authUser?._id) {
      preview = "You: " + message;
    }

    if (preview.length > maxLength) {
      return preview.substring(0, maxLength) + "...";
    }
    return preview;
  };

  // ✅ Format time (e.g., "2:30 PM" or "Yesterday")
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Check if yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Older messages show date
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* LEFT SIDEBAR */}
      <div
        className={`${
          showChat && isOverlayRoute ? "hidden md:flex" : "flex"
        } w-full md:w-[30%] border-r border-gray-200 flex-col`}
      >
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold cursor-pointer hover:bg-gray-300 transition"
            >
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <h1 className="text-lg font-semibold">Baat Cheet</h1>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md py-2 z-50">
                    <button
                      onClick={() => {
                        handleProfileClick();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        handleSettingsClick();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <hr className="my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isUserLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#615EF0]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              {searchQuery ? "No users found" : "No users found yet."}
            </p>
          ) : (
            filteredUsers.map((chatUser) => {
              const isOnline = isUserOnline(chatUser._id);

              return (
                <div
                  key={chatUser._id}
                  onClick={() => handleChatClick(chatUser)}
                  className={`group flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100 transition-all hover:bg-gray-50 ${
                    currentPath === `/chat/${chatUser._id}` ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {chatUser.profilePicture ? (
                      <img
                        src={chatUser.profilePicture}
                        alt={chatUser.fullName}
                        className={`w-12 h-12 rounded-full object-cover ${
                          isOnline ? "ring-2 ring-green-500 ring-offset-2" : ""
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-800 ${
                          isOnline ? "ring-2 ring-green-500 ring-offset-2" : ""
                        }`}
                      >
                        {chatUser.fullName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">
                        {chatUser.username}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(chatUser.lastMessageTime)}
                      </span>
                    </div>
                    {/* ✅ Message preview with "You:" prefix */}
                    <div className="flex items-center gap-1">
                      {chatUser.lastMessage === "📷 Image" && (
                        <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <p className="text-sm text-gray-600 truncate">
                        {getMessagePreview(
                          chatUser.lastMessage,
                          chatUser.lastMessageSenderId
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE / OUTLET */}
      <div
        className={`${
          !showChat && isOverlayRoute ? "hidden md:flex" : "flex"
        } flex-1 flex-col bg-white`}
      >
        {isOverlayRoute && (
          <div className="md:hidden border-b border-gray-200 p-3 flex items-center gap-3 bg-white sticky top-0 z-10">
            <button onClick={handleBack} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold">Back</h2>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
