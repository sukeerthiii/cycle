import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";

type Phase = "menstrual" | "follicular" | "ovulatory" | "luteal";

interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  phase?: Phase;
  defaultOpen?: boolean;
}

export function CollapsibleCard({
  title,
  children,
  phase,
  defaultOpen = true,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card phase={phase} onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="body-small" style={{ color: "var(--text-secondary)" }}>
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: "var(--text-tertiary)", fontSize: 12 }}
        >
          ▾
        </motion.span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 10 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
