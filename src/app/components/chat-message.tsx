import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: number;
  sender_id: number;
  sender_email: string;
  message: string;
  created_at: string;
  receiver_email?: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  isPrivate?: boolean;
}

export default function ChatMessage({
  message,
  isCurrentUser,
}: ChatMessageProps) {
  const initials = message.sender_email.split("@")[0].slice(0, 2).toUpperCase();

  const formattedDate = format(
    new Date(message.created_at),
    "dd/MM/yyyy HH:mm",
    { locale: ptBR }
  );

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        } max-w-[80%] gap-2`}
      >
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-200 text-green-700 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <div
            className={`rounded-lg p-3 ${
              isCurrentUser
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            {!isCurrentUser && (
              <p className="text-xs font-semibold text-green-600 mb-1">
                {message.sender_email}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>
          <p
            className={`text-xs text-gray-500 mt-1 ${
              isCurrentUser ? "text-right" : "text-left"
            }`}
          >
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
