import { motion, Variants } from "framer-motion";

const cardVariants: Variants = {
  offscreen: {
    y: 500,
  },
  onscreen: {
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="offscreen"
      whileInView="onscreen"
    >
      {children}
    </motion.div>
  );
}
