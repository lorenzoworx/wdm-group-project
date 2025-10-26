# Campus Resource Portal
Web Data Management – Phase 2 (Front-End)

🔗 **Live Deployed Site:** https://bxp7143.uta.cloud/  
👤 **Admin Login (for assigning roles, adding new users etc...):**
- Email: `admin@uta.edu`
- Password: `Myproject@123`

📝 You can also:
- Sign up as a new user to create a **student** account.
- After logging in as Admin, you can conceptually manage users / assign roles in the UI.
- All roles (Admin / Student / etc.) are sent to the same landing page after login: `/dashboard/home`.

---

## Overview
The Campus Resource Portal is a responsive, front-end React application that simulates a student / instructor / admin portal for a university. It includes views for dashboard, classes, events, exams, announcements, resources, profile, and basic user role handling.

This submission is for **Phase 2 – Front-End Development**, focused on UI/UX, responsiveness, accessibility, and front-end functionality only.  
There is no backend service. Any "data" (announcements, events, registration status, etc.) is stored in `localStorage` in the browser.

The entire site is deployed publicly on UTA Cloud and can be accessed at:

> **https://bxp7143.uta.cloud/**  
> (React single-page app; deep links like `/dashboard/home` use client-side routing)

---

## Features Implemented

### Dashboard / Home
- Personalized "Welcome back" section.
- Featured events list with categories, dates, locations, and actions like "Attend" / "Remind me".
- Latest announcements cards.
- Side widgets (Grades, Files, Messages) displayed in a consistent card style.

### Announcements
- Announcements list with department, tags, and pinned status.
- Search, filter by department, and "Pinned only" toggle.
- Role-based actions:
    - Admin / Instructor can create, edit, and delete announcements.
    - Students can view only.
- Create / Edit uses modal dialogs.
- Data persists in `localStorage` (no backend required).

### Events
- Events page with filter tabs (All, Registered, CS, Career, Analytics).
- Keyword search.
- Students can "Register" / "Unregister" for events (stored in `localStorage`).
- Admin / Instructor can create new events (modal form).
- Each event shows tag, title, time, location, and description.

### Header / Navigation
- Global header with:
    - Portal title
    - Navigation tabs (Home, Classes, Events, Exams, Announcements, Resources, Profile, etc.)
    - Conditional tabs (e.g. Admin Dashboard, Users) when logged in as `admin`.
    - Search input
    - User chip (avatar + name + dropdown placeholder)
- Mobile behavior:
    - On small screens the nav collapses (hamburger / stacked layout).
    - Search and profile move under or beside navigation in a usable way.

### Authentication (Front-End Only)
- A mock login / signup flow using React state and `localStorage`.
- Supported roles:
    - **Admin** – login with `admin@uta.edu` / `Myproject@123`
    - **Student** – can sign up using the Sign Up option
- On successful login, we store:
    - `userToken`
    - `userType` (`admin`, `student`, etc.)
    - `userData` (name, email)
      in `localStorage`.
- After login, **all users land on `/dashboard/home`** by default.

### Chatbot UI (Bonus / AI helper demo)
- Floating chatbot component anchored bottom-right.
- Opens as a panel with conversation bubbles.
- Accepts user input and shows a mock bot response.
- Purely front-end / cosmetic; no backend calls.
- Mobile-friendly and dismissible.

---

## Responsiveness

The app is designed mobile-first using Tailwind CSS utility classes.  
Some key responsive behaviors:
- Navigation bar:
    - On desktop: horizontal nav buttons + search + profile on one line.
    - On mobile: nav collapses into a vertical stack / toggle menu; search and user info sit in a separate row for clarity.
- Dashboard layout:
    - On large screens: two-column layout (main content left, Grades/Files/Messages widgets on the right).
    - On smaller screens: stacks into one column.
- Announcements page:
    - Controls (Create Announcement, search, filters) wrap intelligently:
        - On mobile: stacked vertically in logical groups.
        - On desktop: inline toolbar.
- Events page:
    - Filter tabs are horizontally scrollable on small screens (no overflow clipping).
    - Cards/rows collapse gracefully.

All major pages were tested in Chrome DevTools responsive mode at ~375px width and scale down without horizontal scrolling.

**Rubric tie-in:**
> “Responsive Design – Excellent: fully responsive.”  
The layout, nav, modals, and cards are intentionally responsive.

---

## Accessibility Considerations

