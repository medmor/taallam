"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { rnd } from "@/helpers/random";

export interface HomeCardProps {
  label: string;
  href: string;
  imageUrl?: string;
  createdAt?: string;
}
export default function HomeCard({
  label,
  href,
  imageUrl,
  createdAt,
}: HomeCardProps) {
  const [src, setSrc] = useState(imageUrl || "");
  let createdAtSpan: any = undefined;
  if (createdAt) {
    const date = new Date(createdAt);
    createdAtSpan = (
      <span dir="ltr">{`${date.getDate()} / ${date.getMonth()} / ${date.getFullYear()}`}</span>
    );
  }
  return (
    <Link href={href}>
      <motion.div
        className="flex w-[300px] flex-col items-center justify-center gap-4 rounded-full bg-white/40 p-10 shadow-sm"
        initial={{ rotateZ: -10 }}
        animate={{ rotateZ: 2 }}
        transition={{
          ease: [0, 0.71, 0.2, 1.01],
          repeat: Infinity,
          repeatType: "reverse",
          stiffness: 50,
          damping: 5,
          type: "spring",
        }}
      >
        {
          <Image
            className="w-[200px] rounded-full"
            src={src}
            alt="label"
            width="200"
            height="200"
            unoptimized
            onError={() => setSrc("/images/logo.png")}
          />
        }
        <div className="text-center text-xl font-bold">{label}</div>
        {createdAtSpan && <div className="text-xs">{createdAtSpan}</div>}
      </motion.div>
    </Link>
  );
}
