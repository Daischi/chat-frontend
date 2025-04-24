"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.user);
        router.push("/chat");
      } else {
        setError(
          data.message || "Falha ao fazer login. Verifique suas credenciais."
        );
      }
    } catch (err) {
      console.error("Erro completo:", err);
      setError("Erro ao conectar com o servidor. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#b3a924] via-[#b99856] to-[#cf9934]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bubble-container absolute inset-0" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-3xl" />

        <div className="relative p-8 rounded-3xl">
          {/* Logo and Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, -2.5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mx-auto mb-4 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#dd9e29] to-[#F0B232] rounded-full blur-lg opacity-70" />
              <div className="relative bg-white rounded-full p-4 shadow-xl">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-[#dd9e29]"
                >
                  <path
                    fill="currentColor"
                    d="M8.5,5A1.5,1.5 0 0,0 7,6.5A1.5,1.5 0 0,0 8.5,8A1.5,1.5 0 0,0 10,6.5A1.5,1.5 0 0,0 8.5,5M10,2A5,5 0 0,1 15,7C15,8.7 14.15,10.2 12.86,11.1C14.44,11.25 16.22,11.61 18,12.5C21,14 22,12 22,12C22,12 21,21 15,21H9C9,21 4,21 4,16C4,13 7,12 6,10C2,10 2,6.5 2,6.5C3,7 4.24,7 5,6.65C5.19,4.05 7.36,2 10,2Z"
                  />
                </svg>
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold text-[#dd9e29] mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-600">Entre na sua conta do DuckChat</p>
          </motion.div>

          {error && (
            <Alert
              variant="destructive"
              className="mb-6 bg-red-50 border-red-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/80 border-2 border-[#ddc494] focus:border-[#dd9e29] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white/80 border-2 border-[#ddc494] focus:border-[#dd9e29] rounded-xl"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-12 bg-[#dd9e29] hover:bg-[#c98f25] text-white rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-600">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-[#dd9e29] hover:text-[#c98f25] font-medium"
              >
                Registre-se
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        .bubble-container::before,
        .bubble-container::after {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s infinite linear;
        }

        .bubble-container::before {
          left: 20%;
          animation-delay: -5s;
        }

        .bubble-container::after {
          right: 20%;
          width: 200px;
          height: 200px;
          animation-delay: -12s;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
