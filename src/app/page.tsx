/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import duckfoto from "@/assets/duckfoto.png";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  // Create floating bubbles effect
  useEffect(() => {
    const createBubble = () => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // Random size between 10px and 40px
      const size = Math.random() * 30 + 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Random horizontal position
      bubble.style.left = `${Math.random() * 100}%`;

      // Set animation duration between 4-8s
      bubble.style.animationDuration = `${Math.random() * 4 + 4}s`;

      document.querySelector(".bubble-container")?.appendChild(bubble);

      // Remove bubble after animation completes
      setTimeout(() => {
        bubble.remove();
      }, 8000);
    };

    // Create bubbles periodically
    const interval = setInterval(createBubble, 800);

    // Initial bubbles
    for (let i = 0; i < 10; i++) {
      setTimeout(createBubble, i * 300);
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background with waves and gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#dd9e29] via-[#f7e602] to-[#F0B232]/30 overflow-hidden">
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full h-full"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full h-full"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L48,69.3C96,75,192,85,288,106.7C384,128,480,160,576,170.7C672,181,768,171,864,149.3C960,128,1056,96,1152,80C1248,64,1344,64,1392,64L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* Floating bubbles container */}
        <div className="bubble-container absolute inset-0 overflow-hidden pointer-events-none" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{
                rotate: [0, -10, 10, -5, 0],
                transition: { duration: 0.5 },
              }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#F0B232] to-[#dd9e29] opacity-75 blur-sm"></div>
              <img
                src={duckfoto.src}
                alt="Logo DuckChat"
                className="relative w-28 h-28 object-contain drop-shadow-xl"
              />
            </motion.div>

            <motion.h1
              className="mt-4 text-5xl font-bold bg-gradient-to-r from-[#F0B232] to-[#dd9e29] bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              DuckChat
            </motion.h1>
          </div>
          <p className="mt-2 text-gray-600 text-lg">
            Conecte-se com amigos e participe do grupo global
          </p>
        </motion.div>

        <div className="space-y-5 grid">
          <Link href="/login" className="w-full">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="w-full py-6 text-lg font-medium bg-[#dd9e29] hover:bg-[#dd9e29] transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl cursor-pointer">
                Entrar
              </Button>
            </motion.div>
          </Link>

          <Link href="/register" className="w-full">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                className="w-full py-6 text-lg font-medium border-2 border-[#dd9e29] text-[#dd9e29] hover:bg-[#ddc494]/10 transition-all duration-300 rounded-xl cursor-pointer"
              >
                Criar Conta
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* CSS for bubbles animation */}
      <style jsx>{`
        .bubble {
          position: absolute;
          bottom: -50px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float linear forwards;
          z-index: 1;
        }

        @keyframes float {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-100vh) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
