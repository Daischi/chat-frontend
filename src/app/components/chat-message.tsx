import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import MessageAttachments from "./message-attachments";

interface Message {
  id: number;
  sender_id: number;
  sender_email: string;
  message: string;
  created_at: string;
  receiver_id?: number;
  receiver_email?: string;
  attachments?: {
    id: number;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
    previewUrl?: string;
  }[];
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function ChatMessage({
  message,
  isCurrentUser,
}: ChatMessageProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const copyMessage = () => {
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex mb-4 max-w-[85%] ${
        isCurrentUser ? "ml-auto justify-end" : ""
      }`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-white text-xs">
            {message.sender_email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="relative group">
        <div
          className={`rounded-lg px-4 py-2 shadow-sm ${
            isCurrentUser
              ? "bg-gradient-to-r from-amber-500 to-amber-400 text-white"
              : "bg-white text-gray-800 border border-amber-200"
          }`}
        >
          {!isCurrentUser && (
            <div className="text-xs text-amber-600 font-medium mb-1">
              {message.sender_email}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
          <div
            className={`text-xs mt-1 ${
              isCurrentUser ? "text-amber-100" : "text-gray-500"
            }`}
          >
            {formattedTime}
          </div>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <MessageAttachments
            attachments={message.attachments}
            isCurrentUser={isCurrentUser}
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            showOptions ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
          }
          transition={{ duration: 0.15 }}
          className={`absolute top-0 ${
            isCurrentUser
              ? "left-0 -translate-x-full -ml-2"
              : "right-0 translate-x-full mr-2"
          } z-10`}
        >
          <div className="bg-white shadow-md rounded-full p-1 flex space-x-1 border border-gray-100">
            <button
              onClick={copyMessage}
              className="p-1 hover:bg-amber-50 rounded-full transition-colors"
              title="Copiar mensagem"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-amber-500" />
              )}
            </button>
          </div>
        </motion.div>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`absolute top-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${
            isCurrentUser
              ? "left-0 -translate-x-full -ml-1"
              : "right-0 translate-x-full mr-1"
          }`}
        >
          <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    </div>
  );
}
