"use client";

import { motion } from "framer-motion";
import { RabbitIcon as Duck } from "lucide-react";

export default function LoadingDuck() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="relative w-32 h-32">
        {/* Pato andando */}
        <motion.div
          className="absolute"
          animate={{
            x: [-50, 50, -50],
            y: [0, -10, 0, -10, 0],
          }}
          transition={{
            x: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            y: {
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <Duck size={64} className="text-[#F0B232]" />
        </motion.div>

        {/* Pegadas do pato */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 0.5,
          }}
        >
          <div className="flex space-x-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-[#dd9e29] text-2xl">
                👣
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <p className="text-[#dd9e29] font-medium mt-4">Carregando conversa...</p>
    </div>
  );
}
