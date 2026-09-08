# The Off White — Backend Implementation Plan

> **Branch base:** `Gallery_font_latest_updates`  
> **Status:** Planning document only — no implementation started  
> **Stack target:** Cloudflare Workers + D1 + R2 + KV (already on Workers via TanStack Start)  
> **Last reviewed:** July 9, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [Shared Backend Infrastructure](#3-shared-backend-infrastructure)
4. [Database Schema (D1)](#4-database-schema-d1)
5. [API Endpoints (Complete List)](#5-api-endpoints-complete-list)
6. [Main Site — Page-by-Page Backend Requirements](#6-main-site--page-by-page-backend-requirements)
7. [Global / Shell Components](#7-global--shell-components)
8. [Admin Panel — Full Specification](#8-admin-panel--full-specification)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Notifications & Integrations](#10-notifications--integrations)
11. [Media & Asset Pipeline](#11-media--asset-pipeline)
12. [Data Conflicts to Resolve First](#12-data-conflicts-to-resolve-first)
13. [Implementation Phases](#13-implementation-phases)
14. [Environment Variables](#14-environment-variables)
15. [Testing Checklist](#15-testing-checklist)

---

## 1. Executive Summary

The Off White site is a **TanStack Start** frontend deployed on **Cloudflare Workers**. Today it is **100% static/client-side**:

- No API routes
- No database
- No environment variables
- All forms fake-submit with `setTimeout` (~1.4s)
- All content hardcoded in TSX files or bundled via `import.meta.glob`

The backend must support:

| Area | What it does |
|------|--------------|
| **Public site** | Serve CMS-managed content + accept reservations & enquiries |
| **Admin panel** | CRUD for all content, manage bookings, upload media, site settings |
| **Shared services** | Auth, email, WhatsApp links, image storage, audit logs |

**Note:** `/events` is the **Reservations** page (not an events calendar).

---

## 2. Current State Audit

### Routes (11 pages)

| Route | File | Has form? | Has filters? |
|-------|------|-----------|--------------|
| `/` | `index.tsx` | Yes (mini reserve) | — |
| `/about` | `about.tsx` | — | Image carousels |
| `/menu` | `menu.tsx` | — | Section tabs + modal |
| `/menu-2` | `menu-2.tsx` | — | Category pills + modal |
| `/menu-3` | `menu-3.tsx` | — | Category nav |
| `/the-space` | `the-space.tsx` | — | Carousel, quote rotator |
| `/gallery` | `gallery.tsx` | — | Category tabs, expand, lightbox |
| `/events` | `events.tsx` → `ReservationsPage` | **Yes (full 2-step)** | Location, occasion |
| `/contact` | `contact.tsx` | **Yes (enquiry)** | Reserve/enquiry panel cycle |
| `/level-4-dining` | `level-4-dining.tsx` | — | — |
| `/level-5-events` | `level-5-events.tsx` | **UI only (broken)** | Occasion tiles |

### Forms today (all client-only stubs)

| Form | Location | Persists? |
|------|----------|-----------|
| Full reservation (2-step) | `/events` | No |
| Mini reservation | Home `MenuAndReserve` | No |
| Private enquiry | `/contact` | No |
| Level 5 booking card | `/level-5-events` | **Button does nothing** |

### Installed but unused

- `@tanstack/react-query` — wired in root, no queries
- `react-hook-form` + `zod` — only in shadcn `form.tsx`, not in app forms
- `sonner` — toasts not mounted

---

## 3. Shared Backend Infrastructure

### 3.1 Cloudflare Services

| Service | Purpose |
|---------|---------|
| **Workers** | API routes, SSR, admin API |
| **D1** | Relational data (menu, gallery, reservations, users) |
| **R2** | Images, panoramas, documents (privacy policy PDF) |
| **KV** | Cached site settings, rate-limit counters, session tokens (optional) |
| **Queues** | Async email/SMS notification jobs |
| **Cron Triggers** | Reminder emails, stale reservation cleanup, cache refresh |

### 3.2 API Architecture

```
/api/v1/public/*     → No auth (read content, submit forms)
/api/v1/admin/*      → JWT/session auth required
/admin/*             → Admin panel SPA (separate route group or subdomain)
```

### 3.3 Cross-Cutting Concerns

| Concern | Implementation |
|---------|----------------|
| **Validation** | Zod schemas shared between frontend and Workers |
| **Rate limiting** | KV: max 5 reservation submissions / IP / hour |
| **CORS** | Restrict admin API to admin origin |
| **Error handling** | Standard JSON: `{ error, code, details? }` |
| **Audit log** | Every admin write → `audit_logs` table |
| **Soft delete** | `deleted_at` on content tables (menu, gallery) |
| **Versioning** | Optional `published_at` / `status: draft|published` on content |
| **SEO** | Public API returns meta per page for SSR head tags |
| **Caching** | `Cache-Control` on public GET; purge on admin publish |

---

## 4. Database Schema (D1)

### 4.1 `site_settings` (singleton row or key-value)

| Column | Type | Example |
|--------|------|---------|
| `key` | TEXT PK | `phone_primary` |
| `value` | TEXT | `+91 97850 55550` |
| `updated_at` | DATETIME | |
| `updated_by` | UUID FK | admin user |

**Keys to store:**

- `brand_name`, `tagline`, `copyright_year`
- `phone_primary`, `phone_display`, `whatsapp_number`
- `email_primary`, `email_events`
- `address_line1`, `address_line2`, `city`, `state`, `pincode`, `country`
- `google_maps_url`, `google_maps_embed_url`, `osm_embed_url`, `lat`, `lng`
- `instagram_url`, `facebook_url`, `tripadvisor_url`
- `privacy_policy_url`, `terms_url` (or R2 paths)
- `footer_hours_weekday`, `footer_hours_weekend`, `kitchen_close_note`
- `contact_hours_text` (unified hours for contact page)
- `reservation_confirmation_message`
- `enquiry_confirmation_message`

### 4.2 `opening_hours` (structured)

| Column | Type |
|--------|------|
| `id` | INTEGER PK |
| `day_of_week` | INTEGER (0=Sun) |
| `open_time` | TEXT (`12:00`) |
| `close_time` | TEXT (`23:00`) |
| `is_closed` | BOOLEAN |
| `location_id` | TEXT nullable (`level4`, `level5`, `all`) |

### 4.3 `menu_sections`

| Column | Type |
|--------|------|
| `id` | TEXT PK (`starters`, `mains`, …) |
| `label` | TEXT |
| `intro` | TEXT |
| `sort_order` | INTEGER |
| `is_active` | BOOLEAN |
| `show_on_menu` | BOOLEAN |
| `show_on_menu_2` | BOOLEAN |
| `show_on_menu_3` | BOOLEAN |

### 4.4 `menu_items`

| Column | Type |
|--------|------|
| `id` | TEXT PK (uuid) |
| `section_id` | TEXT FK |
| `name` | TEXT |
| `notes` | TEXT (subtitle: `Olive · Fennel · Citrus`) |
| `price` | INTEGER (paise) or TEXT |
| `price_display` | TEXT (`₹ 1,480`) |
| `image_url` | TEXT (R2) |
| `blurb` | TEXT |
| `preparation` | TEXT |
| `pairing` | TEXT |
| `allergens` | TEXT |
| `category_tags` | TEXT JSON (`["starters","chefs-picks"]`) |
| `sort_order` | INTEGER |
| `is_active` | BOOLEAN |
| `is_featured_home` | BOOLEAN (Art on a Plate) |
| `is_chefs_pick` | BOOLEAN |
| `status` | TEXT (`draft` \| `published`) |
| `created_at`, `updated_at`, `deleted_at` | DATETIME |

### 4.5 `menu_3_categories` (visual navigator only)

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `label` | TEXT |
| `hero_image_url` | TEXT |
| `sort_order` | INTEGER |
| `link_section_id` | TEXT FK nullable → scroll target on `/menu` |

### 4.6 `gallery_items`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `image_url` | TEXT |
| `thumbnail_url` | TEXT nullable |
| `label` | TEXT |
| `category` | TEXT (`all` \| `level4` \| `level5` \| `food` \| `events`) |
| `sort_order` | INTEGER |
| `is_preview` | BOOLEAN (one of 4 per category) |
| `preview_category` | TEXT nullable |
| `alt_text` | TEXT |
| `status` | TEXT |
| `created_at`, `updated_at`, `deleted_at` | DATETIME |

### 4.7 `gallery_categories`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `label` | TEXT |
| `sort_order` | INTEGER |

### 4.8 `virtual_tour_scenes`

| Column | Type |
|--------|------|
| `id` | TEXT PK (`entrance`, `arch`, `dining`) |
| `name` | TEXT |
| `label` | TEXT |
| `panorama_url` | TEXT (R2) |
| `thumbnail_url` | TEXT |
| `sort_order` | INTEGER |
| `links` | TEXT JSON (node links with yaw/pitch) |

### 4.9 `testimonials`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `quote` | TEXT |
| `author` | TEXT |
| `rating` | INTEGER (1–5) |
| `source` | TEXT (`google`, `tripadvisor`, `manual`) |
| `show_on_home` | BOOLEAN |
| `show_on_about` | BOOLEAN |
| `show_on_space` | BOOLEAN |
| `sort_order` | INTEGER |
| `is_active` | BOOLEAN |

### 4.10 `page_content` (CMS blocks per page)

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `slug` | TEXT UNIQUE (`home`, `about`, `the-space`, `level-4`, `level-5`, `contact`, `gallery`) |
| `seo_title` | TEXT |
| `seo_description` | TEXT |
| `og_title` | TEXT |
| `og_description` | TEXT |
| `hero_eyebrow` | TEXT |
| `hero_title` | TEXT |
| `hero_subtitle` | TEXT nullable |
| `hero_image_url` | TEXT nullable |
| `sections` | TEXT JSON (flexible blocks — see per-page below) |
| `status` | TEXT |
| `updated_at` | DATETIME |

### 4.11 `reservations`

| Column | Type |
|--------|------|
| `id` | TEXT PK (uuid) |
| `reference_code` | TEXT UNIQUE (`OW-20260709-0042`) |
| `date` | DATE |
| `time` | TEXT |
| `guests` | INTEGER |
| `location` | TEXT (`level4` \| `level5`) |
| `occasion` | TEXT nullable |
| `seating_preference` | TEXT nullable (home form only) |
| `name` | TEXT |
| `phone` | TEXT |
| `email` | TEXT nullable |
| `special_request` | TEXT nullable |
| `source` | TEXT (`events_full`, `home_mini`, `admin_manual`) |
| `status` | TEXT (`pending`, `confirmed`, `cancelled`, `completed`, `no_show`) |
| `admin_notes` | TEXT nullable |
| `ip_address` | TEXT nullable |
| `user_agent` | TEXT nullable |
| `confirmed_at` | DATETIME nullable |
| `cancelled_at` | DATETIME nullable |
| `created_at` | DATETIME |

### 4.12 `enquiries`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `reference_code` | TEXT UNIQUE |
| `type` | TEXT (`private_event`, `level5_booking`, `general`) |
| `name` | TEXT |
| `email` | TEXT |
| `phone` | TEXT nullable |
| `occasion` | TEXT |
| `date` | DATE nullable |
| `time` | TEXT nullable |
| `guests` | TEXT nullable |
| `message` | TEXT nullable |
| `status` | TEXT (`new`, `in_progress`, `closed`) |
| `admin_notes` | TEXT nullable |
| `source` | TEXT (`contact`, `level5`, `admin`) |
| `created_at` | DATETIME |

### 4.13 `reservation_settings`

| Column | Type |
|--------|------|
| `id` | INTEGER PK |
| `location` | TEXT |
| `time_slot` | TEXT |
| `max_guests_per_slot` | INTEGER |
| `is_active` | BOOLEAN |

### 4.14 `blackout_dates`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `date` | DATE |
| `location` | TEXT nullable (null = all) |
| `reason` | TEXT |
| `created_by` | UUID |

### 4.15 `admin_users`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `email` | TEXT UNIQUE |
| `password_hash` | TEXT |
| `name` | TEXT |
| `role` | TEXT (`super_admin`, `manager`, `editor`, `reservations_only`) |
| `is_active` | BOOLEAN |
| `last_login_at` | DATETIME |
| `created_at` | DATETIME |

### 4.16 `admin_sessions`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `user_id` | TEXT FK |
| `token_hash` | TEXT |
| `expires_at` | DATETIME |
| `created_at` | DATETIME |

### 4.17 `audit_logs`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `user_id` | TEXT FK |
| `action` | TEXT (`create`, `update`, `delete`, `publish`, `login`) |
| `entity_type` | TEXT |
| `entity_id` | TEXT |
| `changes` | TEXT JSON |
| `ip_address` | TEXT |
| `created_at` | DATETIME |

### 4.18 `media_library`

| Column | Type |
|--------|------|
| `id` | TEXT PK |
| `filename` | TEXT |
| `original_filename` | TEXT |
| `mime_type` | TEXT |
| `size_bytes` | INTEGER |
| `r2_key` | TEXT |
| `public_url` | TEXT |
| `width` | INTEGER nullable |
| `height` | INTEGER nullable |
| `alt_text` | TEXT nullable |
| `folder` | TEXT (`dishes`, `gallery`, `heroes`, `panos`, `logos`) |
| `uploaded_by` | TEXT FK |
| `created_at` | DATETIME |

---

## 5. API Endpoints (Complete List)

### 5.1 Public — Content (GET)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/v1/public/settings` | Site settings + hours + social |
| GET | `/api/v1/public/menu` | All published sections + items |
| GET | `/api/v1/public/menu/sections/:id` | Single section |
| GET | `/api/v1/public/menu/items/:id` | Single dish detail |
| GET | `/api/v1/public/menu-3/categories` | Menu-3 navigator categories |
| GET | `/api/v1/public/gallery` | Gallery items (optional `?category=`) |
| GET | `/api/v1/public/gallery/preview/:category` | 4 preview images per category |
| GET | `/api/v1/public/testimonials` | Active testimonials (`?page=home`) |
| GET | `/api/v1/public/pages/:slug` | Page CMS content + SEO |
| GET | `/api/v1/public/virtual-tour` | Tour scenes + links |
| GET | `/api/v1/public/featured-dishes` | Home "Art on a Plate" items |
| GET | `/api/v1/public/reservation-config` | Time slots, guest limits, occasions, locations |
| GET | `/api/v1/public/availability?date=&location=` | Available slots for a date |

### 5.2 Public — Submissions (POST)

| Method | Endpoint | Body | Actions |
|--------|----------|------|---------|
| POST | `/api/v1/public/reservations` | Reservation payload | Validate → check availability → save → email admin + guest SMS optional → return reference |
| POST | `/api/v1/public/enquiries` | Enquiry payload | Validate → save → email events team → return reference |
| POST | `/api/v1/public/contact` | General contact (if added) | Optional future endpoint |

### 5.3 Admin — Auth

| Method | Endpoint | Actions |
|--------|----------|---------|
| POST | `/api/v1/admin/auth/login` | Email + password → JWT/session cookie |
| POST | `/api/v1/admin/auth/logout` | Invalidate session |
| POST | `/api/v1/admin/auth/refresh` | Refresh token |
| GET | `/api/v1/admin/auth/me` | Current user + permissions |
| POST | `/api/v1/admin/auth/forgot-password` | Send reset email |
| POST | `/api/v1/admin/auth/reset-password` | Reset with token |

### 5.4 Admin — Dashboard

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/dashboard/stats` | Today's reservations, pending enquiries, recent activity |

### 5.5 Admin — Reservations

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/reservations` | List (filter: date, status, location, search) |
| GET | `/api/v1/admin/reservations/:id` | Detail |
| POST | `/api/v1/admin/reservations` | Manual booking |
| PATCH | `/api/v1/admin/reservations/:id` | Update status, notes, date/time |
| DELETE | `/api/v1/admin/reservations/:id` | Soft cancel |
| POST | `/api/v1/admin/reservations/:id/confirm` | Confirm + trigger email |
| POST | `/api/v1/admin/reservations/:id/cancel` | Cancel + notify guest |
| GET | `/api/v1/admin/reservations/export` | CSV export (date range) |

### 5.6 Admin — Enquiries

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/enquiries` | List (filter: status, type) |
| GET | `/api/v1/admin/enquiries/:id` | Detail |
| PATCH | `/api/v1/admin/enquiries/:id` | Update status, notes |
| DELETE | `/api/v1/admin/enquiries/:id` | Archive |

### 5.7 Admin — Menu

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/menu/sections` | List all |
| POST | `/api/v1/admin/menu/sections` | Create section |
| PATCH | `/api/v1/admin/menu/sections/:id` | Update |
| DELETE | `/api/v1/admin/menu/sections/:id` | Soft delete |
| POST | `/api/v1/admin/menu/sections/reorder` | Drag-drop sort |
| GET | `/api/v1/admin/menu/items` | List (filter: section, status) |
| POST | `/api/v1/admin/menu/items` | Create item |
| PATCH | `/api/v1/admin/menu/items/:id` | Update |
| DELETE | `/api/v1/admin/menu/items/:id` | Soft delete |
| POST | `/api/v1/admin/menu/items/reorder` | Reorder within section |
| POST | `/api/v1/admin/menu/items/:id/publish` | Publish draft |
| POST | `/api/v1/admin/menu/items/:id/duplicate` | Clone item |

### 5.8 Admin — Gallery

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/gallery` | List all |
| POST | `/api/v1/admin/gallery` | Create item |
| PATCH | `/api/v1/admin/gallery/:id` | Update label, category, preview flag |
| DELETE | `/api/v1/admin/gallery/:id` | Soft delete |
| POST | `/api/v1/admin/gallery/reorder` | Sort order |
| POST | `/api/v1/admin/gallery/bulk-upload` | Multi-image upload |
| POST | `/api/v1/admin/gallery/set-preview` | Set 4 preview images per category |

### 5.9 Admin — Virtual Tour

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/virtual-tour/scenes` | List |
| POST | `/api/v1/admin/virtual-tour/scenes` | Create scene |
| PATCH | `/api/v1/admin/virtual-tour/scenes/:id` | Update panorama, links |
| DELETE | `/api/v1/admin/virtual-tour/scenes/:id` | Remove |
| POST | `/api/v1/admin/virtual-tour/scenes/reorder` | Reorder |

### 5.10 Admin — Testimonials

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/testimonials` | List |
| POST | `/api/v1/admin/testimonials` | Create |
| PATCH | `/api/v1/admin/testimonials/:id` | Update |
| DELETE | `/api/v1/admin/testimonials/:id` | Soft delete |
| POST | `/api/v1/admin/testimonials/reorder` | Reorder |

### 5.11 Admin — Pages (CMS)

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/pages` | List all pages |
| GET | `/api/v1/admin/pages/:slug` | Get page content |
| PATCH | `/api/v1/admin/pages/:slug` | Update hero, SEO, sections JSON |
| POST | `/api/v1/admin/pages/:slug/publish` | Publish changes |

### 5.12 Admin — Site Settings

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/settings` | All settings |
| PATCH | `/api/v1/admin/settings` | Bulk update |
| GET | `/api/v1/admin/settings/hours` | Opening hours |
| PUT | `/api/v1/admin/settings/hours` | Replace hours schedule |
| GET | `/api/v1/admin/settings/reservation-config` | Slots, occasions |
| PUT | `/api/v1/admin/settings/reservation-config` | Update config |
| GET | `/api/v1/admin/blackout-dates` | List |
| POST | `/api/v1/admin/blackout-dates` | Add blackout |
| DELETE | `/api/v1/admin/blackout-dates/:id` | Remove |

### 5.13 Admin — Media Library

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/media` | List (filter: folder, search) |
| POST | `/api/v1/admin/media/upload` | Upload to R2 → save metadata |
| PATCH | `/api/v1/admin/media/:id` | Update alt text, folder |
| DELETE | `/api/v1/admin/media/:id` | Delete from R2 + DB |
| POST | `/api/v1/admin/media/upload-url` | Presigned upload URL (optional) |

### 5.14 Admin — Users

| Method | Endpoint | Actions |
|--------|----------|---------|
| GET | `/api/v1/admin/users` | List admin users |
| POST | `/api/v1/admin/users` | Create user |
| PATCH | `/api/v1/admin/users/:id` | Update role, active |
| DELETE | `/api/v1/admin/users/:id` | Deactivate |
| GET | `/api/v1/admin/audit-logs` | View audit trail |

---

## 6. Main Site — Page-by-Page Backend Requirements

---

### 6.1 Home (`/`)

**File:** `src/routes/index.tsx` + section components

#### Sections & backend needs

| Section | Component | Backend data |
|---------|-----------|--------------|
| **Hero** | `Hero.tsx` | `page_content.home`: title, subtitle, CTA links, background image/video |
| **Story** | `Story.tsx` | Story eyebrow, heading, body copy, CTA text, story image |
| **Art on a Plate** | `Dishes.tsx` | 4 featured `menu_items` where `is_featured_home = true` (name, notes, image) |
| **The Space** | `Space.tsx` | 4 space preview tiles (image, title, link) — CMS block or gallery subset |
| **Menu & Reserve** | `MenuAndReserve.tsx` | Menu preview categories (3 cols), mini reservation form |
| **Testimonials** | `Testimonials.tsx` | `testimonials` where `show_on_home = true` |

#### Home — Mini Reservation Form (`MenuAndReserve.tsx`)

**Current fields:**

| Field | Type | Required | Backend field |
|-------|------|----------|---------------|
| `name` | text | Yes | `name` |
| `phone` | text | Yes | `phone` |
| `date` | date | Yes | `date` |
| `time` | select | Yes | `time` (8 options: 12:30–21:00) |
| `guests` | select | Yes | `guests` (1–8) |
| `pref` | select | Optional | `seating_preference` |

**Backend actions on submit:**

1. Validate all fields (Zod)
2. Validate phone (10 digits, India)
3. Validate date ≥ today
4. Check slot availability (optional for mini form)
5. Create `reservations` row with `source = 'home_mini'`
6. Generate reference code
7. Queue notification email to admin
8. Return success + reference to frontend
9. Rate-limit by IP

**Admin panel:** Reservations list shows `source` badge; filter by source.

---

### 6.2 About (`/about`)

**File:** `src/routes/about.tsx`

#### Content blocks (all CMS-managed via `page_content.about.sections` JSON)

| Block | Fields |
|-------|--------|
| **Page hero** | eyebrow, title, subtitle, hero image |
| **Philosophy section** | heading, paragraphs[], rotating images[] (3) |
| **Values** | 3× { icon/key, title, description } |
| **Stats** | 4× { number, label } |
| **Kitchen quote** | quote text, chef name, rotating images[] |
| **Testimonials** | from `testimonials` where `show_on_about = true` |
| **SEO meta** | title, description, og tags |

#### Backend actions

- **GET** `/api/v1/public/pages/about` on page load (SSR or client)
- Image carousel URLs from R2
- No forms on this page

#### Admin panel actions

- Edit all text blocks
- Upload/replace carousel images
- Toggle which testimonials appear
- Preview before publish

---

### 6.3 Menu (`/menu`)

**File:** `src/routes/menu.tsx`

#### Current data model (20 items, 4 sections)

**Sections:** Starters (5), Mains (6), Desserts (4), Cocktails (5)

**Per item fields:**

| Field | Admin editable |
|-------|----------------|
| `name` | Yes |
| `notes` | Yes |
| `price` / `price_display` | Yes |
| `image` | Yes (media library) |
| `blurb` | Yes |
| `preparation` | Yes |
| `pairing` | Yes |
| `allergens` | Yes |
| `section_id` | Yes |
| `sort_order` | Yes (drag-drop) |
| `is_active` | Yes |

#### Frontend interactions needing backend

| Action | Backend |
|--------|---------|
| Load page | GET `/api/v1/public/menu` |
| Tab filter (Starters/Mains/Desserts/Cocktails) | Client-side filter on sections |
| Click item row | GET item detail (or from cached menu) |
| Modal: Reserve CTA | Link to `/events#book` with optional query prefill (`?guests=2`) |
| Tax disclaimer text | `page_content.menu` or `site_settings` |

#### Admin panel — Menu page

- Section CRUD (label, intro, visibility per menu variant)
- Item CRUD with rich text fields
- Image picker from media library
- Drag-drop reorder (sections + items)
- Draft / publish workflow
- Duplicate item
- Bulk import CSV (optional phase 2)
- Price history (optional phase 2)

---

### 6.4 Menu 2 (`/menu-2`)

**File:** `src/routes/menu-2.tsx`

#### Differences from `/menu`

- Visual grid layout (8 dishes currently)
- Category filter pills: **All, Starters, Mains, Cocktails, Chef's Picks**
- Same modal detail fields

#### Backend

- Same `menu_items` table
- Filter by `category_tags` JSON array
- `is_chefs_pick` boolean flag
- `show_on_menu_2` on sections/items

#### Admin

- Toggle "Show on Menu 2" per item
- Tag items as Chef's Pick
- Preview grid layout

---

### 6.5 Menu 3 (`/menu-3`)

**File:** `src/routes/menu-3.tsx`

#### Current behavior

- 7 category buttons with hero image swap only
- Links to `/menu` (no dish list on this page)

#### Backend

- `menu_3_categories` table
- Per category: `label`, `hero_image_url`, `sort_order`, optional `link_section_id`

#### Admin

- CRUD categories
- Upload hero image per category
- Reorder categories
- Link category → menu section anchor

---

### 6.6 The Space (`/the-space`)

**File:** `src/routes/the-space.tsx`

#### Content blocks

| Block | Data |
|-------|------|
| **Hero** | Title, subtitle, CTA, hero layout |
| **Image grid** | 5 images with aspect roles (1 portrait + 4 squares) |
| **Memories carousel** | 5 slides: image + caption |
| **Quote rotator** | 4 quotes (text + author) |
| **Experience rows** | 2 rows: image, title, description, CTA |
| **Philosophy pillars** | 4× { title, body } |
| **Stats/CTA** | Link to gallery, level pages |

#### Backend

- `page_content.the-space.sections` JSON
- Gallery images can reference `media_library` IDs
- Testimonials optional (`show_on_space`)

#### Admin

- Edit all copy
- Manage image grid (assign images + crop hints)
- Carousel slide CRUD + reorder
- Quote CRUD + reorder

---

### 6.7 Gallery (`/gallery`)

**File:** `src/routes/gallery.tsx`

#### Current behavior

- Filters: **All, Level 4, Level 5, Food, Events, 360° view**
- Preview: 4 images per category (hardcoded filenames)
- Expanded: masonry layout, all items in category
- Lightbox on click
- 360° tab embeds `VirtualTour360`

#### Backend — Gallery items

| Field | Notes |
|-------|-------|
| `image_url` | R2 CDN |
| `category` | level4, level5, food, events |
| `label` | Alt text / caption |
| `sort_order` | Manual order |
| `is_preview` | Max 4 per `preview_category` |
| `preview_category` | all, level4, level5, food, events |

#### Backend actions

| Action | API |
|--------|-----|
| Load filters + preview | GET `/api/v1/public/gallery` |
| Load full category | GET `/api/v1/public/gallery?category=level4&expanded=true` |
| 360° tab | GET `/api/v1/public/virtual-tour` |

#### Admin — Gallery

- Upload single / bulk images
- Assign category (dropdown)
- Set label/alt text
- Drag-drop sort
- **Set preview images** — pick exactly 4 per category (UI constraint)
- Delete / archive
- Replace `import.meta.glob` folder import entirely

---

### 6.8 Reservations (`/events`)

**File:** `src/routes/events.tsx` → `ReservationsPage.tsx`

> This is the **canonical** reservation flow. Home mini-form should converge to this schema.

#### Step 1 — Book Your Table

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `date` | date | Yes | min = today; check `blackout_dates` |
| `time` | select | Yes | 13 slots (12:00 PM – 11:00 PM) |
| `guests` | select | No (default 2) | 1–12 |
| `location` | toggle | No (default level4) | `level4` Fine Dining & Bar, `level5` Events & Parties |
| `occasion` | chips | Optional | Birthday, Anniversary, Special Occasion, Corporate |

#### Step 2 — Confirm & Reserve

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | text | Yes | non-empty trim |
| `phone` | tel | Yes | 10 digits |
| `specialRequest` | textarea | Optional | max 500 chars |

#### Other UI actions

| Action | Backend need |
|--------|--------------|
| WhatsApp fallback | `site_settings.whatsapp_number` — no API, dynamic link |
| "Book Your Table" scroll | Client only |
| Hash `/events#book` | Client only |
| Success screen | Show `reference_code` from API |
| Edit details | Client state only |

#### Backend — Reservation submit flow

1. **POST** `/api/v1/public/reservations`
2. Validate payload (Zod shared schema)
3. Check `blackout_dates` for date + location
4. Check `reservation_settings` capacity for slot
5. Insert `reservations` status = `pending`
6. Generate reference `OW-YYYYMMDD-XXXX`
7. Queue email to admin (`hello@...`)
8. Optional: SMS confirmation to guest
9. Return `{ reference, status, message }`
10. Rate limit: 5/hour/IP

#### Admin — Reservations module

- Calendar view (day/week/month)
- List view with filters: date range, status, location, occasion
- Click row → detail drawer
- Actions: Confirm, Cancel, Add notes, Edit date/time/guests
- Manual create reservation
- Export CSV
- Dashboard widget: today's count, pending count

---

### 6.9 Contact (`/contact`)

**File:** `src/routes/contact.tsx`

#### Static content (CMS)

| Block | Fields |
|-------|--------|
| **Page hero** | Title, subtitle |
| **Contact grid** | Phone, email, address, hours (from `site_settings`) |
| **Map** | Google Maps embed URL, lat/lng |
| **Reserve / Enquiry panels** | Rotating panel copy (3s auto-cycle) |

#### Private Enquiry Form

| Field | Type | Required |
|-------|------|----------|
| `name` | text | Yes |
| `email` | email | Yes |
| `occasion` | text | Yes |
| `date` | date | Yes |
| `guests` | text | Yes |
| `message` | textarea | Optional |

#### Backend — Enquiry submit

1. **POST** `/api/v1/public/enquiries`
2. Validate fields
3. Insert `enquiries` type = `private_event`, source = `contact`
4. Generate reference
5. Email events team
6. Return success message

#### Admin — Enquiries

- Inbox list (new / in progress / closed)
- Assign status
- Internal notes
- Reply via email (phase 2) or copy guest email

---

### 6.10 Level 4 Dining (`/level-4-dining`)

**File:** `src/routes/level-4-dining.tsx`

#### Content (CMS `page_content.level-4`)

| Block | Fields |
|-------|--------|
| Hero | Eyebrow, title, subtitle, hero image |
| Image trio | 3 images with captions |
| Mood copy | Heading + paragraphs |
| CTA | Text + link (`/contact#reserve` or `/events#book`) |
| SEO meta | title, description |

#### Backend

- GET `/api/v1/public/pages/level-4`
- No form (CTA links to reservation flow with `location=level4` prefill)

#### Admin

- Edit all copy and images
- Preview page

---

### 6.11 Level 5 Events (`/level-5-events`)

**File:** `src/routes/level-5-events.tsx`

#### Content blocks

| Block | Data |
|-------|------|
| Hero | Title, subtitle, image |
| Features | 3× { icon, title, description } |
| Occasion tiles | 5× { label, image } |
| Owner note | Quote + signature |
| Walk gallery | 5 images |
| Booking card | date, time, guests fields |
| CTA sections | Copy + links |

#### Booking card (currently broken — no submit)

| Field | Type | Options |
|-------|------|---------|
| `date` | date | — |
| `time` | time | — |
| `guests` | select | 5, 10, 15, 20, 25, 30, 40, 50, 75, 100 |

#### Backend — wire up "Enquire Now"

1. **POST** `/api/v1/public/enquiries`
2. type = `level5_booking`, source = `level5`
3. Map fields: name/email from future fields or redirect to full enquiry
4. **Recommendation:** Add `name`, `phone`, `email` to booking card OR redirect to contact form with prefill

#### Admin

- Edit all Level 5 content blocks
- Manage occasion tiles
- Walk gallery image CRUD
- Enquiries filtered by `type = level5_booking`

---

### 6.12 Gallery — 360° Virtual Tour

**Files:** `src/components/VirtualTour360.tsx`, `src/data/virtual-tour.ts`

#### Current state

- 3 scenes: entrance, arch, dining
- Demo panoramas from Poly Haven CDN
- Local `/public/panos/*.jpg` exist but unused
- Scene links with yaw/pitch positions

#### Backend

- `virtual_tour_scenes` table
- Panorama files on R2 (large assets)
- Thumbnails on R2
- Links JSON per scene

#### Admin

- Upload 360° panorama (equirectangular JPG)
- Set thumbnail
- Edit scene name/label
- Configure hotspot links (visual editor phase 2)
- Reorder scenes
- Replace demo URLs with venue shots

---

## 7. Global / Shell Components

### 7.1 Header (`Header.tsx`)

| Item | Backend source |
|------|----------------|
| Nav links | Static routes (no CMS) unless you want admin-editable nav (phase 2) |
| Logo | `media_library` / static |
| "Reserve a Table" CTA | `/events#book` |
| Submenu: Level 4, Level 5 | Static |

**Optional admin:** `navigation_items` table for reorder/hide links.

### 7.2 Footer (`Footer.tsx`)

| Item | Backend source |
|------|----------------|
| Tagline | `site_settings.tagline` |
| Quick links | Static (6 links) |
| Opening hours | `opening_hours` table |
| Phone, email, address | `site_settings` |
| Social links | `site_settings` (currently `#`) |
| Map iframe | `site_settings.osm_embed_url` or Google |
| Copyright year | `site_settings.copyright_year` |
| Privacy / Terms links | `site_settings` (currently `#`) |

### 7.3 WhatsApp Float

| Item | Backend |
|------|---------|
| Phone number | `site_settings.whatsapp_number` |
| Pre-filled message | Template in settings |

### 7.4 Root / SEO (`__root.tsx`)

| Item | Backend |
|------|---------|
| Default meta | `site_settings` |
| Per-route meta | `page_content.*.seo_*` |
| Fonts | Static (Google Fonts) |
| Manifest | `public/manifest.webmanifest` (admin optional) |

### 7.5 Error / 404 pages

- Static copy (admin optional phase 2)

---

## 8. Admin Panel — Full Specification

### 8.1 Admin App Structure

**Recommended:** Separate route group at `/admin` or subdomain `admin.theoffwhite.in`

```
/admin
  /login
  /dashboard
  /reservations
  /enquiries
  /menu
    /sections
    /items
    /menu-3-categories
  /gallery
  /virtual-tour
  /testimonials
  /pages
    /home
    /about
    /the-space
    /level-4
    /level-5
    /contact
    /gallery-page
  /media
  /settings
    /general
    /contact
    /hours
    /reservations-config
    /blackout-dates
    /social
    /legal
  /users
  /audit-logs
```

### 8.2 Admin — Login Page

| Action | Detail |
|--------|--------|
| Email + password form | Validate against `admin_users` |
| Remember me | Extended session (30 days) |
| Forgot password | Email reset link |
| Failed login throttle | Lock after 5 attempts / 15 min |
| Redirect | → `/admin/dashboard` |
| Session | HttpOnly secure cookie or JWT in memory |

### 8.3 Admin — Dashboard

| Widget | Data |
|--------|------|
| Today's reservations | Count + list (next 5) |
| Pending reservations | Count |
| New enquiries | Count (last 7 days) |
| Quick actions | New reservation, view enquiries, edit menu |
| Recent activity | Last 10 audit log entries |
| Chart (optional) | Reservations per day (7/30 days) — uses `recharts` already installed |

### 8.4 Admin — Reservations Module

#### List view

| Column | Sortable | Filterable |
|--------|----------|------------|
| Reference | Yes | Search |
| Date | Yes | Date range |
| Time | Yes | — |
| Name | Yes | Search |
| Phone | — | Search |
| Guests | Yes | — |
| Location | — | level4/level5 |
| Occasion | — | — |
| Status | — | pending/confirmed/cancelled |
| Source | — | events/home/admin |
| Created | Yes | Date range |

#### Detail view actions

- [ ] View full booking details
- [ ] Edit date, time, guests, location
- [ ] Change status (pending → confirmed → completed)
- [ ] Cancel with reason
- [ ] Add internal admin notes
- [ ] Copy phone number
- [ ] Click-to-call / WhatsApp link
- [ ] Resend confirmation email
- [ ] View submission IP/time (audit)

#### Create manual reservation

- All Step 1 + Step 2 fields
- Skip availability check (admin override toggle)
- Source = `admin_manual`

#### Export

- CSV: date range, all columns
- PDF daily sheet (phase 2)

### 8.5 Admin — Enquiries Module

#### List view

| Column | Filter |
|--------|--------|
| Reference | — |
| Name | Search |
| Email | Search |
| Type | private_event / level5 / general |
| Occasion | — |
| Date | Date range |
| Guests | — |
| Status | new / in_progress / closed |
| Created | — |

#### Detail actions

- [ ] Mark in progress
- [ ] Mark closed
- [ ] Add notes
- [ ] Copy email
- [ ] mailto: link

### 8.6 Admin — Menu Module

#### Sections tab

- [ ] List sections with item count
- [ ] Create / edit / delete section
- [ ] Edit intro text
- [ ] Toggle visibility: Menu 1, Menu 2, Menu 3
- [ ] Drag-drop reorder

#### Items tab

- [ ] Filter by section, status, chef's pick
- [ ] Create item (all fields)
- [ ] Edit item
- [ ] Upload / pick image from media library
- [ ] Toggle active, featured home, chef's pick
- [ ] Drag-drop reorder within section
- [ ] Duplicate item
- [ ] Publish / unpublish draft
- [ ] Delete (soft)

#### Menu 3 categories tab

- [ ] CRUD categories
- [ ] Hero image per category
- [ ] Reorder
- [ ] Link to menu section

### 8.7 Admin — Gallery Module

- [ ] Grid view of all images
- [ ] Filter by category
- [ ] Upload (single + bulk)
- [ ] Edit: label, category, alt text
- [ ] Set as preview image (per category, max 4 enforced)
- [ ] Drag-drop sort
- [ ] Delete (remove from R2)
- [ ] Search by label

### 8.8 Admin — Virtual Tour Module

- [ ] List scenes
- [ ] Upload panorama (with size warning > 10MB)
- [ ] Upload thumbnail
- [ ] Edit name, label
- [ ] Edit links JSON (or visual editor later)
- [ ] Reorder scenes
- [ ] Preview tour in iframe

### 8.9 Admin — Testimonials Module

- [ ] List all
- [ ] Create: quote, author, rating, source
- [ ] Toggle: show on home / about / space
- [ ] Reorder
- [ ] Activate / deactivate
- [ ] Delete

### 8.10 Admin — Pages (CMS) Module

One editor per page slug:

| Page slug | Editable blocks |
|-----------|-----------------|
| `home` | Hero, story, space tiles, menu preview text, reserve section copy |
| `about` | Hero, philosophy, values, stats, kitchen quote |
| `the-space` | Hero, grid, carousel, quotes, pillars |
| `level-4` | All Level 4 blocks |
| `level-5` | All Level 5 blocks |
| `contact` | Hero, panel copy |
| `gallery` | Page title, subtitle (filters are from gallery module) |
| `menu` | Page intro, tax disclaimer |

#### Page editor actions

- [ ] Edit SEO title + description
- [ ] Edit hero fields
- [ ] JSON block editor or structured form per section type
- [ ] Image picker for each image field
- [ ] Save draft
- [ ] Publish
- [ ] Preview on public site (draft token URL phase 2)

### 8.11 Admin — Media Library

- [ ] Folder tree: dishes, gallery, heroes, panos, logos, general
- [ ] Upload drag-drop zone
- [ ] Grid with filename, size, dimensions, date
- [ ] Search by filename / alt text
- [ ] Edit alt text
- [ ] Copy URL
- [ ] Delete (with usage warning if linked)
- [ ] Filter by mime type (image only default)

### 8.12 Admin — Settings

#### General

- [ ] Brand name, tagline
- [ ] Copyright year
- [ ] Default SEO fallback

#### Contact

- [ ] Phone (display + raw for links)
- [ ] WhatsApp number
- [ ] Email(s)
- [ ] Full address
- [ ] Google Maps URL + embed code
- [ ] OSM embed (optional)

#### Hours

- [ ] Per-day open/close editor
- [ ] Kitchen close note
- [ ] Location-specific hours (level4 vs level5)

#### Reservations config

- [ ] Manage time slots (add/remove/disable)
- [ ] Guest min/max per location
- [ ] Occasion options list (add/remove)
- [ ] Location labels
- [ ] Confirmation message templates

#### Blackout dates

- [ ] Calendar UI to block dates
- [ ] Per-location or global
- [ ] Reason field

#### Social & legal

- [ ] Instagram, Facebook, TripAdvisor URLs
- [ ] Privacy policy (URL or rich text / PDF upload)
- [ ] Terms & conditions

### 8.13 Admin — Users & Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Everything + user management |
| `manager` | Reservations, enquiries, settings (no users) |
| `editor` | Menu, gallery, pages, testimonials, media |
| `reservations_only` | View/confirm reservations only |

#### User management actions

- [ ] Create user (email invite)
- [ ] Set role
- [ ] Deactivate user
- [ ] Force password reset
- [ ] View last login

### 8.14 Admin — Audit Logs

- [ ] Filter by user, action, entity type, date
- [ ] View change diff JSON
- [ ] Export logs (compliance)

---

## 9. Authentication & Authorization

### Public site
- No user accounts required for guests
- Optional: reservation lookup by reference + phone (phase 2)

### Admin panel
- Email/password login
- Bcrypt password hashing
- Session in HttpOnly cookie (`Secure`, `SameSite=Strict`)
- Role-based middleware on every `/api/v1/admin/*` route
- CSRF token on mutating requests
- Password policy: min 12 chars, complexity rules

---

## 10. Notifications & Integrations

| Event | Channel | Recipient |
|-------|---------|-----------|
| New reservation | Email | Admin + optional guest |
| Reservation confirmed | Email/SMS | Guest |
| Reservation cancelled | Email | Guest |
| New enquiry | Email | Events team |
| Admin password reset | Email | Admin user |
| Failed payment (future) | Email | Admin |

### Email service options
- Cloudflare Email Workers / Resend / SendGrid

### WhatsApp
- Dynamic links only (no API required initially)
- Phase 2: WhatsApp Business API for confirmations

### Maps
- Unify on **one** provider (Google Maps Jaipur OR Goa — see conflicts)

### Analytics (not present today)
- GA4 or Plausible via env var + script injection in `__root.tsx`

---

## 11. Media & Asset Pipeline

### Upload flow

1. Admin uploads file in panel
2. Worker validates mime type + size
3. Store in R2: `{folder}/{uuid}.{ext}`
4. Save metadata in `media_library`
5. Return public CDN URL
6. Optional: generate WebP thumbnail via Workers image resizing

### Migration from current assets

| Current location | Migrate to |
|------------------|------------|
| `src/assets/*` (~53 files) | R2 `heroes/`, `dishes/` |
| `src/artonplate/*` (4 files) | R2 `dishes/` + link to menu items |
| `src/offwhite images/*` (~84 files) | R2 `gallery/` + `gallery_items` rows |
| `public/panos/*` | R2 `panos/` + wire to virtual tour |

### Image fields to stop bundling in code
- Remove `import.meta.glob` for gallery after migration
- Menu images from API URLs
- Featured dishes from API

---

## 12. Data Conflicts to Resolve First

Before backend implementation, **decide single source of truth**:

| Field | Footer (current) | Contact/Reservations (current) |
|-------|------------------|--------------------------------|
| **Address** | Candolim, Goa 403515 | Vaishali Nagar, Jaipur 302021 |
| **Phone** | +91 12345 67890 | +91 97850 55550 |
| **Email** | hello@theoffwhite.com | hello@theoffwhite.in |
| **WhatsApp** | 911234567890 | 919785055550 |
| **Map** | OpenStreetMap Goa | Google Maps Jaipur |
| **Hours** | Mon–Thu 12–11, Fri–Sun 12–12 | "12 PM – 1 AM all days" |

**Action:** Admin settings panel becomes the one place to edit these; frontend reads only from API.

---

## 13. Implementation Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] D1 schema migration
- [ ] R2 bucket + bindings in `wrangler.jsonc`
- [ ] API router in Worker
- [ ] Admin auth (login/logout/me)
- [ ] Site settings seed + public GET
- [ ] Media upload endpoint

### Phase 2 — Transactions (Week 2–3)
- [ ] Reservation POST + availability
- [ ] Enquiry POST
- [ ] Email notifications (Queue)
- [ ] Wire `/events` form to API
- [ ] Wire contact enquiry to API
- [ ] Wire home mini-form to API
- [ ] Fix Level 5 booking card submit

### Phase 3 — Content CMS (Week 3–5)
- [ ] Menu CRUD + public API
- [ ] Gallery CRUD + migrate offwhite images
- [ ] Testimonials CRUD
- [ ] Page content CMS
- [ ] Virtual tour scenes
- [ ] Frontend: replace hardcoded data with React Query

### Phase 4 — Admin Panel UI (Week 4–6)
- [ ] Admin layout + navigation
- [ ] Dashboard
- [ ] Reservations management
- [ ] Enquiries inbox
- [ ] Menu editor
- [ ] Gallery manager
- [ ] Settings pages
- [ ] Users + roles

### Phase 5 — Polish (Week 6–7)
- [ ] Rate limiting
- [ ] Audit logs UI
- [ ] CSV export
- [ ] Unify contact data
- [ ] SEO SSR from API
- [ ] Analytics
- [ ] Privacy/Terms pages

---

## 14. Environment Variables

```env
# Cloudflare (wrangler secrets)
DATABASE_ID=           # D1 binding
R2_BUCKET=             # R2 binding
JWT_SECRET=
SESSION_SECRET=

# Email
RESEND_API_KEY=        # or SendGrid
ADMIN_EMAIL=
EVENTS_EMAIL=

# Optional
GA4_MEASUREMENT_ID=
WHATSAPP_NUMBER=       # canonical
PUBLIC_SITE_URL=https://theoffwhite.in
ADMIN_URL=https://admin.theoffwhite.in
```

---

## 15. Testing Checklist

### Public API
- [ ] All GET endpoints return valid JSON
- [ ] Menu filters match admin data
- [ ] Gallery preview returns exactly 4 per category
- [ ] Reservation validation rejects past dates
- [ ] Reservation rejects blackout dates
- [ ] Rate limiting blocks spam
- [ ] Enquiry validation rejects bad email

### Admin API
- [ ] Unauthenticated requests return 401
- [ ] Role restrictions enforced
- [ ] CRUD operations write audit logs
- [ ] Media delete removes R2 object
- [ ] Preview image limit enforced (max 4)

### End-to-end
- [ ] Submit reservation on `/events` → appears in admin
- [ ] Submit enquiry on `/contact` → appears in admin
- [ ] Edit menu item in admin → reflects on `/menu`
- [ ] Upload gallery image → appears on `/gallery`
- [ ] Change phone in settings → updates footer + contact
- [ ] Confirm reservation → guest receives email

---

## Appendix A — Reservation Payload (Canonical)

```json
{
  "date": "2026-07-15",
  "time": "8:00 PM",
  "guests": 4,
  "location": "level4",
  "occasion": "Anniversary",
  "name": "Priya Sharma",
  "phone": "9876543210",
  "specialRequest": "Window seat if possible",
  "seatingPreference": "Window seating",
  "source": "events_full"
}
```

## Appendix B — Enquiry Payload

```json
{
  "type": "private_event",
  "name": "Rahul Mehta",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "occasion": "Corporate Dinner",
  "date": "2026-08-20",
  "guests": "40",
  "message": "Need AV setup and set menu options.",
  "source": "contact"
}
```

## Appendix C — Navigation Map (Public)

```
Header:
  / → Home
  /about → About
  /menu-3 → Menu 3
  /menu-2 → Menu 2
  /menu → Menu
  /the-space → The Space
  /gallery → Gallery
  /events → Reservations
  /level-4-dining → Level 4
  /level-5-events → Level 5
  /contact → Contact
  /events#book → Reserve CTA

Footer:
  /about, /menu, /the-space, /gallery, /events, /contact
```

---

*Document generated for planning purposes. No code has been modified.*
