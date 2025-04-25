import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import type { RefObject } from "react";

interface Contact {
  id: number;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface UserSearchProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Contact[];
  startPrivateChat: (contact: Contact) => void;
  searchInputRef: RefObject<HTMLInputElement>;
}

export default function UserSearch({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  searchResults,
  startPrivateChat,
  searchInputRef,
}: UserSearchProps) {
  return (
    <>
      <div className="mx-4 mb-4">
        <div className="relative">
          {showSearch ? (
            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-amber-500 hover:text-amber-600 transition-colors"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Pesquisar usuários..."
                className="w-full py-2 pl-3 pr-4 bg-white border border-amber-200 rounded-full text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-amber-500" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar conversas..."
                className="w-full py-2 pl-10 pr-4 bg-white border border-amber-200 rounded-full text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
                onFocus={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
          <AnimatePresence>
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 flex items-center space-x-3 rounded-xl cursor-pointer bg-white/80 hover:bg-amber-50 border border-transparent hover:border-amber-100"
                    onClick={() => {
                      startPrivateChat(result);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500">
                        <span className="text-white font-medium">
                          {result.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-amber-900 truncate">
                        {result.email}
                      </h3>
                      <p className="text-sm text-amber-700/70">
                        Clique para iniciar conversa
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              searchQuery.trim() !== "" && (
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
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  >
                    <Search className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-1">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-sm text-amber-700/70">
                    Tente outro termo de pesquisa
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
