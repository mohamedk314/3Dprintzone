# 3Dprintzone

An e-commerce storefront and admin platform for **3Dprintzone**, a 3D-printing business based in Egypt. The site sells ready-made 3D-printed products, accepts custom-design requests, and ships within Egypt. A secondary brand, **RAYK**, runs under the same codebase at `/rayk`.

This document is the canonical handover. It's written for two audiences:

- **Business owners / non-technical operators** — see [Admin guide](#g-admin-guide-for-business-owners), [SEO handover](#h-seo-handover), [Maintenance guide](#i-maintenance-guide).
- **Developers taking over the codebase** — see [Local setup](#e-local-setup-guide), [Production hosting](#f-production-hosting-guide), [Troubleshooting](#j-troubleshooting).

---

## Table of contents

- [A. Project overview](#a-project-overview)
- [B. Tech stack](#b-tech-stack)
- [C. Folder structure](#c-folder-structure)
- [D. Environment variables](#d-environment-variables)
- [E. Local setup guide](#e-local-setup-guide)
- [F. Production hosting guide](#f-production-hosting-guide)
- [G. Admin guide for business owners](#g-admin-guide-for-business-owners)
- [H. SEO handover](#h-seo-handover)
- [I. Maintenance guide](#i-maintenance-guide)
- [J. Troubleshooting](#j-troubleshooting)
- [K. Security checklist](#k-security-checklist)
- [L. Final launch checklist](#l-final-launch-checklist)

---

## A. Project overview

**Business:** 3Dprintzone — a 3D-printing storefront serving customers in Egypt. Includes a secondary brand, RAYK, with its own product catalog under `/rayk`.

**Main public pages:**

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing page with hero, featured products, categories, custom-request CTA |
| `/shop` | Full product catalog with filters (category, price, in-stock, search) |
| `/product/[slug]` | Product detail page |
| `/category/[slug]` | Category-filtered listing |
| `/cart` | Shopping cart |
| `/checkout` | Customer checkout (COD + optional Paymob card payment) |
| `/wishlist` | Logged-in customer wishlist |
| `/account` | Customer account (OTP-based customer login) |
| `/track-order` | Public order tracking by reference number |
| `/custom-request` | Submit a custom 3D-printing request (architecture / gift / dental / mechanical) |
| `/rayk` | RAYK brand landing page |
| `/rayk/shop`, `/rayk/product/[slug]`, `/rayk/cart`, `/rayk/checkout`, `/rayk/wishlist` | RAYK brand storefront |

**Main admin features** (protected, under `/admin`):

- OTP-based admin login (`/admin/login`)
- Products: CRUD, images via Cloudflare R2
- Categories: CRUD with icon + cover image
- Orders: list, status updates, shipping management, PDF invoices
- Custom requests: review, approve/reject
- Reviews: moderate (pending / approved / rejected)
- Shipping: configure zones, methods, rates
- Admins: super-admin can manage other admins
- Settings: site-wide content (announcement bar, etc.)

**Main backend / API features:**

- Storefront APIs: products, categories, cart, wishlist, orders, reviews, shipping, custom requests
- Admin APIs: protected by JWT cookie + middleware proxy
- Customer auth: OTP login (separate from admin)
- Paymob integration: optional online card payments (HMAC-verified webhook)
- Cloudflare R2 uploads: presigned URLs + direct upload route for admin
- Transactional email via SMTP (admin OTP, customer notifications)
- SEO: server-rendered metadata, dynamic `sitemap.xml`, `robots.txt`, Organization JSON-LD

---

## B. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, React 19) |
| Language | TypeScript (strict) |
| Database | **MySQL** via **Prisma 6** ORM |
| Styling | **Tailwind CSS v4** (PostCSS plugin), custom design tokens in `globals.css` |
| Auth (admin) | Email OTP → JWT cookie, verified by `src/proxy.ts` (Next.js middleware) |
| Auth (customer) | Email OTP |
| Email | Nodemailer with SMTP (Gmail App Password supported) |
| Payments | Cash on Delivery (always available); Paymob (optional, online cards) |
| File storage | Cloudflare R2 (S3-compatible) for product images |
| PDF generation | jsPDF (invoices) |
| Validation | Zod |
| Hosting target | **Railway** (Node) or any Node host; works on Vercel for the app but **needs a separate MySQL DB** |

---

## C. Folder structure

```
3dprintzone/
├── prisma/
│   ├── schema.prisma            # DB schema (source of truth)
│   └── migrations/              # 12 timestamped migrations
├── public/                      # Static assets (logos, hero, brand imagery)
│   ├── brands/rayk-logo.png
│   ├── rayk/                    # RAYK hero + product visuals
│   └── hero.png, 3dprinter.png, etc.
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (storefront pages)/  # / , /shop, /product/[slug], /cart, etc.
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── rayk/                # RAYK brand pages (own layout, no shared chrome)
│   │   ├── api/                 # API route handlers
│   │   │   ├── admin/           # /api/admin/* (protected by proxy)
│   │   │   ├── customer/        # /api/customer/*
│   │   │   ├── storefront/      # public read-only product/cart/etc. APIs
│   │   │   ├── payments/paymob/ # Paymob initiate + webhook
│   │   │   └── uploads/r2/      # R2 presign + upload
│   │   ├── layout.tsx           # Root layout, SEO metadata, Org JSON-LD
│   │   ├── globals.css          # Tailwind import + design tokens
│   │   ├── sitemap.ts           # Dynamic sitemap.xml
│   │   └── robots.ts            # robots.txt
│   ├── components/
│   │   ├── layout/              # Header, Footer, TopBar, CategoryNav, Chrome
│   │   ├── ui/                  # ProductCard, CategoryIcon, etc.
│   │   ├── rayk/                # RAYK-specific Header/Footer/Card
│   │   └── admin/               # Admin UI components
│   ├── lib/
│   │   ├── db/prisma.ts         # Prisma client singleton
│   │   ├── auth/                # hash + JWT helpers
│   │   ├── email/               # nodemailer transport + email templates
│   │   ├── services/            # auth, paymob, r2, shipping, stock, etc.
│   │   ├── utils/env.ts         # Typed env loader (throws on missing required vars)
│   │   └── utils/otp.ts         # OTP generation
│   ├── proxy.ts                 # Next.js middleware: protects /admin and /api/admin
│   └── types/                   # Shared TypeScript types
├── .env.example                 # Template — copy to .env.local
├── .gitignore                   # `.env`, `.env.*` ignored except `.env.example`
├── next.config.ts               # Allows all HTTPS remote images
├── prisma.config.ts             # Prisma 6 config (schema path, migrations path)
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

**Where things live (quick reference):**

- Public storefront pages → `src/app/<route>/page.tsx`
- Admin pages → `src/app/admin/<route>/page.tsx`
- API routes → `src/app/api/<route>/route.ts`
- Prisma schema → `prisma/schema.prisma`
- Static assets → `public/`
- Shared UI → `src/components/`
- Business logic / services → `src/lib/services/`

---

## D. Environment variables

All variables are read in `src/lib/utils/env.ts`. Required vars throw an error at module load if missing — the app will not start without them.

| Variable | Required | Example | Description | Local vs Production |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | `mysql://root:password@127.0.0.1:3306/3dprintzone` | MySQL connection string used by Prisma | Local: your local MySQL. Production: managed MySQL connection string |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://3dprintzone.com` | Public site URL. Used by metadata, sitemap, robots, Open Graph. **No trailing slash.** | Local: `http://localhost:3000`. Production: your real domain |
| `JWT_SECRET` | ✅ | 96-char hex string | Signs admin session JWTs. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` | Different per environment. Never share between local and prod |
| `ADMIN_EMAIL` | ⚪ optional | `admin@yourdomain.com` | Optional default admin email (UI label) | Same in both |
| `SUPER_ADMIN_EMAIL` | ⚪ optional | `owner@yourdomain.com` | Email that is auto-promoted to `super_admin` on first OTP request and cannot be locked out. Lowercased internally. Default fallback exists in code | Same in both — the production owner email |
| `ADMIN_OTP_EXPIRES_MINUTES` | ⚪ optional | `10` | How long an OTP stays valid (server enforces minimum of 5) | Same |
| `ADMIN_SESSION_EXPIRES_DAYS` | ⚪ optional | `7` | Days an admin JWT stays valid | Same |
| `SMTP_HOST` | ✅ | `smtp.gmail.com` | SMTP server host | Same |
| `SMTP_PORT` | ⚪ optional | `587` | SMTP port (defaults to 587) | Same |
| `SMTP_USER` | ✅ | `mailer@gmail.com` | SMTP username | Same |
| `SMTP_PASS` | ✅ | 16-char Gmail App Password | SMTP password. For Gmail, use an **App Password** ([create one](https://myaccount.google.com/apppasswords)), not your account password | Different per environment recommended |
| `SMTP_FROM` | ✅ | `3Dprintzone <mailer@gmail.com>` | `From` header. Format: `Display Name <email>` | Same |
| `R2_ACCOUNT_ID` | ⚪ optional | Cloudflare account ID | R2 storage. If empty, image upload routes return an error but everything else works | Same |
| `R2_ACCESS_KEY_ID` | ⚪ optional | R2 access key | — | Same |
| `R2_SECRET_ACCESS_KEY` | ⚪ optional | R2 secret | — | Same |
| `R2_BUCKET_NAME` | ⚪ optional | `3dprintzone` | R2 bucket name | Same |
| `R2_PUBLIC_URL` | ⚪ optional | `https://pub-xxx.r2.dev` | Public CDN URL for uploaded files | Same |
| `PAYMOB_API_KEY` | ⚪ optional | Paymob API key | Online card payments. If any Paymob var is empty, card payments are disabled; COD still works | Different per environment recommended |
| `PAYMOB_INTEGRATION_ID` | ⚪ optional | Paymob integration ID | — | Same as above |
| `PAYMOB_IFRAME_ID` | ⚪ optional | Paymob iframe ID | — | Same as above |
| `PAYMOB_HMAC_SECRET` | ⚪ optional | Paymob HMAC secret | Used to verify webhook authenticity | Same as above |

**Where to put values:**

- **Local development:** put them in `.env.local` at the project root (copy from `.env.example`). This file is ignored by Git.
- **Production:** set every variable in your hosting provider's dashboard (Railway → Service → Variables; Vercel → Project Settings → Environment Variables). **Do not commit a production `.env` file.**

---

## E. Local setup guide

### 1. Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ (ships with Node)
- A local MySQL 8 server, or Docker with MySQL

### 2. Clone and install

```bash
git clone <repo-url>
cd 3dprintzone
npm install
```

`postinstall` runs `prisma generate` automatically.

### 3. Create your `.env.local`

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in real values. At minimum you need:

- `DATABASE_URL` pointing to a reachable MySQL
- `JWT_SECRET` (generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- `SMTP_*` (Gmail App Password works for testing)
- `SMTP_FROM`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `SUPER_ADMIN_EMAIL` set to the email you'll use to log in

### 4. Create the database and run migrations

```bash
# Make sure MySQL is running and the DB exists. Example:
#   mysql -uroot -p -e "CREATE DATABASE 3dprintzone CHARACTER SET utf8mb4;"

npm run db:migrate:dev
```

This applies all migrations in `prisma/migrations/` and regenerates the Prisma client.

### 5. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 6. Create the first admin and test login

1. Go to <http://localhost:3000/admin/login>.
2. Enter the email you set in `SUPER_ADMIN_EMAIL`.
3. Click "Send OTP". The first OTP request creates the super-admin record automatically.
4. Check your inbox (or spam) for a 6-digit code from `SMTP_FROM`.
5. Enter it on the verification screen → you're in.

> No SMTP set up? In development you can also read the latest OTP directly from MySQL:
> `SELECT * FROM AdminOtpCode ORDER BY createdAt DESC LIMIT 1;` — but the value stored is **hashed**, so this only confirms a request was made. For real testing, configure SMTP.

### Useful npm scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Run the production build (uses `$PORT` if set, otherwise 3000) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:migrate:dev` | Create & apply a new migration locally |
| `npm run db:migrate:deploy` | Apply existing migrations in production (no schema changes) |
| `npm run db:status` | Show migration status |

---

## F. Production hosting guide

The recommended host is **Railway** (Node service + managed MySQL plugin), but any Node host that supports `npm install` + `npm run build` + `npm run start` works.

### Railway (recommended)

1. **Create a project**, add the GitHub repo.
2. **Add a MySQL plugin** to the project. Railway gives you a `DATABASE_URL` automatically.
3. In the **Service → Variables** tab, set every required env var from the table above. For `DATABASE_URL`, click "Reference" → MySQL plugin → `DATABASE_URL` so Railway wires it for you.
4. Build command: leave default (`npm install && npm run build`). The `postinstall` step runs `prisma generate` automatically.
5. Start command: `npm run start` (this script already includes `-p ${PORT:-3000}` so Railway's dynamic `$PORT` is honored).
6. **First deploy** — once it builds, open a one-off shell:
   ```bash
   npm run db:migrate:deploy
   ```
   This applies migrations to the production DB. **Do not** run `prisma migrate reset` or `prisma db push` in production.
7. **Custom domain** — in Railway → Service → Settings → Networking, add your domain. Set the same domain (with `https://`) as `NEXT_PUBLIC_APP_URL`.
8. Railway auto-provisions an SSL certificate via Let's Encrypt. HTTPS is enforced automatically.

### Vercel (alternative)

Vercel can host the app, but you'll need a separate MySQL database (PlanetScale, Neon's MySQL, Aiven, Railway's MySQL with public networking). Set the same variables in **Project Settings → Environment Variables**. Vercel doesn't expose `$PORT`; the script's `${PORT:-3000}` falls back to 3000, which Vercel ignores anyway.

After the first deploy, run migrations against the production database from your local machine:

```bash
DATABASE_URL="mysql://prod-connection-string" npx prisma migrate deploy
```

### Build/start commands summary

| Action | Command |
| --- | --- |
| Install | `npm install` |
| Generate Prisma client | `npx prisma generate` (auto, via `postinstall`) |
| Build | `npm run build` |
| Run migrations on production DB | `npm run db:migrate:deploy` |
| Start server | `npm run start` |

---

## G. Admin guide for business owners

The admin dashboard is at `https://yourdomain.com/admin`.

### How to log in

1. Open `/admin/login`.
2. Enter your registered admin email.
3. Click **Send OTP**. A 6-digit code is emailed to you (check spam if it doesn't arrive within a minute).
4. Type the code on the next screen. You'll stay logged in for 7 days (configurable).

### How OTP works

- OTP codes expire after 10 minutes by default.
- A new code can be requested every 60 seconds (cooldown).
- After 5 wrong attempts, the code is invalidated and you must request a new one.
- Codes are stored hashed in the database. The plain code only exists in the email we send.
- The **super-admin** account (set via `SUPER_ADMIN_EMAIL`) is auto-created on first OTP request and cannot be deactivated.
- Other admin accounts must be created by the super-admin in **Admin → Admins**.

### Managing the store

| Section | What you can do |
| --- | --- |
| **Products** | Add, edit, archive products. Upload images (stored on Cloudflare R2). Set price, stock, featured flag, category, brand (3Dprintzone or RAYK) |
| **Categories** | Add/edit categories. Choose an icon (from a preset list) and upload a cover image |
| **Orders** | View all orders, change status, mark as shipped/delivered, generate PDF invoices, manage shipments |
| **Custom requests** | Review customer-submitted custom-print requests (architecture, gift, dental, mechanical) and approve or reject |
| **Reviews** | Moderate customer reviews — approve or reject before they appear publicly |
| **Shipping** | Configure shipping zones, methods, and rates |
| **Settings** | Update the announcement bar text and other site-wide content |
| **Admins** | (Super-admin only) Add or deactivate other admin accounts |

### What you should not edit manually

- **Database tables directly** — always use the admin UI. Direct edits can break references (e.g., an order with a deleted product).
- **Migration files** in `prisma/migrations/` — these are version-controlled history.
- **Environment variables in code** — change them in the hosting dashboard, then redeploy.
- **Customer order data** that has already been delivered — keep history intact for accounting.

---

## H. SEO handover

### What's already implemented

- ✅ **Server-rendered metadata** for every page (`title`, `description`) defined in `src/app/layout.tsx` and per-route `metadata` exports.
- ✅ **Title template:** `"<page title> | 3Dprintzone"`. Set in `layout.tsx`.
- ✅ **Open Graph tags:** `siteName`, `locale: en_EG`, `type: website`. Add product-specific OG images in admin if/when desired.
- ✅ **Dynamic sitemap** at `/sitemap.xml` — auto-includes all active products and categories from the database, plus static pages.
- ✅ **robots.txt** at `/robots.txt` — allows all crawlers, disallows `/admin`, `/api`, `/account`, `/track-order`. Points to the sitemap.
- ✅ **Organization JSON-LD** structured data injected on every page (name, URL, address: Cairo, EG).
- ✅ **Canonical URL base** — driven by `NEXT_PUBLIC_APP_URL`, so changing your domain automatically updates everywhere.
- ✅ **Favicon** at `/icon.png` (and `/rayk/icon.png` for the RAYK brand).
- ✅ **Image optimization** via `next/image` with remote-pattern allowlist in `next.config.ts`.

### What the owner should update after buying the final domain

1. **Set `NEXT_PUBLIC_APP_URL`** in the hosting dashboard to `https://your-final-domain.com` (no trailing slash), then redeploy.
2. Visit `https://your-final-domain.com/sitemap.xml` to confirm it lists every product and category.
3. Visit `https://your-final-domain.com/robots.txt` to confirm the sitemap line points to your new domain.

### Submit your sitemap to Google Search Console

1. Go to <https://search.google.com/search-console>.
2. Add a property → **Domain** (preferred — covers all subdomains) or **URL prefix**.
3. Verify ownership (DNS TXT record for Domain property; HTML file or DNS for URL prefix).
4. Go to **Sitemaps** in the left menu.
5. Submit: `sitemap.xml`.
6. Allow 1–7 days for indexing.

### Optional next steps for the owner

- **Add a social preview image** at `/public/og.png` (1200×630 recommended) and reference it in `src/app/layout.tsx` under `openGraph.images`.
- **Add Bing Webmaster Tools** with the same sitemap.
- **Add a Google Business Profile** for "3Dprintzone, Cairo" — improves local search.
- **Update the JSON-LD address** in `src/app/layout.tsx` with a real street address once you have one (currently city + country only).

---

## I. Maintenance guide

### Updating dependencies safely

```bash
# Check what's outdated
npm outdated

# Safe path: update one major dep at a time, then test
npm install <pkg>@latest

# Always re-run after upgrading
npm run typecheck
npm run build
```

Major upgrades to **Next.js**, **React**, or **Prisma** should be done on a feature branch, with a full local build + manual smoke test (storefront load, admin login, place order) before merging.

### Known dependency audit notes

`npm audit` currently reports **2 moderate** vulnerabilities. Both come from a single nested copy of `postcss` (<8.5.10) that ships inside `next@16.2.6` itself — not a direct dependency of this project. The advisory is [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93): PostCSS XSS via unescaped `</style>` in its stringify output.

**Why we are not "fixing" it:**

- `npm audit fix --force` would resolve the warning by **downgrading Next.js from 16.2.6 to 9.3.3** — a breaking change of 7 major versions, which would destroy the application. This is not acceptable.
- The vulnerable `postcss` is bundled inside Next.js's own compiler pipeline. It is reachable only at build time when CSS is stringified, not at runtime when serving HTTP requests. There is no user input flowing into PostCSS's stringifier in this project.
- The fix has to come from upstream — Next.js needs to ship a release that bumps its internal `postcss` to ≥ 8.5.10. We are tracking the issue and will pick it up when a patched Next.js minor or patch release lands.

**Action plan:**

1. Periodically run `npm audit` and `npm outdated` (e.g., once a month).
2. When a new `next@16.2.x` patch is published, run:
   ```bash
   npm install next@latest
   npm run typecheck
   npm run build
   npm audit
   ```
3. If audit comes back clean (or to a known new issue), commit the bump.

In the meantime, the remaining 2 moderate items in `npm audit` are expected and do not affect production. Earlier 11 of 13 vulnerabilities were fixed by a safe `npm audit fix` (no `--force`), and the Next.js minor bump from 16.1.6 → 16.2.6 closed ~18 high-severity advisories applicable to this stack (proxy bypass, RSC DoS, SSRF, image-optimization DoS, RSC cache poisoning, etc.).

### Backing up the database

Railway and most managed MySQL hosts offer scheduled backups in the dashboard — enable daily backups before launch.

Manual backup (gzip-compressed SQL dump):

```bash
mysqldump -h HOST -u USER -p DATABASE_NAME | gzip > backup-$(date +%F).sql.gz
```

Restore conceptually:

1. Provision an empty MySQL database.
2. Pipe the dump in:
   ```bash
   gunzip -c backup-2026-05-15.sql.gz | mysql -h HOST -u USER -p NEW_DATABASE_NAME
   ```
3. Update `DATABASE_URL` to point at the new DB and redeploy.

### Rotating secrets

1. Generate the new value (e.g., a new `JWT_SECRET`).
2. Update it in the hosting dashboard.
3. Redeploy the service.
4. For `JWT_SECRET` rotation: all existing admin sessions become invalid — admins must log in again. That's expected.

### Changing SMTP credentials

1. If using Gmail, create a new [App Password](https://myaccount.google.com/apppasswords).
2. Update `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` in the hosting dashboard.
3. Redeploy.
4. Test by requesting an OTP at `/admin/login`.

### Checking logs

- **Railway:** Service → Deployments → click a deployment → **Logs** tab. Live tail available.
- **Vercel:** Project → Deployments → click a deployment → **Runtime Logs**.
- Look for `[Error]` lines from API routes. Stack traces include the file:line.

### Debugging common errors

See [Troubleshooting](#j-troubleshooting) below.

---

## J. Troubleshooting

### Prisma "missing column" error / `P2022`

The database is out of sync with the schema (drift). Likely a migration wasn't applied.

```bash
npm run db:status        # shows pending migrations
npm run db:migrate:deploy   # applies them
```

If you're in local dev and made a schema change without a migration:

```bash
npm run db:migrate:dev -- --name describe_change
```

**Never run `prisma migrate reset`** in production — it drops all data.

### "Missing environment variable: DATABASE_URL" (or `JWT_SECRET`, `SMTP_*`)

`src/lib/utils/env.ts` throws if any required variable is missing.

- Local: confirm `.env.local` exists and has the value.
- Production: confirm the variable is set in the hosting dashboard. Some hosts require a redeploy after adding a variable.

### SMTP login error / OTP email not arriving

- For Gmail, ensure you used an **App Password** (16 chars, no spaces), not your account password. Account password auth was deprecated by Google.
- Verify `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587` (TLS upgrade).
- Check spam folder.
- View server logs around the time of the OTP request — Nodemailer errors include the SMTP server response.
- 60-second cooldown between requests — try again after a minute.

### Admin OTP not received but no error in logs

- Inspect the `AdminOtpCode` table: if a new row was inserted with `usedAt = NULL`, the OTP was generated. The issue is delivery.
- Check Gmail's "Sent" folder under your `SMTP_USER` account — confirms whether the message left.
- Some hosts (e.g., Vercel free tier) block outbound SMTP on port 587. Use port 465 (`SMTP_PORT=465`) and update transport config, or switch to a transactional provider (Resend, Postmark, SendGrid).

### Build errors

Run locally first:

```bash
npm run typecheck && npm run build
```

If `next build` fails on a specific page, look at the error: most often it's a missing env var (the app reads them at build time for metadata) or a TypeScript error.

### Port already in use

Default port is 3000. Override:

```bash
PORT=4000 npm run start
```

The `start` script reads `$PORT` automatically.

### Images not loading

- Confirm `R2_PUBLIC_URL` is set and the bucket is publicly readable.
- `next.config.ts` already allows any `https://**` remote pattern for images. If you switch storage providers, no config change needed.
- Test the raw URL in a browser — if it 403s, your bucket policy is private.

### 500 errors from API routes

Check the server logs. Common causes:

- Database unreachable (`ECONNREFUSED`, `ENOTFOUND`): check `DATABASE_URL` and that the DB is running.
- Schema drift: run `npm run db:status`.
- A required env var throwing at module load: see logs for `Missing environment variable: X`.

### Migration drift warnings

If `prisma migrate status` reports drift:

1. **Never** auto-resolve with `reset` in production.
2. Inspect the difference: `prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script`.
3. Create a corrective migration manually: `prisma migrate dev --create-only --name fix_drift`, edit the SQL, then apply.

---

## K. Security checklist

- [ ] `.env`, `.env.local`, and any other `.env.*` files are **never** committed. Only `.env.example` is in Git.
- [ ] Any secret that may have appeared in earlier commits (`JWT_SECRET`, `SMTP_PASS`, `R2_*`, `PAYMOB_*`) is **rotated** before launch.
- [ ] Production is served over **HTTPS only**. Railway/Vercel handle this automatically; if self-hosting, terminate TLS at the load balancer.
- [ ] The admin cookie is set with `httpOnly: true` and `secure: true` in production (already enforced via `NODE_ENV === "production"` in `src/app/api/admin/auth/verify-otp/route.ts`).
- [ ] The `SUPER_ADMIN_EMAIL` belongs to an account you control. This account cannot be deactivated and can grant admin access to others.
- [ ] Gmail App Passwords are used (not real account passwords). Rotate the App Password if the team changes.
- [ ] Database backups are enabled in the hosting provider.
- [ ] Admin endpoints (`/admin/*`, `/api/admin/*`) are protected by `src/proxy.ts` middleware — verified by JWT signature on every request.
- [ ] Paymob webhooks are HMAC-verified (`verifyWebhookHmac` in `src/lib/services/paymob/client.ts`). Don't trust the request body otherwise.
- [ ] Storefront APIs only return non-sensitive fields. Customer auth uses OTP, not passwords.

---

## L. Final launch checklist

Use this list the day you go live. Tick each item:

**Infrastructure**
- [ ] Production MySQL database provisioned and reachable
- [ ] Daily DB backups enabled
- [ ] Cloudflare R2 bucket created (or alternative storage) and public URL working

**Environment**
- [ ] Every required env var set in hosting dashboard (see [section D](#d-environment-variables))
- [ ] `NEXT_PUBLIC_APP_URL` set to the final HTTPS domain (no trailing slash)
- [ ] `JWT_SECRET` is unique to production (not copied from local)
- [ ] SMTP credentials work — tested by sending a real OTP

**Database**
- [ ] `npm run db:migrate:deploy` ran successfully against the production DB
- [ ] `npm run db:status` reports "Database schema is up to date"

**Build / runtime**
- [ ] `npm run build` succeeds in the deploy pipeline
- [ ] Service starts and listens on `$PORT`
- [ ] Visiting `/` returns 200 and renders the storefront
- [ ] Visiting `/api/storefront/products` returns JSON

**Admin**
- [ ] Logged in at `/admin/login` with the `SUPER_ADMIN_EMAIL`
- [ ] Created at least one product, category, and shipping zone
- [ ] Test order placed end-to-end (cart → checkout → order in admin)

**Public**
- [ ] All product images load
- [ ] Search, category filters, and pagination work on `/shop`
- [ ] Custom request form submits successfully
- [ ] `/cart` and `/checkout` flow works (COD)
- [ ] If Paymob is configured: a small test charge clears, webhook updates the order

**SEO**
- [ ] `https://yourdomain.com/sitemap.xml` returns all products + categories
- [ ] `https://yourdomain.com/robots.txt` returns the right rules
- [ ] Page titles look correct in browser tabs
- [ ] Google Search Console verified; sitemap submitted

**Domain / SSL**
- [ ] Custom domain pointed at the host (CNAME or A record)
- [ ] HTTPS active (lock icon in browser)
- [ ] HTTP redirects to HTTPS

---

_Last updated: 2026-05-15. For any question not covered here, start by reading `src/lib/utils/env.ts` (canonical env list) and `prisma/schema.prisma` (canonical data model)._
