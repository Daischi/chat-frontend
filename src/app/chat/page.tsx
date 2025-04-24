"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  LogOut,
  Users,
  Send,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<Chat>({
    id: 0,
    type: "global",
    name: "Chat Global",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
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
        fetchMessages();
      } else {
        fetchPrivateMessages(activeChat.contactId!);
      }
      fetchContacts(); // Atualiza a lista de contatos periodicamente
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const fetchMessages = async () => {
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
    }
  };

  // Função para buscar mensagens privadas
  const fetchPrivateMessages = async (contactId: number) => {
    if (!contactId) return;

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
          fetchMessages();
        } else {
          fetchPrivateMessages(activeChat.contactId!);
        }
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  // Função para iniciar chat privado
  const startPrivateChat = (contact: Contact) => {
    setActiveChat({
      id: contact.id,
      type: "private",
      name: contact.email,
      contactId: contact.id,
      contactEmail: contact.email,
    });

    fetchPrivateMessages(contact.id);
    setSearchQuery("");
    setShowSearch(false);
  };

  // Função para voltar ao chat global
  const goToGlobalChat = () => {
    setActiveChat({
      id: 0,
      type: "global",
      name: "Chat Global",
    });

    fetchMessages();
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

  // Formatação de data
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return format(date, "HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    }
  };

  // Renderização condicional para usuário não logado
  if (!user) {
    return null; // Será redirecionado no useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-gray-200 bg-white">
        {/* Sidebar Header */}
        <div className="p-4 bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-green-700">
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium truncate">{user.email}</h2>
                <p className="text-xs text-green-100">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-green-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          {showSearch ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Input
                ref={searchInputRef}
                placeholder="Pesquisar usuários..."
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start text-gray-500"
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Pesquisar usuários
            </Button>
          )}
        </div>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="overflow-y-auto">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              Resultados da pesquisa
            </h3>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => startPrivateChat(result)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-600 text-white">
                    {result.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {result.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chats List */}
        {!showSearch && (
          <div className="flex-1 overflow-y-auto">
            {/* Global Chat */}
            <div
              className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${
                activeChat.type === "global"
                  ? "bg-green-50"
                  : "hover:bg-gray-100"
              }`}
              onClick={goToGlobalChat}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-green-600 text-white">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">Chat Global</p>
                <p className="text-sm text-gray-500 truncate">
                  Todos os usuários
                </p>
              </div>
            </div>

            {/* Contacts */}
            {contacts.length > 0 && (
              <>
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Contatos
                </h3>
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${
                      activeChat.type === "private" &&
                      activeChat.contactId === contact.id
                        ? "bg-green-50"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => startPrivateChat(contact)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-600 text-white">
                        {contact.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {contact.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.lastMessage || "Iniciar conversa"}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* No Contacts */}
            {contacts.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>Nenhum contato encontrado.</p>
                <p className="text-sm mt-2">
                  Use a pesquisa para encontrar usuários.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-600 text-white">
                {activeChat.type === "global" ? (
                  <Users className="h-5 w-5" />
                ) : (
                  activeChat.name.charAt(0).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-gray-900">{activeChat.name}</h2>
              <p className="text-sm text-gray-500">
                {activeChat.type === "global"
                  ? "Todos os usuários"
                  : "Chat privado"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 space-y-4">
              <MessageSquare className="h-16 w-16 text-green-200" />
              <p className="text-lg">
                Nenhuma mensagem ainda. Seja o primeiro a enviar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === user.id
                        ? "bg-green-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    {message.sender_id !== user.id && (
                      <p className="text-xs text-green-600 font-medium mb-1">
                        {message.sender_email}
                      </p>
                    )}
                    <p className="break-words">{message.message}</p>
                    <p className="text-xs text-right mt-1 opacity-70">
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
