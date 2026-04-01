import { motion } from "framer-motion";

interface FABProps {
  hasLoggedToday: boolean;
  onClick: () => void;
}

export function FAB({ hasLoggedToday, onClick }: FABProps) {
  return (
    <motion.button
      className="fab"
      onClick={onClick}
      animate={
        hasLoggedToday
          ? {}
          : { scale: [1, 1.03, 1] }
      }
      transition={
        hasLoggedToday
          ? {}
          : { repeat: Infinity, duration: 3, ease: "easeInOut" }
      }
      style={{
        position: "fixed",
        bottom: `calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 16px)`,
        right: 16,
        width: "var(--fab-size)",
        height: "var(--fab-size)",
        borderRadius: "50%",
        background: "var(--accent)",
        border: "none",
        boxShadow: "var(--shadow-fab)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 200,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="var(--bg-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.button>
  );
}
