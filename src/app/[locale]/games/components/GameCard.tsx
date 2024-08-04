"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { rnd } from "@/helpers/random";

export default function GameCard({
  title,
  imageUrl,
  createdAt,
}: {
  title: string;
  imageUrl: string;
  createdAt: string;
}) {
  return (
    <motion.div
      className="flex w-[300px] flex-col items-center justify-center gap-4 rounded-full bg-white/40 p-10 shadow-sm"
      initial={{ rotateZ: rnd(-12, -8) }}
      animate={{ rotateZ: rnd(2, 4) }}
      transition={{
        ease: [0, 0.71, 0.2, 1.01],
        repeat: Infinity,
        repeatType: "reverse",
        stiffness: rnd(40, 60),
        damping: rnd(5, 7),
        type: "spring",
      }}
    >
      {
        <Image
          className="w-[200px] rounded-full"
          src={imageUrl}
          alt={title}
          width="200"
          height="200"
          unoptimized
        />
      }
      <div className="text-center text-xl font-bold">{title}</div>
      <div className="text-xs">{createdAt}</div>
    </motion.div>
  );
}
