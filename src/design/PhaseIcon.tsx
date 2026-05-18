import type { Phase } from "../models/types";

interface PhaseIconProps {
  phase: Phase;
  size?: number;
  color?: string;
}

export function PhaseIcon({ phase, size = 48, color }: PhaseIconProps) {
  const c = color ?? `var(--phase-${phase})`;

  switch (phase) {
    case "menstrual":
      return <DropIcon size={size} color={c} />;
    case "follicular":
      return <SproutIcon size={size} color={c} />;
    case "ovulatory":
      return <SunIcon size={size} color={c} />;
    case "luteal":
      return <MoonIcon size={size} color={c} />;
  }
}

function DropIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6C24 6 12 22 12 30C12 36.627 17.373 42 24 42C30.627 42 36 36.627 36 30C36 22 24 6 24 6Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SproutIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 40V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M24 28C20 28 14 26 14 18C14 18 20 18 24 22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 22C28 22 34 20 34 12C34 12 28 12 24 16"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="28" r="8" stroke={color} strokeWidth="1.5" />
      <path d="M24 8V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 42V36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 28H4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 28H38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.17 17.17L8.93 12.93" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M39.07 12.93L34.83 17.17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.17 38.83L8.93 43.07" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M39.07 43.07L34.83 38.83" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M36 28C36 35.18 30.18 41 23 41C15.82 41 10 35.18 10 28C10 20.82 15.82 15 23 15C23 15 20 20 22 25C24 30 30 32 36 28Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
