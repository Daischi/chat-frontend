"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowLeft,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  RabbitIcon as Duck,
  Users,
  MessageSquare,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/auth-context";
import ChatMessage from "../components/chat-message";
import ConversationList from "../components/conversation-list";
import LoadingDuck from "../components/loading-duck";
import AttachmentPanel from "../components/attachment-panel";
import UploadService from "../components/upload-service";

interface Attachment {
  file: File;
  progress: number;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

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
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.1,
          scale: 0.8,
        }}
        animate={{
          y: [0, -15, 0],
          rotate: [0, i % 2 === 0 ? 5 : -5, 0],
          opacity: [0.1, 0.18, 0.1],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5,
        }}
      >
        <Duck size={Math.random() * 40 + 20} className="text-[#F0B232]" />
      </motion.div>
    ))}
    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-200/20 to-transparent" />
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isChangingChat, setIsChangingChat] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachmentPanel, setShowAttachmentPanel] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchContacts();
    fetchMessages();

    const interval = setInterval(() => {
      if (activeChat.type === "global") {
        fetchMessages(false);
      } else if (activeChat.contactId) {
        fetchPrivateMessages(activeChat.contactId, false);
      }
      fetchContacts();
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (newMessage.trim().length > 0) {
      setIsTyping(true);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else {
      setIsTyping(false);
    }

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [newMessage]);

  const handleAttach = (files: File[]) => {
    const newAttachments = files.map((file) => ({
      file,
      progress: 0,
      uploading: true,
      uploaded: false,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);

    files.forEach((file, index) => {
      const attachmentIndex = attachments.length + index;

      UploadService.uploadFile(file, (progress) => {
        setAttachments((current) =>
          current.map((att, i) =>
            i === attachmentIndex ? { ...att, progress } : att
          )
        );
      }).then((result) => {
        if (result.success && result.fileUrl) {
          setAttachments((current) =>
            current.map((att, i) =>
              i === attachmentIndex
                ? {
                    ...att,
                    uploading: false,
                    uploaded: true,
                    url: result.fileUrl,
                  }
                : att
            )
          );
        }
      });
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, i) => i !== index));
  };

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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!newMessage.trim() && attachments.length === 0) || !user) return;

    const tempMessage: Message = {
      id: Date.now(),
      sender_id: user.id,
      sender_email: user.email,
      message: newMessage,
      created_at: new Date().toISOString(),
      attachments: attachments.map((att, index) => ({
        id: index,
        fileName: att.file.name,
        fileSize: att.file.size,
        fileType: att.file.type,
        url: att.url || "",
      })),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setAttachments([]);

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
            message: tempMessage.message,
            attachments: tempMessage.attachments,
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
            message: tempMessage.message,
            attachments: tempMessage.attachments,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        if (activeChat.type === "global") {
          fetchMessages(false);
        } else if (activeChat.contactId) {
          fetchPrivateMessages(activeChat.contactId, false);
        }
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }

    messageInputRef.current?.focus();
  };

  const startPrivateChat = (contact: Contact) => {
    setMessages([]);
    setIsChangingChat(true);

    setActiveChat({
      id: contact.id,
      type: "private",
      name: contact.email,
      contactId: contact.id,
      contactEmail: contact.email,
    });

    setTimeout(() => {
      fetchPrivateMessages(contact.id);
      setIsChangingChat(false);
    }, 2000);

    setSearchQuery("");
    setShowSearch(false);
    setShowMobileMenu(false);
  };

  const goToGlobalChat = () => {
    setMessages([]);
    setIsChangingChat(true);

    setActiveChat({
      id: 0,
      type: "global",
      name: "Chat Global",
    });

    setTimeout(() => {
      fetchMessages();
      setIsChangingChat(false);
    }, 2000);

    setShowMobileMenu(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <DuckBackground />

      <div className="w-full h-full flex">
        <AnimatePresence>
          {(showMobileMenu || window.innerWidth > 768) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full md:w-[350px] flex flex-col border-r border-amber-200/50 bg-white/80 backdrop-blur-sm z-10 absolute md:relative h-full"
            >
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

        <div className="flex-1 flex flex-col relative bg-white/60 backdrop-blur-md">
          <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-amber-200/50 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center space-x-3">
              {showMobileMenu === false && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-1 text-amber-600 hover:bg-amber-100 rounded-full"
                  onClick={() => setShowMobileMenu(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="relative">
                <Avatar className="bg-gradient-to-br from-amber-400 to-amber-500 text-white h-10 w-10 ring-2 ring-amber-200">
                  <AvatarFallback>
                    {activeChat.type === "global" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      activeChat.name.charAt(0).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
              </div>
              <div>
                <h2 className="font-bold text-amber-900">
                  {activeChat.name}
                  {activeChat.type === "private" && isTyping && (
                    <span className="text-xs ml-2 text-amber-600 animate-pulse">
                      digitando...
                    </span>
                  )}
                </h2>
                <p className="text-xs text-amber-700/70 font-medium">
                  {activeChat.type === "global" ? (
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 inline-block"></span>
                      Todos os usuários
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 inline-block"></span>
                      Online
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-amber-600 hover:bg-amber-100 rounded-full"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-amber-600 hover:bg-amber-100 rounded-full"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-amber-600 hover:bg-amber-100 rounded-full"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 bg-[#FFF7D6]/70"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23F0B232' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    scale: {
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    },
                  }}
                  className="relative w-20 h-20"
                >
                  <Duck className="w-full h-full text-amber-400" />
                </motion.div>
              </div>
            ) : isChangingChat ? (
              <LoadingDuck />
            ) : isLoadingMessages ? (
              <div className="flex flex-col justify-center items-center h-full">
                <motion.div
                  className="relative"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Duck className="w-16 h-16 text-amber-400" />
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-white rounded-full shadow-md text-xs text-amber-600 font-medium border border-amber-200 whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Carregando mensagens...
                  </motion.div>
                </motion.div>
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col justify-center items-center h-full text-gray-500 space-y-4"
              >
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Duck size={80} className="text-amber-400" />
                </motion.div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-amber-700 mb-1">
                    Nenhuma mensagem ainda
                  </h3>
                  <p className="text-amber-600">
                    Seja o primeiro a enviar uma mensagem!
                  </p>
                </div>

                <motion.button
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-medium rounded-full shadow-md flex items-center space-x-2 hover:from-amber-600 hover:to-amber-500 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => messageInputRef.current?.focus()}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar mensagem</span>
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05 > 0.5 ? 0.5 : index * 0.05,
                      }}
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

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="p-3 bg-white/90 backdrop-blur-sm border-t border-amber-200/50 shadow-lg z-10"
          >
            <div className="relative">
              <AttachmentPanel
                isOpen={showAttachmentPanel}
                onClose={() => setShowAttachmentPanel(false)}
                onAttach={handleAttach}
              />

              <form
                onSubmit={sendMessage}
                className="flex items-center space-x-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-amber-500 hover:bg-amber-100 rounded-full"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`text-amber-500 hover:bg-amber-100 rounded-full ${
                    showAttachmentPanel ? "bg-amber-50" : ""
                  }`}
                  onClick={() => setShowAttachmentPanel(!showAttachmentPanel)}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <div className="flex space-x-1 absolute bottom-full mb-2">
                    <AnimatePresence>
                      {attachments.map((attachment, index) => (
                        <motion.div
                          key={`${attachment.file.name}-${index}`}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="group relative bg-amber-50 rounded-md border border-amber-200 px-2 py-1 text-xs flex items-center"
                        >
                          <span
                            className="truncate max-w-32"
                            title={attachment.file.name}
                          >
                            {attachment.file.name}
                          </span>

                          {attachment.uploading && (
                            <div className="ml-2 w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                style={{ width: `${attachment.progress}%` }}
                              ></div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <Input
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem"
                    className="flex-1 bg-amber-50 border-amber-200 focus-visible:ring-amber-400 rounded-full pl-4 pr-10 py-6 shadow-inner"
                    disabled={isLoadingMessages || isChangingChat}
                  />
                  {isTyping && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        className="flex space-x-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="h-2 w-2 rounded-full bg-amber-400"
                            animate={{ y: ["0%", "-50%", "0%"] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </motion.div>
                    </span>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white rounded-full shadow-md w-12 h-12 flex items-center justify-center"
                    disabled={
                      (!newMessage.trim() && attachments.length === 0) ||
                      isLoadingMessages ||
                      isChangingChat
                    }
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