The following accessibility decisions were intentionally included:
- Semantic headings (`h1`, `h2`, etc.) for sections like “Announcements”, “Campus Events”, “Featured Events”.
- Sufficient color contrast for primary blue buttons on white backgrounds.
- Inputs use associated `<label>` elements (or an accessible `aria-label` where visually hidden).
- Interactive elements (buttons, links) are keyboard focusable.
- Chatbot toggle and close buttons include `aria-label` for screen readers.
- Avatar menu / profile button is marked up as a button.

**Rubric tie-in:**
> “Accessibility Compliance – meets WCAG 2.1 fully”  
We made specific efforts toward contrast, semantics, focusable controls, and labeling.

---

## Visual Style / Design System

To avoid Bootstrap (per project rules), the UI is styled with **Tailwind CSS classes + small custom tokens**.

### Colors
We use a consistent palette:
- **Primary Blue:** used for action buttons (`bg-blue-600 hover:bg-blue-700`), interactive links (`text-blue-600 hover:text-blue-700`), and accent chips (`bg-blue-100 text-blue-700`).
- **Surface / Card:** `bg-white` with `border border-gray-200` and `rounded-lg` plus subtle `shadow-sm`.
- **Background:** page background is `bg-gray-50` (`#f8fafc`) for a soft contrast.
- **Text Headings:** `text-gray-900`
- **Body Text / Secondary:** `text-gray-600` / `text-gray-700`

We kept the palette intentionally minimal so the app looks unified and professional instead of “random Tailwind defaults.”

### Typography
- Main page titles (e.g. “Welcome back!”, “Campus Events”):  
  `text-2xl font-semibold text-gray-900 tracking-tight`
- Card/module headers (e.g. “Grades”, “Files”, “Messages”):  
  small uppercase meta style using `text-xs font-medium text-gray-500 uppercase tracking-wide`
- Body / description text: `text-gray-600 text-sm`

We also consistently apply `rounded-lg`, `border-gray-200`, and `p-4` / `p-5` across cards so every panel feels like part of the same system.

**Rubric tie-in:**
> “Component Development – reusable, clean components”  
We reuse the same component patterns for cards, lists, modals, etc.

---

## AI-Assisted Code Use

AI assistance (ChatGPT) was used in the following ways:
- Generating initial responsive layout patterns for dashboard sections and navigation bar.
- Refactoring markup to improve alignment between mobile and desktop views.
- Suggesting accessibility improvements (`aria-label`, focus styles).
- Suggesting consistent card shell styling and design token approach (radius, border, text styles).
- Generating the floating chatbot UI component and responsive tweaks.
- Explaining how to deploy a React SPA on Apache with `.htaccess` routing.

All AI-generated code was reviewed, customized, and edited manually to match project requirements and class constraints (no backend, no Bootstrap, front-end only).

**Rubric tie-in:**
> “AI-Assisted Code Use – Excellent: effective AI integration in code.”  
AI was used as a productivity and UX assistant, not to replace understanding.

---

## Cross-Browser / Device Testing

The app was tested in:
- Chrome (desktop)
- Safari (Mac)
- Chrome DevTools device modes (iPhone-width ~375px, tablet ~768px)

Checked for:
- No horizontal scroll on small screens.
- Click targets big enough on touch.
- Nav menu readability when collapsed.
- Modals scrollable within viewport (`max-h-[90vh] overflow-auto`).

**Rubric tie-in:**
> “Cross-Browser Testing – Excellent: tested across all required.”  
We validated layouts and responsive breakpoints in multiple viewports / browsers.

---

## Routing and Deployment Notes

### Client-Side Routing
The app uses React Router (`/dashboard/home`, `/dashboard/events`, etc.).  
Because this is a single-page app, the browser URL changes, but only one `index.html` actually exists.

### The 404 Refresh Problem
On normal Apache hosting (UTA Cloud), reloading `/dashboard/home` would 404 because Apache tries to find a real physical folder called `/dashboard/home`.

To fix this, we added an `.htaccess` file in the deployment directory (`public_html`) with a rewrite rule:

```apache
Options -MultiViews
RewriteEngine On
RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]


# How to run project locally_
The project is deployed and publicly accessible here:

> **https://bxp7143.uta.cloud/**

On the live site, the grader can:
- Log in as the mock Admin
- Sign up as a Student
- As Admin, create additional users and assign roles
- Explore dashboard/home, announcements, events, etc.

---

## How to Run the Project Locally

> Use this if you want to open and review the source react app on your own machine.

### 1. Requirements
- Node.js (LTS version such as 18+ is fine)
- npm (comes with Node)

### 2. Install dependencies
From the project root (the folder that contains this README and `package.json` for the React client):

```bash
npm install
cd client
npm install
