# UI/UX Brief & Interface Guidelines

---

## 1. Design Aesthetics & Visual Tokens

The user interface of VendorBridge is built with a premium **glassmorphism** design language tailored for modern dark mode and light mode ERP systems. It is responsive, highly interactive, and designed to look premium.

### 1.1 Styling Tokens (CSS Variables)

We will use CSS variables in `style.css` to manage theme states and colors:

```css
:root {
  /* Common Palette */
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Outfit', sans-serif;
  --radius-lg: 12px;
  --radius-md: 8px;
  --radius-sm: 4px;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Dark Theme Variables */
  --bg-color: #0b0f19;
  --sidebar-bg: rgba(15, 23, 42, 0.85);
  --card-bg: rgba(30, 41, 59, 0.5);
  --card-border: rgba(255, 255, 255, 0.08);
  --text-color: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: rgba(255, 255, 255, 0.1);
  --primary-color: #6366f1; /* Indigo */
  --primary-hover: #4f46e5;
  --success-color: #10b981; /* Emerald */
  --warning-color: #f59e0b; /* Amber */
  --danger-color: #ef4444;  /* Crimson */
  --glass-blur: blur(12px);
  --shadow-premium: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.light-theme {
  /* Light Theme Variables */
  --bg-color: #f8fafc;
  --sidebar-bg: rgba(255, 255, 255, 0.9);
  --card-bg: rgba(255, 255, 255, 0.7);
  --card-border: rgba(15, 23, 42, 0.06);
  --text-color: #0f172a;
  --text-muted: #64748b;
  --border-color: rgba(15, 23, 42, 0.08);
  --primary-color: #4f46e5;
  --primary-hover: #3730a3;
  --glass-blur: blur(8px);
  --shadow-premium: 0 10px 30px rgba(15, 23, 42, 0.05);
}
```

---

## 2. Layout Structure & Responsive Grid

The layout consists of a two-column workspace:

### 2.1 Navigation Sidebar (Left Column)
*   **Dimensions**: Width is fixed at `260px`, height is `100vh`. Sticky position.
*   **Backdrop**: Semi-transparent glass with `backdrop-filter: var(--glass-blur)` and thin border separation (`border-right: 1px solid var(--card-border)`).
*   **Menu Items**: Vertical stack with smooth transition states (transform offsets on hover, active indicator tabs).

### 2.2 Main Workspace (Right Column)
*   **Dimensions**: Width occupies `calc(100% - 260px)`.
*   **Header Bar**: Sticky top, same glassmorphism backing. Contains current page title, role selection switcher, and dark/light toggle.
*   **Grid Framework**: 
    *   *Metrics cards*: 4-column responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
    *   *Work panels*: 2-column or 3-column splits (`grid grid-cols-1 lg:grid-cols-3 gap-6`) for form wizards and sidebars.

---

## 3. Typography Hierarchy

Using **Google Fonts** (`Inter` for body copy, `Outfit` for display headings and numbers):

*   **Page Title**: `font-family: var(--font-display); font-size: 28px; font-weight: 700;`
*   **Section Header**: `font-family: var(--font-display); font-size: 20px; font-weight: 600;`
*   **Card Metrics / Totals**: `font-family: var(--font-display); font-size: 36px; font-weight: 700;`
*   **Table / Body Copy**: `font-family: var(--font-sans); font-size: 14px; line-height: 1.5; font-weight: 400;`
*   **Badges / Subtitle**: `font-family: var(--font-sans); font-size: 12px; font-weight: 500;`

---

## 4. UI Component States

*   **Interactive Tables**: Styled with borders, hover state highlights, and pill badges for status tags (`Draft` = Slate, `Published` = Indigo, `Submitted` = Yellow, `Approved` = Green, `Blocked` = Red).
*   **Glassmorphic Cards**: Cards are layered with `background: var(--card-bg)`, `border: 1px solid var(--card-border)`, and a subtle box-shadow.
*   **Input fields**: Styled with custom focus boundaries (`outline: none; border-color: var(--primary-color)`).

---

## 5. Animations & Micro-Interactions (Framer Motion)

Fluid UX is achieved using Framer Motion animations:

*   **Page View Transitions**: When switching dashboard routes, the page container fades in and slides up:
    *   *Properties*: `initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}`.
*   **Step Wizards (RFQ Page)**: Navigating steps causes the form sections to animate horizontally.
*   **Drawers / Modals (Add Vendor)**: Slide out from the right side:
    *   *Properties*: `initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}`.

---

## 6. Print Stylesheet Guidelines (`@media print`)

To facilitate professional document extraction, specialized print rules are applied in `style.css`:

```css
@media print {
  /* Hide UI elements */
  body, .sidebar, .header, .document-controls, .tabs-group {
    background: white !important;
    color: black !important;
    display: none !important;
  }
  
  /* Show only target printable layout */
  .workspace, .content-container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .document-card, #printable-document {
    display: block !important;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    page-break-inside: avoid !important;
  }
  
  /* Styling modifications for printing */
  .printable-frame {
    padding: 20px !important;
  }
}
```
