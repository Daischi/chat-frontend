"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, UserPlus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import UserSearch from "./user-search";
import { useAuth } from "../context/auth-context";
import PropTypes from "prop-types";

ConversationList.propTypes = {
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
      lastMessage: PropTypes.string,
      lastMessageTime: PropTypes.string,
      unreadCount: PropTypes.number,
    })
  ).isRequired,
  activeChat: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["global", "private"]).isRequired,
    name: PropTypes.string.isRequired,
    contactId: PropTypes.number,
    contactEmail: PropTypes.string,
  }).isRequired,
  goToGlobalChat: PropTypes.func.isRequired,
  startPrivateChat: PropTypes.func.isRequired,
};

interface Contact {
  id: number;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Chat {
  id: number;
  type: "global" | "private";
  name: string;
  contactId?: number;
  contactEmail?: string;
}

interface ConversationListProps {
  contacts: Contact[];
  activeChat: Chat;
  goToGlobalChat: () => void;
  startPrivateChat: (contact: Contact) => void;
}

export default function ConversationList({
  contacts,
  activeChat,
  goToGlobalChat,
  startPrivateChat,
}: ConversationListProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Filter contacts based on search query
  const searchResults = contacts.filter((contact) =>
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-amber-900 mb-1 tracking-tight">
          Conversas
        </h2>
        <p className="text-sm text-amber-700/70">
          Conecte-se com outros usuários
        </p>
      </div>

      <UserSearch
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        startPrivateChat={startPrivateChat}
        searchInputRef={searchInputRef}
      />

      {!showSearch && (
        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
          {/* Global Chat */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`mb-2 p-3 flex items-center space-x-3 rounded-xl cursor-pointer transition-all ${
              activeChat.type === "global"
                ? "bg-gradient-to-r from-amber-100 to-amber-50 shadow-sm border border-amber-200"
                : "bg-white/80 hover:bg-amber-50 border border-transparent hover:border-amber-100"
            }`}
            onClick={goToGlobalChat}
          >
            <div className="relative flex-shrink-0">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 ${
                  activeChat.type === "global"
                    ? "ring-2 ring-amber-300 ring-offset-2"
                    : ""
                }`}
              >
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3
                  className={`font-medium text-amber-900 ${
                    activeChat.type === "global" ? "font-semibold" : ""
                  }`}
                >
                  Chat Global
                </h3>
                <motion.span
                  className="text-xs text-amber-600 font-medium px-2 py-0.5 rounded-full bg-amber-100"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  Ao vivo
                </motion.span>
              </div>
              <p className="text-sm text-amber-700/70 truncate">
                Todos os usuários do DuckChat
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-amber-50 text-xs font-medium text-amber-600 uppercase tracking-wider">
                Conversas Diretas
              </span>
            </div>
          </div>

          {/* Contacts */}
          <AnimatePresence>
            {contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-3 flex items-center space-x-3 rounded-xl cursor-pointer transition-all ${
                      activeChat.type === "private" &&
                      activeChat.contactId === contact.id
                        ? "bg-gradient-to-r from-amber-100 to-amber-50 shadow-sm border border-amber-200"
                        : "bg-white/80 hover:bg-amber-50 border border-transparent hover:border-amber-100"
                    }`}
                    onClick={() => startPrivateChat(contact)}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 ${
                          activeChat.type === "private" &&
                          activeChat.contactId === contact.id
                            ? "ring-2 ring-amber-300 ring-offset-2"
                            : ""
                        }`}
                      >
                        <span className="text-white font-medium">
                          {contact.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3
                          className={`text-amber-900 truncate ${
                            activeChat.type === "private" &&
                            activeChat.contactId === contact.id
                              ? "font-semibold"
                              : "font-medium"
                          }`}
                        >
                          {contact.email}
                        </h3>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-amber-600/80">
                            {formatRelativeTime(
                              new Date(contact.lastMessageTime)
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-amber-700/70 truncate">
                        {contact.lastMessage || "Iniciar conversa"}
                      </p>
                    </div>

                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <motion.div
                        className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full flex items-center justify-center shadow-sm"
                        initial={{ scale: 0.8 }}
                        animate={{
                          scale: [0.8, 1.1, 1],
                          transition: { duration: 0.3 },
                        }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {contact.unreadCount}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 py-8 px-4 text-center"
              >
                <motion.div
                  className="w-20 h-20 mb-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center"
                  animate={{
                    y: [0, -8, 0],
                    boxShadow: [
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <MessageCircle className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-amber-800 mb-1">
                  Nenhum contato
                </h3>
                <p className="text-sm text-amber-700/70 mb-4">
                  Comece a se conectar com outros usuários do DuckChat
                </p>
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full text-white font-medium shadow-sm hover:shadow-md transition-shadow">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar contato
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 mt-auto border-t border-amber-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.email ? user.email.charAt(0).toUpperCase() : ""}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                {user?.email || "Usuário"}
              </p>
              <p className="text-xs text-amber-700/70">Disponível</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
