"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Send,
  Menu,
  ArrowLeft,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  RabbitIcon as Duck,
  Users,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/auth-context";
import ChatMessage from "../components/chat-message";
import UserSearch from "../components/user-search";
import ConversationList from "../components/conversation-list";
import LoadingDuck from "../components/loading-duck";

interface Message {
  id: number;
  sender_id: number;
  sender_email: string;
  message: string;
  created_at: string;
  receiver_id?: number;
  receiver_email?: string;
}

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

const DuckBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.2,
        }}
      >
        <Duck size={Math.random() * 30 + 20} className="text-[#F0B232]" />
      </div>
    ))}
  </div>
);

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<Chat>({
    id: 0,
    type: "global",
    name: "Chat Global",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isChangingChat, setIsChangingChat] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const { user, logout } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Efeito para redirecionar se não estiver logado
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Inicialização
    fetchContacts();
    fetchMessages();

    // Polling para atualizações
    const interval = setInterval(() => {
      if (activeChat.type === "global") {
        fetchMessages(false); // Não mostrar indicador de carregamento para atualizações automáticas
      } else if (activeChat.contactId) {
        fetchPrivateMessages(activeChat.contactId, false); // Não mostrar indicador de carregamento para atualizações automáticas
      }
      fetchContacts(); // Atualiza a lista de contatos periodicamente
    }, 3000);

    return () => clearInterval(interval);
  }, [user, router, activeChat]);

  // Efeito para rolar para o final quando as mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Efeito para pesquisa
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Função para buscar contatos
  const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:8000/get_contacts.php");
      const data = await response.json();

      if (data.success) {
        setContacts(
          data.contacts.filter((contact: Contact) => contact.id !== user?.id)
        );
      }
    } catch (err) {
      console.error("Erro ao buscar contatos:", err);
    }
  };

  // Função para buscar mensagens globais
  const fetchMessages = async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingMessages(true);
    }

    try {
      const response = await fetch("http://localhost:8000/get_messages.php");
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      setLoading(false);
    } finally {
      if (showLoading) {
        setIsLoadingMessages(false);
      }
    }
  };

  // Função para buscar mensagens privadas
  const fetchPrivateMessages = async (
    contactId: number,
    showLoading = true
  ) => {
    if (!contactId) return;

    if (showLoading) {
      setIsLoadingMessages(true);
    }

    try {
      const response = await fetch("http://localhost:8000/get_private.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          receiver_id: contactId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar mensagens privadas:", err);
      setLoading(false);
    } finally {
      if (showLoading) {
        setIsLoadingMessages(false);
      }
    }
  };

  // Função para pesquisar usuários
  const searchUsers = async (query: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/search_users.php?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users.filter((u: Contact) => u.id !== user?.id));
      }
    } catch (err) {
      console.error("Erro ao pesquisar usuários:", err);
    }
  };

  // Função para enviar mensagem
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      let response;

      if (activeChat.type === "global") {
        response = await fetch("http://localhost:8000/send_message.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            message: newMessage,
          }),
        });
      } else {
        response = await fetch("http://localhost:8000/send_private.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            receiver_id: activeChat.contactId,
            message: newMessage,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setNewMessage("");

        // Atualizar mensagens
        if (activeChat.type === "global") {
          fetchMessages(false); // Não mostrar indicador de carregamento após envio
        } else if (activeChat.contactId) {
          fetchPrivateMessages(activeChat.contactId, false); // Não mostrar indicador de carregamento após envio
        }
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  // Função para iniciar chat privado
  const startPrivateChat = (contact: Contact) => {
    // IMPORTANTE: Limpar mensagens e ativar tela de carregamento
    setMessages([]);
    setIsChangingChat(true);

    // Depois mudar o chat ativo
    setActiveChat({
      id: contact.id,
      type: "private",
      name: contact.email,
      contactId: contact.id,
      contactEmail: contact.email,
    });

    // Buscar mensagens depois de um delay para mostrar a animação
    setTimeout(() => {
      fetchPrivateMessages(contact.id);
      setIsChangingChat(false);
    }, 2000);

    setSearchQuery("");
    setShowSearch(false);
    setShowMobileMenu(false);
  };

  // Função para voltar ao chat global
  const goToGlobalChat = () => {
    // IMPORTANTE: Limpar mensagens e ativar tela de carregamento
    setMessages([]);
    setIsChangingChat(true);

    // Depois mudar o chat ativo
    setActiveChat({
      id: 0,
      type: "global",
      name: "Chat Global",
    });

    // Buscar mensagens depois de um delay para mostrar a animação
    setTimeout(() => {
      fetchMessages();
      setIsChangingChat(false);
    }, 2000);

    setShowMobileMenu(false);
  };

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Função para fazer logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Renderização condicional para usuário não logado
  if (!user) {
    return null; // Será redirecionado no useEffect
  }

  return (
    <div className="flex h-screen bg-[#FFF7D6] overflow-hidden">
      {/* Decorative background */}
      <DuckBackground />

      {/* Sidebar */}
      <AnimatePresence>
        {(showMobileMenu || window.innerWidth > 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full md:w-[350px] flex flex-col border-r border-[#F0B232]/20 bg-white z-10 absolute md:relative h-full"
          >
            {/* Sidebar Header */}
            <div className="p-4 bg-[#F0B232] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="bg-[#dd9e29] text-white h-10 w-10">
                  <AvatarFallback>
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-white">DuckChat</h2>
                  <p className="text-xs text-white/80">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#dd9e29]"
                  onClick={handleLogout}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <UserSearch
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              startPrivateChat={startPrivateChat}
              searchInputRef={searchInputRef}
            />

            {/* Conversations List */}
            {!showSearch && (
              <ConversationList
                contacts={contacts}
                activeChat={activeChat}
                goToGlobalChat={goToGlobalChat}
                startPrivateChat={startPrivateChat}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-[#F0B232]/20 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-3">
            {showMobileMenu === false && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-1"
                onClick={() => setShowMobileMenu(true)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar className="bg-[#F0B232] text-white h-10 w-10">
              <AvatarFallback>
                {activeChat.type === "global" ? (
                  <Users className="h-5 w-5" />
                ) : (
                  activeChat.name.charAt(0).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-gray-900">{activeChat.name}</h2>
              <p className="text-xs text-gray-500">
                {activeChat.type === "global" ? "Todos os usuários" : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#F0B232] hover:bg-[#FFF7D6]"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#F0B232] hover:bg-[#FFF7D6]"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#F0B232] hover:bg-[#FFF7D6]"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FFF7D6]/60">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-16 h-16 text-[#F0B232]"
              >
                <Loader2 className="w-full h-full" />
              </motion.div>
            </div>
          ) : isChangingChat ? (
            <LoadingDuck />
          ) : isLoadingMessages ? (
            <div className="flex flex-col justify-center items-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-12 h-12 text-[#F0B232] mb-3"
              >
                <Loader2 className="w-full h-full" />
              </motion.div>
              <p className="text-[#dd9e29] font-medium">
                Carregando mensagens...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col justify-center items-center h-full text-gray-500 space-y-4"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="text-[#dd9e29]"
              >
                <Duck size={64} />
              </motion.div>
              <p className="text-lg text-[#dd9e29]">
                Nenhuma mensagem ainda. Seja o primeiro a enviar!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage
                      message={message}
                      isCurrentUser={message.sender_id === user.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="p-3 bg-white border-t border-[#F0B232]/20 shadow-md z-10"
        >
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-[#F0B232] hover:bg-[#FFF7D6]"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-[#F0B232] hover:bg-[#FFF7D6]"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite uma mensagem"
              className="flex-1 bg-[#FFF7D6] border-none focus-visible:ring-[#F0B232] rounded-full"
              disabled={isLoadingMessages || isChangingChat}
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                type="submit"
                size="icon"
                className="bg-[#F0B232] hover:bg-[#dd9e29] text-white rounded-full"
                disabled={
                  !newMessage.trim() || isLoadingMessages || isChangingChat
                }
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
