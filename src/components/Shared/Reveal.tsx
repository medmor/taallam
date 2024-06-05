import { motion, Variants } from "framer-motion";

const cardVariants: Variants = {
    offscreen: {
        x: 1000
    },
    onscreen: {
        x: 0,
        transition: {
            type: "spring",
            bounce: .5,
            duration: 3
        }
    }
};

export function Reveal({ children }: { children: React.ReactNode }) {

    return (
        <motion.div variants={cardVariants}
            initial="offscreen"
            whileInView="onscreen"
        >
            {children}
        </motion.div>
    );
}