import { motion, useReducedMotion } from "framer-motion"

/** Scroll-into-view fade/slide. Respects reduced motion. */
export default function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion()
  if (reduced) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
