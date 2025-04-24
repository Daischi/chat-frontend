"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, LogOut, Users, Send } from "lucide-react";
import Link from "next/link";
import ChatMessage from "../components/chat-message";

interface Message {
  id: number;
  sender_id: number;
  sender_email: string;
  message: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll for new messages every 3 seconds

    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("http://localhost:8000/get_messages.php");
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch("http://localhost:8000/send_message.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          message: newMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message:", err);
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
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-bold">Chat Global</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/private">
              <Button variant="ghost" className="text-white hover:bg-green-700">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat Privado
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
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Grupo Global
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p>Carregando mensagens...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender_id === user.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white border-t">
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
  );
}
