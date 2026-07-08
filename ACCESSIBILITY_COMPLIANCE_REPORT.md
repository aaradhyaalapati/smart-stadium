# Accessibility Compliance Report

This document outlines the specific WCAG-conscious patterns implemented in the Smart Stadium Assistant frontend (Phase 5).

## 1. Live Regions (`aria-live`)
- **Location:** [frontend/src/components/ChatWindow.tsx](file:///e:/smartStadium/frontend/src/components/ChatWindow.tsx)
- **Implementation:** The main `.message-list` container is marked with `role="status"` and `aria-live="polite"`. As the `useChat` hook pushes new messages from the assistant into the array, screen readers will automatically and politely announce them without interrupting the user. We also use `aria-relevant="additions"` to ensure only new messages are read out.

## 2. Explicit Form Labeling
- **Location:** [frontend/src/components/ProfileSelector.tsx](file:///e:/smartStadium/frontend/src/components/ProfileSelector.tsx) and [frontend/src/components/ChatWindow.tsx](file:///e:/smartStadium/frontend/src/components/ChatWindow.tsx)
- **Implementation:** 
  - Every `<input>` and `<select>` element has a programmatically associated `<label>`. 
  - The text input for the chat has an explicitly associated `<label>` utilizing the `sr-only` class to keep the visual design clean while maintaining perfect screen reader compatibility.
  - The accessibility needs section is grouped in a `<fieldset>` with a descriptive `<legend>`.

## 3. Keyboard Navigability
- **Location:** [frontend/src/index.css](file:///e:/smartStadium/frontend/src/index.css)
- **Implementation:** The entire single-page UI is strictly accessible via keyboard (`Tab` and `Shift+Tab`). We enforced strong, visible focus states (`outline: 2px solid var(--focus-ring); outline-offset: 2px;`) across all interactive elements (inputs, selects, buttons).

## 4. Reduced Motion (`prefers-reduced-motion`)
- **Location:** [frontend/src/index.css](file:///e:/smartStadium/frontend/src/index.css)
- **Implementation:** A global `@media (prefers-reduced-motion: reduce)` query automatically zeroes out CSS transition and animation durations. Users with vestibular disorders who enable "Reduce Motion" in their OS will not see any animations (e.g., button hover fades or message pop-ins).

## 5. Mode Indicator Transparency
- **Location:** [frontend/src/components/ModeIndicator.tsx](file:///e:/smartStadium/frontend/src/components/ModeIndicator.tsx)
- **Implementation:** The UI clearly and persistently announces whether the system is operating in "Live AI Mode" or "Offline Fallback Mode". This indicator has `aria-live="polite"` so mode changes triggered by rate-limit fallbacks are immediately conveyed to the user.
