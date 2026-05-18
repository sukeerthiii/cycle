# Changelog

## v0.4.0 — UI Redesign + v0.3 Features

### Design System Overhaul

- Three-font system: IBM Plex Mono (labels), Cormorant Garamond (available for display), Inter (body/values/UI)
- Monospace uppercase tracked labels throughout ("CYCLE PHASE", "STEPS", "FUEL", "ANATOMY")
- Phase gradient backgrounds: multi-color radial gradient with all four phase colors, dominant color shifts per cycle phase
- Warm-toned grain overlay (amber/brown noise, soft-light blend, 18% opacity) visible across all pages
- Contrast color set added: menstrual-contrast (cool blue), follicular-contrast (warm coral), ovulatory-contrast (slate blue), luteal-contrast (sage green)
- Two-tone gradient progress bars (primary-to-contrast) for cycle and step progress
- Glassmorphism everywhere: frosted glass cards, sheets, tab bar, FAB, settings, logging screens
- Glossy shadow on all glass surfaces (outer shadow + inner white highlight)
- Phase line illustrations: drop (menstrual), sprout (follicular), sun (ovulatory), moon (luteal)
- Pure white base background (#FAFAF8), no more beige/cream
- App icon updated to gradient loop motif

### Today Tab

- Full-bleed multi-color gradient at top (~42vh), all text below on white
- "CYCLE PHASE" monospace label + date
- Phase name as hero element (20px, 600 weight, phase-colored)
- "Day X of Y" as secondary text
- All data sections in glassy cards with phase-tinted backgrounds
- Settings changed from text to gear icon (line art)
- Removed: phase ring, "Shades of..." subtitle, redundant Phase/Day section

### Map Tab

- Soft multi-color PageBackground gradient (radial blobs at ~22% opacity)
- Calendar, weekly split, period controls, weekly planner all in frosted glass cards
- Softer calendar phase fills (10% opacity), workout dots use contrast colors

### Pulse Tab

- Soft PageBackground gradient, glass chart sections with glossy shadow
- Quick-pick exercise chips now frosted glass pills (no more beige)
- Search input, toggles all glassmorphed
- Table headers in monospace

### Log Tab

- PageBackground gradient, table in frosted glass card
- Monospace table headers

### FAB

- Smaller (48px), phase-gradient tinted glass, stronger blur + saturation
- Outlined style with phase-colored + icon

### All Sheets & Logging Screens

- Frosted glass (blur 30px, translucent white, white border, glossy shadow)
- Type picker buttons now individually glassmorphed
- All logging screens (strength, session, walk, running, exercise search) frosted glass fullscreen

### Tab Bar

- Frosted glass with blur, monospace labels
- Active tab indicated by phase-colored dot

### v0.3 Features (included in this release)

- CSV export includes per-exercise rows with set detail (10x50, 8xBW)
- Strength log pre-fills previous session's reps/weight
- Steps editable inline on Log tab (tap the steps column)
- 60+ new exercises: dumbbell, resistance band, bodyweight variations
- Running with interval logging (run/walk blocks) + stacked bar progress chart
- Weekly Plan notepad on Map tab
- Progress card quick-pick chips (top 5 most-logged exercises)
- Cardio added as workout type
- Volume by Phase removed from Pulse
- Grain texture scales to device pixel ratio

### Bug Fixes

- Fixed timezone bug: all date calculations now use local time instead of UTC (was causing data mismatches after 5pm PST)
- Fixed steps graph not showing data (scale was hardcoded to 10000 minimum)

## v0.2.0 — Design System Overhaul + Pulse Redesign

(see previous changelog entry)

## v0.1.0 — All Tabs and Core Logic

(initial release)
