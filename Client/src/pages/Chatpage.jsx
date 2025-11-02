import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MoreVertical, Send, Paperclip, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const ChatPage = () => {
  const { id } = useParams();
  const {
    users,
    selectedUser,
    setSelectedUser,
    getMessages,
    messages,
    isMessageLoading,
    isUserLoading,
    sendMessage,
    subscribeToMessages,
    unSubscribeToMessages,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isOnline = selectedUser?._id && onlineUsers.includes(selectedUser._id);

  // Fetch messages when userId changes
  useEffect(() => {
    if (id) {
      getMessages(id);
    }
  }, [id, getMessages]);

  // Set selected user when users list or id changes
  useEffect(() => {
    if (id && users.length > 0) {
      const user = users.find((u) => u._id === id);
      if (user && user._id !== selectedUser?._id) {
        setSelectedUser(user);
      }
    }
  }, [id, users, setSelectedUser, selectedUser]);

  // Subscribe to socket messages
  useEffect(() => {
    console.log("🔔 Setting up message subscription");

    // Wait a bit for socket to be ready
    const timer = setTimeout(() => {
      subscribeToMessages();
    }, 500);

    return () => {
      clearTimeout(timer);
      console.log("🔕 Cleaning up message subscription");
      unSubscribeToMessages();
    };
  }, [subscribeToMessages, unSubscribeToMessages]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !imageFile) return;
    if (!id) {
      toast.error("No user selected");
      return;
    }

    setIsSending(true);

    try {
      let imageBase64 = "";

      if (imageFile) {
        imageBase64 = await convertToBase64(imageFile);
      }

      await sendMessage(id, {
        text: newMessage,
        image: imageBase64,
      });

      toast.success("Message sent!");
      setNewMessage("");
      removeImage();
    } catch (err) {
      toast.error("Failed to send message");
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#615EF0]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 flex items-center border-b border-gray-200 shadow-sm">
        <div className="relative mr-3">
          {selectedUser?.profilePicture ? (
            <img
              src={selectedUser.profilePicture}
              alt={selectedUser.username}
              className={`w-10 h-10 rounded-full object-cover ${
                isOnline ? "ring-2 ring-green-500 ring-offset-2" : ""
              }`}
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full bg-[#615EF0] flex items-center justify-center text-white font-semibold ${
                isOnline ? "ring-2 ring-green-500 ring-offset-2" : ""
              }`}
            >
              {getInitials(selectedUser?.username || "C")}
            </div>
          )}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            {selectedUser?.username || "Chat"}
          </h2>
          <p
            className={`text-xs font-medium ${
              isOnline ? "text-green-500" : "text-gray-500"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <MoreVertical className="w-6 h-6 text-gray-600 cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-[#F8F8FF]">
        {isMessageLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#615EF0]"></div>
          </div>
        ) : !Array.isArray(messages) || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.senderId !== id;
            return (
              <div
                key={msg._id}
                className={`flex mb-4 ${
                  isSent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    isSent
                      ? "bg-gray-900 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="attachment"
                      className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(msg.image, "_blank")}
                    />
                  )}
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  <span
                    className={`text-xs block text-right mt-1 ${
                      isSent ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg border-2 border-[#615EF0]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 flex items-center border-t border-gray-200 gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
          title="Attach image"
          disabled={isSending}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !isSending && handleSendMessage()
          }
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#615EF0]"
          disabled={isSending}
        />

        <button
          onClick={handleSendMessage}
          disabled={(!newMessage.trim() && !imageFile) || isSending}
          className="bg-[#615EF0] text-white p-3 rounded-full hover:bg-[#4F4DD8] focus:outline-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </>
  );
};

export default ChatPage;
