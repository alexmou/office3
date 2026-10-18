---
name: Button Rouge
description: Multi-store operations interface for daily retail work
colors:
  brand-primary: "#db3455"
  surface: "#ffffff"
  surface-muted: "#f9f9f9"
  ink: "#212529"
  border: "#e5e7eb"
  settings-teal: "#176c63"
typography:
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  page-title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.15rem, 2.2vw, 1.5rem)"
    fontWeight: 800
    lineHeight: 1.15
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  compact: "6px"
  control: "8px"
  panel: "12px"
  pill: "999px"
spacing:
  compact: "8px"
  row: "12px"
  section: "16px"
  spacious: "24px"
components:
  app-topbar:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.surface}"
    height: "52px"
  settings-primary-button:
    backgroundColor: "{colors.settings-teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.compact}"
    padding: "8px 14px"
    height: "40px"
---

# Design System: Button Rouge

## Overview

**Creative North Star: "Старый кастомный дизайн"**

Button Rouge is a browser-based operations console, not a marketing site. Preserve its established custom character: a branded magenta application shell around compact, task-oriented pages. The active interface is modular rather than governed by one complete component library; page-local accents are part of the observed system, not a license to invent a new visual identity.

**Key Characteristics:**
- Magenta fixed app bar and light page-title strip
- Dense operational tables, filters, forms, calendars, and dialogs
- Page-scoped blue, teal, and chart palettes
- Mostly flat surfaces; elevation marks overlays and persistent navigation

## Colors

The shared shell is magenta, white, and charcoal. Individual modules retain local interaction and data-series colors; these are not interchangeable global tokens.

### Primary
- **Button Rouge Magenta** (`{colors.brand-primary}`): Shared app bar and brand identity.

### Neutral
- **Canvas White** (`{colors.surface}`): Main working surface and form background.
- **Soft Gray Canvas** (`{colors.surface-muted}`): Subtle page and calendar surfaces.
- **Charcoal Ink** (`{colors.ink}`): Default body text.
- **Cool Border** (`{colors.border}`): Table, field, and surface boundaries.

### Local Accents
- Settings uses a dark teal action color (`{colors.settings-teal}`). Budget and chart pages use their own blue, teal, orange, red, and violet accents. Keep these scoped to their existing modules unless a shared token is deliberately introduced.

## Typography

**Body Font:** System UI sans-serif stack. Schedule hour values use a monospace face for numeric scanning.

**Character:** Compact and utilitarian. Most pages use a default system sans-serif; cash-register and selected data surfaces make local font choices. There is no shared display typeface.

### Hierarchy
- **Page title** (`{typography.page-title}`): App title strip, with responsive sizing currently defined in the shell.
- **Body** (`{typography.body}`): Main controls, tables, and operational copy.
- **Label** (`{typography.label}`): Form labels, tabs, and emphasized controls; exact sizes vary by module.

## Layout

The shared shell places a fixed brand bar above a light page-title strip, then loads 15 active page modules from `system/pageConfig.js`, alongside the shared header. Work surfaces favor wide tables and filter toolbars; dialogs contain editing forms. Existing responsive breakpoints are page-specific (roughly 480–1024px), not a single system scale. Several table views intentionally scroll inside their wrappers; the schedule's seven-column month grid has no mobile-specific layout.

## Elevation & Depth

Surfaces are mostly flat with borders. Shadows are reserved for the fixed app header, navigation drawer, dialogs, and a small number of analytical panels. Do not use elevation as decoration on every table or form.

## Shapes

Controls and panels use modest, page-local corners, commonly 6–12px. Status badges and employee labels may be pill-shaped. The codebase does not yet enforce a single radius token across modules.

## Components

### Navigation
- The fixed top bar uses the brand color, white text, store context, user identity, and logout action.
- The page title strip is a light surface with a subtle divider.
- The slide-out navigation reuses the brand color and vertically stacked links.

### Buttons
- The shell and modules have distinct button variants. Settings uses a teal primary action; other pages use local blue, green, or neutral actions.
- Keep action labels explicit and provide a visible keyboard focus state. Do not assume every primary action is magenta.

### Inputs / Fields
- White controls use a thin neutral border and compact padding. Focus treatment varies by module; preserve a visible outline or equivalent ring.

### Tables / Data Views
- Dense rows, sticky headers, filters, and contained horizontal scrolling support repeated operational work. On narrow screens, keep scrolling within the data region rather than forcing the whole page sideways.

### Dialogs
- White dialogs sit above a dimmed page with a stronger shadow. Preserve clear title, close, cancel, and save actions, plus keyboard focus management.

## Do's and Don'ts

### Do:
- **Do** preserve the magenta shared shell and the task-first, information-dense page structure.
- **Do** keep module-specific data colors scoped and document them before promoting them to global tokens.
- **Do** maintain at least 4.5:1 contrast for normal text and visible keyboard focus for every control.
- **Do** constrain horizontal scrolling to wide tables and data regions.

### Don't:
- **Don't** carry over the previous Notion marketing palette, hero bands, pricing cards, or marketing copy; they are not part of this product.
- **Don't** claim a unified component or token system where the implementation is page-scoped.
- **Don't** use color alone to communicate status or chart meaning.
- **Don't** hide native focus outlines without an equally visible replacement.
