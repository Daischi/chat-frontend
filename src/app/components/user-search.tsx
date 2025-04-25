"use client";

import type React from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type { RefObject } from "react";

interface UserSearchProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Contact[];
  startPrivateChat: (contact: Contact) => void;
  searchInputRef: RefObject<HTMLInputElement>;
}

interface Contact {
  id: number;
  email: string;
}

interface UserSearchProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Contact[];
  startPrivateChat: (contact: Contact) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
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
      <div className="p-3 border-b border-[#F0B232]/20">
        {showSearch ? (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#dd9e29]"
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
              className="flex-1 bg-[#FFF7D6] border-none focus-visible:ring-[#F0B232]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 border-[#F0B232]/20 hover:bg-[#FFF7D6]/50"
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            <Search className="h-4 w-4 mr-2 text-[#dd9e29]" />
            Pesquisar usuários
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showSearch && (
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {searchResults.length > 0 ? (
              <>
                <h3 className="px-4 py-2 text-xs font-semibold text-[#dd9e29] uppercase">
                  Resultados da pesquisa
                </h3>
                {searchResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 py-3 flex items-center space-x-3 hover:bg-[#FFF7D6]/50 cursor-pointer"
                    onClick={() => startPrivateChat(result)}
                  >
                    <Avatar className="h-10 w-10 bg-[#F0B232] text-white">
                      <AvatarFallback>
                        {result.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {result.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Clique para iniciar conversa
                      </p>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              searchQuery.trim() !== "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <p className="text-[#dd9e29]">Nenhum usuário encontrado</p>
                  <p className="text-sm text-gray-500 mt-1">
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
