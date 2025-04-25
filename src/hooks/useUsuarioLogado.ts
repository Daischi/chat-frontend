"use client";

import { useState, useEffect } from "react";

interface UsuarioData {
  nome: string;
  sobrenome: string;
  email: string;
}

interface UsuarioResponse {
  status: "success" | "error";
  data?: UsuarioData;
  message?: string;
}

export function useUsuarioLogado() {
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8000/pegar_usuario_logado.php"
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data: UsuarioResponse = await response.json();

        if (data.status === "success" && data.data) {
          setUsuario(data.data);
        } else {
          setError(data.message || "Erro desconhecido");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro na conexão com o servidor"
        );
        console.error("Erro ao buscar dados do usuário:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  // Função para obter as iniciais do nome
  const getInitials = (): string => {
    if (!usuario) return "";

    const firstInitial = usuario.nome.charAt(0).toUpperCase();
    const secondInitial = usuario.sobrenome.charAt(0).toUpperCase();

    return firstInitial + secondInitial;
  };

  // Função para obter o nome completo
  const getFullName = (): string => {
    if (!usuario) return "";
    return `${usuario.nome} ${usuario.sobrenome}`;
  };

  return {
    usuario,
    loading,
    error,
    getInitials,
    getFullName,
  };
}
