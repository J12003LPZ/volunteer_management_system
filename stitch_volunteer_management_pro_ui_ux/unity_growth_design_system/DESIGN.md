---
name: Unity & Growth Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 260px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is rooted in the values of community, transparency, and growth. It is designed specifically for nonprofit organizations to bridge the gap between administrative efficiency and human connection. The visual style follows a **Modern Corporate** aesthetic with a humanist touch—prioritizing clarity and ease of use to reduce cognitive load for both coordinators and volunteers.

The interface should feel reliable and established yet approachable. This is achieved through a "Soft Professionalism" approach: using high-quality typography, a calming color palette, and purposeful whitespace to create an environment that feels organized and supportive.

## Colors
The color strategy employs a primary "Trust Blue" for core navigation and actions, paired with a "Growth Green" for success states and community-centric highlights. 

- **Primary (Blue):** Symbolizes stability and professional management.
- **Secondary (Green):** Representing personal growth and environmental/social impact.
- **Surface & Background:** A clean, slightly cool gray background separates the main canvas from pure white "card" surfaces, creating subtle depth without heavy shadows.
- **Status Semantic Palette:** A comprehensive set of specific colors for volunteer lifecycle management (Active, Pending, etc.) ensures quick scannability in data-heavy tables.

## Typography
This design system utilizes **Inter** exclusively to take advantage of its exceptional legibility and systematic weights. The hierarchy is strictly defined to help users navigate complex volunteer data effortlessly.

- **Headlines:** Use tighter letter spacing and bolder weights to anchor pages.
- **Body Text:** Optimized for long-form reading in volunteer bios and opportunity descriptions.
- **Labels:** Small, semi-bold caps are used for metadata and table headers to provide clear categorization without competing with primary content.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. A persistent left sidebar (260px) provides primary navigation, while the main content area utilizes a fluid grid with a maximum container width of 1440px to prevent line lengths from becoming unreadable on ultra-wide monitors.

A 4px baseline grid ensures a consistent vertical rhythm. Generous "breathable" margins (24px) are mandated around main content cards to evoke a sense of calm and organization, moving away from the cluttered look of traditional legacy management software.

## Elevation & Depth
The design system uses **Tonal Layering** supplemented by **Ambient Shadows** to communicate hierarchy.

- **Level 0 (Background):** The base layer is a soft, cool gray (#F8FAFC).
- **Level 1 (Cards/Sidebar):** Pure white surfaces with a very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)). This is the primary container for data tables and forms.
- **Level 2 (Modals/Popovers):** Higher elevation with a more pronounced shadow (0px 12px 24px rgba(0, 0, 0, 0.08)) to focus user attention on urgent tasks or detailed entries.
- **Outlines:** Subtle 1px borders (#E2E8F0) are used on all input fields and inactive cards to maintain structure without relying on heavy shadows.

## Shapes
The shape language is defined by **Friendly Geometry**. A standard 8px (0.5rem) radius is applied to buttons, input fields, and small cards, while larger layout containers like the main dashboard cards use a 16px (1rem) radius. This "Rounded" approach softens the professional aesthetic, making the software feel more accessible and less institutional.

## Components
- **Action Buttons:** Primary buttons use solid fills with rounded corners and subtle gradients. Secondary buttons use a "Ghost" style with a 1px border.
- **Status Badges:** Compact pills with a light tinted background and dark foreground text (e.g., Active: Light Green BG, Dark Green Text).
- **Data Tables:** High-accessibility tables with 16px cell padding, sticky headers, and alternating row highlights (Zebra striping) using the background color.
- **Input Fields:** Labeled clearly above the field with an 8px radius. Active states are indicated by a 2px Primary Blue border.
- **Volunteer Profile Cards:** Use a 12px radius, featuring an avatar, name, and current status badge.
- **Navigation Sidebar:** Uses an "Active Indicator" (a vertical bar on the left of the active menu item) in Primary Blue to provide clear orientation.