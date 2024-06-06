import { motion, Variants } from "framer-motion";

const cardVariants: Variants = {
  offscreen: {
    x: 500,
  },
  onscreen: {
    x: 0,
    transition: {
      duration: 2,
    },
  },
};

export function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
    >
      <motion.div variants={cardVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
}
