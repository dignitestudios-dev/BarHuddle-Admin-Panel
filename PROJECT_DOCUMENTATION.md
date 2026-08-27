# BarHuddle Admin Panel — Complete Technical Documentation & Architecture Reference

---

## 1. Executive Summary & Technology Stack

**BarHuddle Admin Panel** is a modern, high-performance web administration dashboard engineered to monitor, moderate, and manage the **BarHuddle** platform (a social nightlife and venue discovery ecosystem consisting of a mobile app, venue owner web portal, and administrative control center).

### Technology Stack Specifications
* **Framework:** [Next.js 16.1.1](https://nextjs.org/) (App Router architecture, React Server Components + Client Boundary components)
* **Core Library:** [React 19.2.3](https://react.dev/)
* **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict type-checking enabled)
* **Styling & Design System:** 
  * [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/postcss`
  * [Shadcn UI](https://ui.shadcn.com/) (42+ accessible Radix-UI/Base-UI primitives)
  * [Lucide React](https://lucide.dev/) (Iconography)
  * [next-themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode foundation)
  * Typography: Google Fonts `Figtree`, `Geist Sans`, and `Geist Mono`
* **State Management:** [Redux Toolkit (RTK) 2.11.2](https://redux-toolkit.js.org/) + `react-redux 9.2.0`
* **HTTP Client:** [Axios 1.13.2](https://axios-http.com/) with request/response interceptors and automatic token injection
* **Data Visualization:** [Recharts 3.6.0](https://recharts.org/) (Area charts, Bar charts, Line charts)
* **Navigation & Progress:** [NProgress](https://ricostacruz.com/nprogress/) custom integration
* **Notifications & Feedback:** [Sonner](https://sonner.emilkowal.ski/) toast system & Radix Alert Dialogs

---

## 2. Directory Tree & Architecture Overview

```
BarHuddle-Admin-Panel/
├── app/                                 # Next.js App Router Root
│   ├── auth/                            # Authentication Flow Sub-routes
│   │   ├── forgot-password/page.tsx     # Step 1: Request OTP by email
│   │   ├── login/page.tsx               # Admin login screen
│   │   ├── reset-password/page.tsx      # Step 3: Set new password with resetToken
│   │   ├── verification/page.tsx        # Step 2: 4-digit OTP entry
│   │   └── layout.tsx                   # Split-screen branded authentication layout
│   ├── dashboard/                       # Authenticated Dashboard Application
│   │   ├── moderation/                  # Moderation Area
│   │   │   ├── content/page.tsx         # Content moderation (Posts/Media/Comments)
│   │   │   └── reports/                 # User & Venue report review
│   │   │       ├── components/          # Report dialogs (View & Resolve)
│   │   │       └── page.tsx             # Reports table & status management
│   │   ├── settings/                    # Admin Settings
│   │   │   └── security/page.tsx        # Change Password with strength meter
│   │   ├── users/                       # User Management Area
│   │   │   ├── [id]/                    # User Profile & Activity
│   │   │   │   ├── activity/page.tsx    # Attendance, Friends, Messages tabs
│   │   │   │   └── page.tsx             # User Details & Status controls
│   │   │   ├── components/              # Data tables, ban dialog, stat cards
│   │   │   ├── data.json                # User data fallback / mock reference
│   │   │   └── page.tsx                 # Users table with debounced search & filter
│   │   ├── layout.tsx                   # Inset Sidebar + Header + Container layout
│   │   └── page.tsx                     # Main Dashboard Overview & Analytics
│   ├── heavy-charts/page.tsx            # Benchmark & performance test page
│   ├── heavy-data/page.tsx              # 1000-row table benchmark test page
│   ├── test-progress/page.tsx           # NProgress visual validation page
│   ├── globals.css                      # Tailwind v4 theme, OKLCH color palette
│   ├── layout.tsx                       # Root Layout: Fonts, Providers, Progress, Offline detector
│   ├── not-found.tsx                    # Custom 404 Error page with illustrations
│   └── page.tsx                         # Root redirector (switches to /dashboard or /auth/login)
├── components/                          # Shared & Domain Components
│   ├── charts-and-graphs/               # Recharts components (Activity Trends, Stacked Area)
│   ├── ui/                              # Shadcn UI Design System Primitives (42 components)
│   ├── app-sidebar.tsx                  # Collapsible main navigation sidebar
│   ├── connection-status.tsx            # Online/offline network listener modal
│   ├── logo.tsx                         # Dynamic SVG/PNG BarHuddle logo
│   ├── nav-main.tsx                     # Hierarchical collapsible sidebar menu
│   ├── nav-user.tsx                     # User dropdown with Change Password & Logout
│   ├── progress-bar.tsx                 # Client router push/replace listener for NProgress
│   ├── ProtectedRoute.tsx               # Client-side auth guard (redirects unauthenticated)
│   ├── PublicRoute.tsx                  # Client-side guest guard (redirects authenticated)
│   ├── providers.tsx                    # Redux Provider container
│   ├── site-header.tsx                  # Header bar with sidebar trigger & Cmd+K search
│   └── site-footer.tsx                  # Footer component
├── contexts/                            # React Contexts
│   ├── sidebar-context.tsx              # Sidebar display mode configuration context
│   └── theme-context.ts                 # Theme mode context definitions
├── hooks/                               # Custom React Hooks
│   ├── use-mobile.ts                    # Responsive breakpoint hook (<768px)
│   └── use-sidebar-config.ts            # Sidebar configuration consumer hook
├── lib/                                 # Core Services & Utilities
│   ├── api/
│   │   ├── auth.api.ts                  # All Admin API endpoint definitions & TypeScript interfaces
│   │   └── axios.ts                     # Axios client instance, baseURL, interceptors
│   ├── slices/
│   │   └── authSlice.ts                 # Redux Toolkit authentication state & actions
│   ├── store.ts                         # Redux Toolkit store initialization
│   └── utils.ts                         # Tailwind clsx merger (`cn`) & cookie management helpers
├── middleware.ts                        # Edge Next.js server-side route guard & redirects
├── components.json                      # Shadcn configuration
├── next.config.ts                       # Next.js configuration
├── package.json                         # Dependencies and build scripts
└── Bar Huddle - Complete APIs.postman_collection.json # Complete Backend API collection
```

---

## 3. Security, Authentication & Session Architecture

### Dual-Storage Synchronization Strategy
Authentication tokens are stored simultaneously in **`localStorage`** and **HTTP Cookies (`document.cookie`)** to satisfy both client-side rendering and edge routing:

```
[User Action: Login / Verify OTP]
                │
                ▼
      auth.api.ts (loginApi / verifyOtpApi)
                │
         ┌──────┴─────────────────────────┐
         ▼                                ▼
localStorage.setItem('authToken')   setCookie('authToken', token, 7)
(Consumed by Axios Interceptors)     (Consumed by Next.js Edge Middleware)
         │                                │
         ▼                                ▼
Redux store.dispatch(setCredentials)  middleware.ts verifies access
```

### Route Protection Flow
1. **Edge Server Middleware (`middleware.ts`)**:
   - Reads `request.cookies.get("authToken")`.
   - If attempting to access `/dashboard/*` without `authToken` $\rightarrow$ Redirects to `/auth/login`.
   - If attempting to access `/auth/*` with `authToken` $\rightarrow$ Redirects to `/dashboard`.
   - Root `/` redirects to `/dashboard` (if authenticated) or `/auth/login` (if unauthenticated).
2. **Client Component Guard (`ProtectedRoute.tsx`)**:
   - Subscribes to Redux state `state.auth.isAuthenticated`.
   - If `false`, navigates via `router.push('/auth/login')`.
3. **Session Expiry & 401 Interception (`lib/api/axios.ts`)**:
   - Request interceptor dynamically injects `Authorization: Bearer <token>` from `localStorage`.
   - Response interceptor captures `HTTP 401 Unauthorized`, dispatches Redux `logout()`, clears storage, and redirects the browser to `/auth/login`.

---

## 4. Subsystem & Module Deep Dive

### 4.1. Authentication Subsystem (`/auth`)
* **Login (`/auth/login`)**:
  * Inputs: Email, Password (with eye toggle), Submit button with loading spinner.
  * Calls `POST /admin/login`.
  * Persists JWT, stores user profile in Redux (`setCredentials`), redirects to `/dashboard`.
* **Forgot Password Flow (`/auth/forgot-password` $\rightarrow$ `/auth/verification` $\rightarrow$ `/auth/reset-password`)**:
  * **Forgot Password**: Submits email to `POST /admin/forgot-password`, triggers OTP to email.
  * **Verification**: Interactive 4-box OTP input with auto-focus forward, backspace backward, and arrow navigation. Submits to `POST /admin/verify-otp`. Stores temporary `resetToken` in cookies & storage.
  * **Reset Password**: Enforces 8+ character password rule and match validation. Submits to `POST /admin/reset-password` with `resetToken`. On success, clears `resetToken` and redirects to login.

### 4.2. Main Dashboard & Live Analytics (`/dashboard`)
* **Live Overview KPIs**:
  * `Total Users`: Formatted count with all-time badge.
  * `Active Users`: Formatted count with live status badge.
  * `At Venues Now`: Current real-time presence across all bars with today's total check-in count.
  * `Today's Check-ins`: Daily venue attendance total.
* **Weekly Breakdown Card**:
  * Displays this week's New Users, Venue Visits, Messages Sent, and Friend Requests.
* **Activity Trends Area Chart (`components/charts-and-graphs/ChartActivityTrends.tsx`)**:
  * Period toggle: **Daily**, **Weekly**, **Monthly** (calls `GET /admin/activity-trends?period=...`).
  * Recharts AreaChart with custom gradient defs (`#gradNewUsers`, `#gradVenueVisits`, `#gradMessages`).
  * Custom hover tooltip showing individual values and UTC date formatting.
  * Dynamic summary totals in footer.

### 4.3. User Management Subsystem (`/dashboard/users`)
* **Users List Table (`/dashboard/users`)**:
  * **Stats Header**: Total Users, Active Users, Deactivated Users, Active Rate percentage.
  * **Search & Filters**: 500ms debounced search on name/email + status filter (`all`, `active`, `banned`).
  * **Table Columns**: User Avatar & Name/Email, Role badge, Email Verified badge, Profile Complete badge, Status badge, Joined Date, Actions dropdown.
  * **Server-Side Pagination**: Selectable page size (10, 25, 50), page count indicator, Previous/Next controls.
  * **User Ban / Deactivate Modal (`ban-user-dialog.tsx`)**:
    * Quick template chips for common violation reasons (*Violation of community guidelines*, *Spam content*, *Harassment*, *Fake account*).
    * Custom textarea reason field.
    * Calls `PATCH /admin/users/:id/ban`.
  * **User Activation**: Single-click `PATCH /admin/users/:id/unban`.
* **User Profile Screen (`/dashboard/users/[id]`)**:
  * Comprehensive card view: Avatar, Email, Role, Joined Date, Last Updated Date, Date of Birth, Gender, Email Verification check, Profile Completion check, and Ban reason (if banned).
  * Direct action buttons to toggle deactivation or jump to Activity Logs.
* **User Activity Logs (`/dashboard/users/[id]/activity`)**:
  * **Attendance History Tab**: Venue name, address, check-in time, checkout time, active status badge (`Active` vs `Left`) with server pagination.
  * **Friends List Tab**: Connected friendships list with avatar, name, email, gender, DOB, local search filter, and server pagination. Clickable rows redirecting to that friend's profile.
  * **Messages Tab**: Chat room / group indicator, message content preview, message type, timestamp with server pagination.

### 4.4. Moderation Subsystem (`/dashboard/moderation`)
* **Reports Review (`/dashboard/moderation/reports`)**:
  * Stat cards: Pending Review, Accepted Violations, Dismissed Reports, Total Reports.
  * Search by complaint reason + Status filter (`all`, `pending`, `resolved`) + Type filter (`all`, `user`, `venue`).
  * Reports table displaying target content, type, reporter name/email, reason snippet, date filed, status badge.
  * **View Report Dialog (`view-report-dialog.tsx`)**: Modal detailing reporter info, reported target info (user or venue with place details), exact complaint text, and resolution audit trail.
  * **Resolve Report Dialog (`resolve-report-dialog.tsx`)**:
    * Accept or Reject report resolution.
    * Integrated switch to simultaneously ban/deactivate the reported user.
    * Calls `PATCH /admin/reports/:id` with `{ status: "resolve", action: "accept" | "reject", reason, banUser }`.
* **Content Moderation (`/dashboard/moderation/content`)**:
  * Prototype view for reviewing user posts, images, videos, and comments with Approve, Reject, and Flag actions.

### 4.5. Settings & Security (`/dashboard/settings/security`)
* **Admin Change Password**:
  * Password strength evaluator (0–4 scale with real-time visual progress bar and colors: Weak, Fair, Good, Strong).
  * Strict validation: Minimum 8 characters, at least 1 uppercase letter, at least 1 number, at least 1 special character.
  * Calls `PUT /admin/update-password` with `{ currentPassword, newPassword }`.

---

## 5. Complete API Reference & Backend Capabilities

**Base URL:** `https://api.barhuddle.com/admin` (configured in `lib/api/axios.ts`)

### Summary Table of All Admin Endpoints

| Category | Method | Endpoint | Status in Frontend | Description / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/login` | Implemented | Admin email & password login |
| **Auth** | `POST` | `/forgot-password` | Implemented | Send password reset OTP |
| **Auth** | `POST` | `/verify-otp` | Implemented | Verify OTP & receive `resetToken` |
| **Auth** | `POST` | `/reset-password` | Implemented | Reset password with `resetToken` |
| **Auth** | `PUT` | `/update-password` | Implemented | Change password for authenticated admin |
| **Auth** | `GET` | `/profile` | Implemented | Get logged-in admin profile |
| **Dashboard** | `GET` | `/dashboard` | Implemented | Returns overall stats & weekly analytics |
| **Dashboard** | `GET` | `/activity-trends` | Implemented | Query: `?period=daily\|weekly\|monthly` |
| **Users** | `GET` | `/users` | Implemented | Query: `?page=1&limit=10&filter=all&search=...` |
| **Users** | `GET` | `/users/:id` | Implemented | Get detailed user record by ID |
| **Users** | `PATCH` | `/users/:id/ban` | Implemented | Body: `{ reason: string }` |
| **Users** | `PATCH` | `/users/:id/unban` | Implemented | Unban / reactivate user |
| **Users** | `DELETE` | `/users/:id` | Implemented | Delete user account |
| **Users** | `GET` | `/users/:id/activity` | Implemented | Query: `?filter=history\|friends\|message` |
| **Reports** | `GET` | `/reports` | Implemented | Query: `?page=1&limit=10&search=&status=&action=&type=` |
| **Reports** | `GET` | `/reports/:id` | Implemented | Get report record by ID |
| **Reports** | `PATCH` | `/reports/:id` | Implemented | Body: `{ status: "resolve", action: "accept"\|"reject", reason, banUser }` |
| **Venue Claims** | `GET` | `/venue-owners` | Implemented | Query: `?page=1&limit=10&status=pending` |
| **Venue Claims** | `PUT` | `/venue-owners/:id` | Implemented | Body: `{ status: "approved" }` or `{ status: "revoked" }` |
| **Featured Venues**| `POST` | `/featured-venues` | **Backend Ready** | Body: `{ venueId, order, isActive }` |
| **Featured Venues**| `GET` | `/featured-venues` | **Backend Ready** | List featured venues with order & status |
| **Featured Venues**| `PUT` | `/featured-venues/:id` | **Backend Ready** | Body: `{ order, isActive }` |
| **Featured Venues**| `DELETE` | `/featured-venues/:id` | **Backend Ready** | Remove venue from featured list |
| **Analytics** | `GET` | `/analytics` | **Backend Ready** | Deep platform metrics & aggregates |
| **Attendance** | `GET` | `/attendance` | **Backend Ready** | Query: `?page=1&limit=10` global check-ins log |
| **Active Users** | `GET` | `/users/active` | **Backend Ready** | Query: `?page=1&limit=10` list of active users |

---

## 6. Blueprint for Adding New Modules & Features

When building a new module (for example, **Venue Owner Claims Management** or **Featured Venues**), follow this standardized 5-step workflow:

### Step 1: Define API Service Functions in `lib/api/auth.api.ts`
Define TypeScript interfaces matching the backend response and export the helper:
```typescript
export interface VenueOwnerClaim {
  _id: string;
  user: { _id: string; name: string; email: string };
  venue: { _id: string; name: string; address: string };
  status: "pending" | "approved" | "revoked";
  createdAt: string;
}

export const getVenueClaimsApi = async (page = 1, limit = 10, status = "pending") => {
  const response = await API.get('/venue-owners', { params: { page, limit, status } });
  return response.data;
};

export const updateVenueClaimStatusApi = async (claimId: string, status: "approved" | "revoked") => {
  const response = await API.put(`/admin/venue-owners/${claimId}`, { status });
  return response.data;
};
```

### Step 2: Register the Route in `components/app-sidebar.tsx`
Add your new section or item to `data.navGroups`:
```typescript
{
  label: "Venues",
  items: [
    {
      title: "Owner Claims",
      url: "/dashboard/venues/claims",
      icon: Building2,
    },
    {
      title: "Featured Venues",
      url: "/dashboard/venues/featured",
      icon: Star,
    },
  ],
}
```

### Step 3: Create Page Routes under `app/dashboard/[module]/`
Create `app/dashboard/venues/claims/page.tsx`.
* Use React `useState`, `useEffect`, `useCallback` for server pagination and search.
* Use Shadcn components: `<Table>`, `<Badge>`, `<Button>`, `<Card>`, `<Input>`, `<Select>`.
* Wrap in `@container/main` container layout for responsive presentation.

### Step 4: Add Action Dialogs / Forms in `components/`
Use Shadcn `<Dialog>`, `<AlertDialog>`, or `<Sheet>` for approval/rejection confirmation dialogs.

### Step 5: Verify Type Safety & Build
Execute `npx tsc --noEmit` to ensure zero compilation or lint errors.

---

## 7. Current Health & Development Commands

* **Development Server:** `npm run dev` (Runs on `http://localhost:3000`)
* **Production Build:** `npm run build`
* **Production Start:** `npm run start`
* **Type Checking:** `npx tsc --noEmit`
* **ESLint Checking:** `npm run lint`
