"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, RabbitIcon as Duck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

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
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Global Chat */}
      <motion.div
        whileHover={{ backgroundColor: "#FFF7D6" }}
        className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${
          activeChat.type === "global" ? "bg-[#FFF7D6]" : ""
        }`}
        onClick={goToGlobalChat}
      >
        <Avatar className="h-12 w-12 bg-[#F0B232] text-white">
          <AvatarFallback>
            <Users className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-gray-900">Chat Global</h3>
            <span className="text-xs text-gray-500">Agora</span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            Todos os usuários do DuckChat
          </p>
        </div>
      </motion.div>

      {/* Contacts */}
      {contacts.length > 0 && (
        <>
          <h3 className="px-4 py-2 text-xs font-semibold text-[#dd9e29] uppercase">
            Conversas
          </h3>
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ backgroundColor: "#FFF7D6" }}
                className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${
                  activeChat.type === "private" &&
                  activeChat.contactId === contact.id
                    ? "bg-[#FFF7D6]"
                    : ""
                }`}
                onClick={() => startPrivateChat(contact)}
              >
                <Avatar className="h-12 w-12 bg-[#F0B232] text-white">
                  <AvatarFallback>
                    {contact.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-gray-900 truncate">
                      {contact.email}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {contact.lastMessageTime
                        ? formatRelativeTime(new Date(contact.lastMessageTime))
                        : "Novo"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.lastMessage || "Iniciar conversa"}
                  </p>
                </div>
                {contact.unreadCount && contact.unreadCount > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 bg-[#F0B232] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {contact.unreadCount}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}

      {/* No Contacts */}
      {contacts.length === 0 && (
        <div className="p-8 text-center">
          <motion.div
            className="w-24 h-24 mx-auto opacity-70 mb-4 text-[#dd9e29] flex justify-center"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Duck size={64} />
          </motion.div>
          <p className="text-[#dd9e29]">Nenhum contato encontrado</p>
          <p className="text-sm text-gray-500 mt-1">
            Use a pesquisa para encontrar usuários
          </p>
        </div>
      )}
    </div>
  );
}
