# Changelog

## v0.2.0 — Design System Overhaul + Pulse Redesign

Changes since v0.1.0 (all tabs and core logic).

### Design System

- Switched from dark mode to light journal theme (#FAF7F4 warm paper background)
- Font split: EB Garamond for headings/display, DM Sans for body/UI
- Phase colors now dynamic throughout the entire app — FAB, tabs, steppers, buttons, progress bars all change per cycle phase
- Calendar phase fills increased to 20% opacity with subtle borders
- Phase ring glow intensified (wider spread, stronger blur)
- Card left-stripe removed, replaced with soft warm shadows
- Grain overlay adjusted for light mode (multiply blend)
- Active tab label colors follow current phase instead of static gold

### Today Tab

- Added "Today" heading with date and day
- "Day" micro-label above cycle day number in ring
- Step goal is now dynamic: 10K in follicular/ovulatory, 8K in menstrual/luteal
- Steps number in Garamond, label in DM Sans
- Cards renamed: "Why" → "Anatomy", "Nutrition" → "Fuel", context → "Phase"
- Fuel and Anatomy cards are side-by-side, independently collapsible
- Card headings in Garamond 17px, body text in DM Sans 14px

### Map Tab

- Calendar phase colors softened for light background
- "Weekly Split" heading in Garamond
- Day sheet buttons/flows use the tapped day's phase color (not today's)
- "Add Movement" / "Plan Movement" capitalized and phase-colored
- Period end button now sage green (was gray)
- Edit and Delete are side-by-side text buttons on workout cards
- Steps card has Edit/Delete controls
- Duration displayed under workout type heading

### Pulse Tab (redesigned)

- Removed: stats row (compliance, sessions, volume), rhythm heatmap
- Added: "Pulse" heading with "Day X · Phase" subtitle
- Steps graph: weekly bar chart, phase-colored bars, prev/next week navigation, target line
- Progress card: pick an exercise, toggle between line chart and table view
- Exercise History moved here from the Log tab
- Volume by Phase and Movement Types cards retained with Garamond titles
- Renamed "Workout Types" → "Movement Types"

### Log Tab (simplified)

- Removed Exercise History (now lives in Pulse)
- Removed segmented control
- Clean "Log" heading + Movement History table only
- Renamed "Workout History" → "Movement History"

### Logging

- Added Cardio as 6th workout type (duration + notes, same flow as pilates/yoga)
- All logging flows (strength, session, walk, cardio) use the date's phase color for controls
- FAB type picker highlights suggested workout in phase color
- Tab names: Cycle/Movement/Trends/History → Today/Map/Pulse/Log
- FAB heading: "Log workout" → "Log Movement"
- Settings page controls use phase color (was gold)

### Tabs

- Renamed: Cycle → Today, Movement → Map, Trends → Pulse, History → Log
