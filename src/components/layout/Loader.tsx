"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const steps = [
  "10%",
  "20%",
  "30%",
  "40%",
  "50%",
  "60%",
  "70%",
  "80%",
  "90%",
  "100%",
];

export const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 1, delay: 0.2 },
  },
};

export const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

export default function Index() {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, [dimension]);

  useEffect(() => {
    if (index == steps.length - 1) return;
    setTimeout(
      () => {
        setIndex(index + 1);
      },
      index == 0 ? 1000 : 150,
    );
  }, [index]);

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="fixed z-50 flex h-[100vh] w-[100vw] bg-white"
    >
      {dimension.width > 0 && (
        <>
          <motion.p
            className="absolute bottom-4 right-10 z-10 text-9xl"
            variants={opacity}
            initial="initial"
            animate="enter"
          >
            {steps[index]}
          </motion.p>
        </>
      )}
    </motion.div>
  );
}
