import { motion } from "framer-motion";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface FABProps {
  hasLoggedToday: boolean;
  onClick: () => void;
  phase: Phase;
}

const phaseGradients: Record<Phase, string> = {
  menstrual: "linear-gradient(135deg, rgba(196, 112, 90, 0.25), rgba(123, 158, 189, 0.15))",
  follicular: "linear-gradient(135deg, rgba(139, 168, 136, 0.25), rgba(212, 133, 110, 0.15))",
  ovulatory: "linear-gradient(135deg, rgba(212, 168, 67, 0.25), rgba(142, 154, 184, 0.15))",
  luteal: "linear-gradient(135deg, rgba(155, 126, 155, 0.25), rgba(139, 168, 136, 0.15))",
};

const phaseColorMap: Record<Phase, string> = {
  menstrual: "var(--phase-menstrual)",
  follicular: "var(--phase-follicular)",
  ovulatory: "var(--phase-ovulatory)",
  luteal: "var(--phase-luteal)",
};

export function FAB({ hasLoggedToday, onClick, phase }: FABProps) {
  const color = phaseColorMap[phase];

  return (
    <motion.button
      onClick={onClick}
      animate={hasLoggedToday ? {} : { scale: [1, 1.03, 1] }}
      transition={hasLoggedToday ? {} : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
      style={{
        position: "fixed",
        bottom: `calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 14px)`,
        right: 16,
        width: "var(--fab-size)",
        height: "var(--fab-size)",
        borderRadius: "50%",
        background: phaseGradients[phase],
        backdropFilter: "blur(28px) saturate(1.3)",
        WebkitBackdropFilter: "blur(28px) saturate(1.3)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 200,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}
