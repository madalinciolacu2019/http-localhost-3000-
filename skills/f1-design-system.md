# SKILL: F1 Futuristic Design System

This file contains the definitive design and interaction rules for the Apex Brews F1 project. Refer to this whenever creating new components or pages.

## 1. Visual Language
- **Theme**: Ultra-dark, high-contrast.
- **Colors**:
  - `racing-red`: #E10600 (Primary Action / Accents)
  - `carbon-black`: #15151E (Background)
  - `pit-yellow`: #FFD700 (Warning / Secondary Action)
  - `asphalt`: #38383F (Tertiary / Borders)
- **Typography**:
  - Headings: `Orbitron` (Variable: `--font-orbitron`). Always Uppercase, Italicized for "Speed".
  - Body: `Geist Sans` or similar high-tech sans-serif.

## 2. Component Guidelines
- **Glassmorphism**: Use `glass` or `glass-red` classes. 
  - `background: rgba(255, 255, 255, 0.03)`
  - `backdrop-filter: blur(10px)`
- **Buttons**:
  - Use `btn-racing` class for primary actions.
  - Slanted/Skewed shapes (`skew-x-[-15deg]`) to imply velocity.
- **HUD Elements**: Use thin borders (1px), telemetry-style labels (small, uppercase, tracking-widest), and animated glows.

## 3. Animation Principles
- **Page Transitions**: Use `AnimatePresence` with "wait" mode.
- **Scroll Effects**: GSAP for high-performance parallax.
- **Micro-interactions**:
  - Hover: Glow + Scale (1.05) + Border Color shift.
  - Entrance: Slide from left (to imply moving forward) or Scale-up.

## 4. Interactive Sound Mapping
- `engine-rev`: Use for major CTA clicks or navigating to "Home".
- `gear-shift`: Use for menu navigation or "Add to Cart".
- `click`: Use for small UI elements (toggles, filters).
- `pit-stop`: Use for successful form submissions or confirmations.

## 5. Coding Patterns
- **Tailwind v4**: Configuration is in `globals.css`. Do not look for `tailwind.config.js`.
- **Three.js**: Use `React Three Fiber`. Keep scenes optimized for mobile.
- **Context**: Always use `useSound()` from `@/context/SoundContext`.
