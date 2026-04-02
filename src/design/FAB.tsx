import { motion } from "framer-motion";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface FABProps {
  hasLoggedToday: boolean;
  onClick: () => void;
  phase: Phase;
}

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

const phaseShadowMap: Record<Phase, string> = {
  menstrual: "0 4px 16px rgba(196, 112, 90, 0.35)",
  follicular: "0 4px 16px rgba(139, 168, 136, 0.35)",
  ovulatory: "0 4px 16px rgba(212, 168, 67, 0.35)",
  luteal: "0 4px 16px rgba(155, 126, 155, 0.35)",
};

export function FAB({ hasLoggedToday, onClick, phase }: FABProps) {
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
        background: phaseColorMap[phase],
        border: "none",
        boxShadow: phaseShadowMap[phase],
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
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.button>
  );
}
