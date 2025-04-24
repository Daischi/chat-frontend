"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, LogOut, Users, Send, User } from "lucide-react";
import Link from "next/link";
import ChatMessage from "../components/chat-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: number;
  sender_id: number;
  sender_email: string;
  receiver_id: number;
  receiver_email: string;
  message: string;
  created_at: string;
}

interface Contact {
  id: number;
  email: string;
}

export default function PrivateChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchContacts();
    const interval = setInterval(() => {
      if (receiverEmail) {
        fetchPrivateMessages();
      }
    }, 3000); // Poll for new messages every 3 seconds

    return () => clearInterval(interval);
  }, [user, router, receiverEmail]);

  useEffect(() => {
    if (receiverEmail) {
      fetchPrivateMessages();
    }
  }, [receiverEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      console.error("Error fetching contacts:", err);
    }
  };

  const fetchPrivateMessages = async () => {
    if (!receiverEmail) return;

    try {
      const response = await fetch("http://localhost:8000/get_private.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          receiver_email: receiverEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching private messages:", err);
      setLoading(false);
    }
  };

  const sendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !receiverEmail) return;

    try {
      const response = await fetch("http://localhost:8000/send_private.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          receiver_email: receiverEmail,
          message: newMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        fetchPrivateMessages();
      }
    } catch (err) {
      console.error("Error sending private message:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-xl font-bold">Chat Privado</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/chat">
              <Button variant="ghost" className="text-white hover:bg-green-700">
                <Users className="h-5 w-5 mr-2" />
                Chat Global
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-white hover:bg-green-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                {receiverEmail
                  ? `Chat com ${receiverEmail}`
                  : "Selecione um contato"}
              </CardTitle>
              <div className="w-64">
                <Select onValueChange={setReceiverEmail} value={receiverEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um contato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.email}>
                        {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            {!receiverEmail ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>Selecione um contato para iniciar uma conversa</p>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-full">
                <p>Carregando mensagens...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender_id === user.id}
                    isPrivate={true}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={sendPrivateMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              receiverEmail
                ? "Digite sua mensagem..."
                : "Selecione um contato primeiro"
            }
            className="flex-1"
            disabled={!receiverEmail}
          />
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={!receiverEmail}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
