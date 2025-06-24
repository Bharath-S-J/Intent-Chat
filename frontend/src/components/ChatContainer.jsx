import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    smartReplies,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (!selectedUser || !messages.length) return;

    const lastMessage = messages[messages.length - 1];

    // Only generate smart replies if the last message was from the selected user (i.e., incoming)
    if (lastMessage.senderId === selectedUser._id && lastMessage.text) {
      useChatStore.getState().generateSmartReplies(lastMessage.text);
    }
  }, [selectedUser?._id, messages]);
  
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, smartReplies]);

  const getToneStyle = (tone) => {
    switch (tone) {
      case "joy":
        return {
          emoji: "😊",
          label: "Joy",
          className: "bg-green-100 text-green-700",
        };
      case "sadness":
        return {
          emoji: "😢",
          label: "Sad",
          className: "bg-blue-100 text-blue-700",
        };
      case "anger":
        return {
          emoji: "😠",
          label: "Anger",
          className: "bg-red-100 text-red-700",
        };
      case "fear":
        return {
          emoji: "😨",
          label: "Fear",
          className: "bg-purple-100 text-purple-700",
        };
      case "surprise":
        return {
          emoji: "😲",
          label: "Surprise",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "neutral":
        return {
          emoji: "😐",
          label: "Neutral",
          className: "bg-gray-100 text-gray-700",
        };
      default:
        return {
          emoji: "💬",
          label: tone,
          className: "bg-gray-200 text-gray-700",
        };
    }
  };
  

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput key={selectedUser?._id} />
      </div>
    );
  }
  

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}

              {message.tone !== undefined &&
                (message.tone === null ? (
                  <span className="mt-1 text-xs px-2 py-0.5 rounded-full self-end bg-gray-100 text-gray-500 animate-pulse">
                    ⏳ Detecting tone...
                  </span>
                ) : (
                  (() => {
                    const { emoji, label, className } = getToneStyle(
                      message.tone
                    );
                    return (
                      <span
                        className={`mt-1 text-xs px-2 py-0.5 rounded-full self-end ${className}`}
                      >
                        {emoji} {label}
                      </span>
                    );
                  })()
                ))}
            </div>
          </div>
        ))}
      </div>

      <MessageInput key={selectedUser?._id} />
    </div>
  );
};
export default ChatContainer;
