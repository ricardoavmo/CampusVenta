---
name: Campus Market Neo
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5c403c'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#7f4f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a06500'
  on-tertiary-container: '#fff7f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  mono-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style
The design system embodies an energetic, high-octane collegiate spirit tailored for university life. It fuses the rapid-response utility of modern developer tools (such as Linear) with the approachable trust and warmth of modern consumer-to-consumer marketplaces. The interface must feel vibrant, reliable, and tactile—never bureaucratic, stale, or academic in an antiquated sense. 

Visual tone is defined by punchy contrasts, tight micro-interactions, clean glassmorphic accents, and crisp hierarchy. Elements convey immediacy: peer-to-peer exchanges happen in real time across campus towers, requiring real-time status pulses, immediate WhatsApp CTA triggers, and spatial clarity down to the floor level. The aesthetic balances deep collegiate reds with vivid emeralds and warm amber highlights over razor-sharp neutral surfaces.

## Colors
The color foundation is built on high contrast, institutional pride, and energetic micro-moments.

- **Primary (`#DC2626` / Deep Crimson Red):** Anchors primary brand actions, header accents, and key interactive states. Supported by deep burgundy `#991B1B` for active/pressed states and sleek electric vermilion `#FF4B4B` for badges, interactive tags, and high-energy alerts.
- **Secondary (`#10B981` / Vivid Emerald):** Denotes active real-time states ("En campus ahora", "En línea"), verified university student markers, and confirmed instant deals. Darker shade `#059669` provides high-contrast borders and text treatments.
- **Tertiary (`#F59E0B` / Electric Amber):** Drives urgency, verified seller badges, trending deals, and spatial highlight pins across campus maps.
- **Neutrals (`#0F172A` to `#F8FAFC`):** Deep slate foundation for razor-sharp typography (`#0F172A`), structural elements (`#1E293B`, `#334155`), secondary text (`#64748B`), delicate hair-thin dividers (`#E2E8F0`), and hyper-clean canvas backdrops (`#F8FAFC`, `#F1F5F9`).

Always maintain WCAG AA compliance across text-on-color compositions. All status chips pair tinted backgrounds (10–14% opacity) with saturated core glyphs and deep text.

## Typography
Plus Jakarta Sans serves as the single typographic workhorse. Its geometric balance, human warmth, and modern tall x-height make it exceptionally legible at rapid glances while traversing hallways or scanning feeds on mobile screens.

- **Headlines:** Use heavy weights (700 and 800) with slight letter tracking (-0.02em) to impart punch, energy, and modernity.
- **Labels & Micro-copy:** Weights 600 and 700 are reserved for live location chips (`Torre A · Piso 4`), price indicators, live indicators, and interactive status tags.
- **Body:** Kept at weight 400 with a neutral line-height (1.45–1.5x) to guarantee effortless readability across listing descriptions and chat snippets.

## Layout & Spacing
The layout follows an adaptive fluid grid model built upon an 8px base grid rhythm (with a 4px sub-grid for badges and tight micro-alignments).

- **Mobile (<640px):** 4-column layout with 16px (`1rem`) outer canvas margins and 12px to 16px column gutters. Feeds transition into a single or dual column layout with quick-action bottom sheets.
- **Tablet (640px - 1024px):** 8-column layout with 24px (`1.5rem`) margins and 16px gutters.
- **Desktop (>1024px):** 12-column layout with a constrained maximum container width of `1280px`, dynamic centered side margins (minimum 40px / `2.5rem`), and 24px (`1.5rem`) column gutters.

Elements maintain breathing room without feeling detached: listing grids enforce an internal component gap of `space-md` (`1rem`) up to `space-lg` (`1.5rem`).

## Elevation & Depth
Elevation adopts a hybrid tactile-glassmorphic model that avoids murky, heavy dropshadows in favor of luminous ambient depth and translucent containment.

- **Level 0 (Flat Canvas):** Surface color `#F8FAFC`. Zero elevation.
- **Level 1 (Cards & Tiles):** Surface `#FFFFFF`, framed with a subtle 1px border (`#E2E8F0` or `rgba(15, 23, 42, 0.06)`). Shadow is dual-layered: `0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hovered Cards & Dropdowns):** Subtle upward translation (`translate-y: -2px`) paired with an amplified diffused glow: `0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Sticky Navbars, Modals & Radar Overlays):** Frosted glass styling using `backdrop-filter: blur(12px)` over `rgba(255, 255, 255, 0.85)` and an internal crisp reflection border `rgba(255, 255, 255, 0.6)`. Deep shadow: `0 20px 30px -10px rgba(15, 23, 42, 0.12)`.

## Shapes
The design uses a balanced rounded architecture (Level 2) across containers and structural modules, mixed with full pill radii for transactional and status-driven elements.

- **Cards, Panels & Modals:** `rounded-lg` (16px / 1rem) to provide structured geometry with modern friendly ergonomics.
- **Buttons, Status Badges, Chips & Pills:** Strictly 9999px (full pill shape) to accentuate tactile affordance, dynamism, and quick finger-tap targets.
- **Inputs & Control Elements:** `rounded-md` (8px to 10px) with crisp 1.5px borders to deliver a focused, utility-grade interaction zone.

## Components

### Buttons
- **Primary:** Full pill shape, solid `#DC2626` background, white label (`label-lg`), subtle top edge highlight (`inset 0 1px 0 rgba(255,255,255,0.2)`). On hover, shifts to `#B91C1C` with an active press state scaling down to `0.98`.
- **WhatsApp Action Button:** High-priority conversion button. Vibrant emerald green (`#10B981`), white icon and text, tactile hover lift, with micro-glow `0 4px 14px rgba(16, 185, 129, 0.35)`.
- **Secondary / Ghost:** Translucent zinc tone (`#F1F5F9`) with slate `#1E293B` text, shifting to `#E2E8F0` on hover.

### Live Status Badges & Radar Chips
- **Pulsating Live Pill:** Pill container with 10% opacity emerald tint (`rgba(16, 185, 129, 0.1)`), emerald text, and a live dot indicator containing a central solid 6px dot surrounded by a CSS ping animation ring (`#10B981`). Used for "En campus ahora" or "En clase".
- **Campus Location Chips:** Capsule chip (`#F1F5F9` background, `#334155` text) featuring an icon prefix: `📍 Torre A · Piso 4`. Crisp, monospaced number hierarchy (`label-sm`).

### Product Cards
- Stacked card architecture (`rounded-lg`, border `rgba(15, 23, 42, 0.08)`).
- Top asset area: 1:1 or 4:3 ratio image container featuring a top-left floating campus location chip and top-right live seller presence indicator.
- Content zone: Bold product title (`headline-sm`), punchy high-contrast currency price (`#0F172A`, weight 800), seller snippet with avatar, and an instant WhatsApp CTA button integrated directly into the card base.

### Form Inputs & Toggles
- **Search & Text Fields:** High-contrast slate borders (`#CBD5E1`), focusing to `#DC2626` with a soft 3px ring (`rgba(220, 38, 38, 0.15)`). Clean placeholder text in `#94A3B8`.
- **Live Status Toggle:** Pill switch with emerald active track (`#10B981`) and crisp white circular thumb, indicating seller presence inside university grounds.