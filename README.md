# Aquaku Shop — Modern Aquascaping E-Commerce Platform

A production-grade, fullstack e-commerce web application crafted specifically for aquascaping hobbyists, aquatic plant enthusiasts, and aquarium lifestyle products.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL, Auth & Storage)**, **Midtrans Snap Payment Gateway**, and backed by a **Laravel 11 REST API**.

---

## 🌟 Key Features

### 🛍️ 1. Storefront & Catalog
* **Dynamic Product Filtering**: Filter products instantly by Category, Badge (`New`, `Best Seller`, `Premium`), Tags (e.g. `Easy Care`, `High Light`, `Tissue Culture`), Search query (`q`), and Sort by price or name.
* **Product Detail Page**:
  * Multi-image interactive gallery with thumbnails.
  * Technical specifications table (dimensions, care level, lighting requirements, origin).
  * Dynamic related products recommendations.
  * Real-time customer reviews section with interactive 5-star rating breakdown and submission modal.

### 🛒 2. Cart & Checkout Flow
* **Cart Management**: Real-time synced cart persisted across sessions in `localStorage` with quantity adjustments, stock limit checks, and subtotal calculation.
* **Shipping Courier Options**: Courier fee calculation supporting Standard, Express Air, and Same-Day delivery.
* **Promo & Voucher System**: Real-time voucher code validation with percentage discounts, fixed price reductions, minimum spend requirements, and discount caps.
* **Payment Integration**:
  * **Midtrans Snap**: Secure digital payment gateway supporting QRIS (GoPay/ShopeePay/Dana), Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata), and Credit Cards.
  * **Cash on Delivery (COD)**: Alternate payment option.
* **Order Confirmation & Tracking**:
  * Real-time order progress timeline (`Pending` → `Processing` → `Shipped` → `Completed`).
  * Tracking number (Resi) banner with one-click clipboard copy and external courier tracking shortcut.

### 👤 3. Customer Account & Authentication
* **Authentication**: Supabase Auth integration with secure Sign In, Registration, Forgot Password, and Password Reset flows.
* **Account Dashboard**:
  * Personal profile management (Name, Phone number).
  * Default shipping address configuration.
  * Comprehensive Order History with live payment & delivery status badges, itemized order breakdown, and instant re-order action.

### 🌊 4. Community & Guides
* **Aquascape Showcase**: Community gallery featuring user-submitted aquascape tank setups, technical specs, and interactive like counter.
* **Aquascape Guides**: 7-phase step-by-step masterclass covering everything from hardscape layout and soil placement to CO2 balancing and cycling.

### 🛠️ 5. Admin Management Suite (`/manage`)
* **Analytics Overview**: Live revenue metrics, total orders, average order value, order status distributions, low-stock warnings, and top-selling products.
* **Product Catalog CRUD**: Create, edit, manage inventory/stock, set promotional badges, assign tags, upload product photos, and delete products.
* **Order Management**: Filter orders by status, update order statuses, assign shipping tracking numbers (resi), and manage orders.
* **Hero Slide Management**: Customize homepage carousel banners, slogans, and call-to-action buttons.
* **Promo Code Management**: Issue promotional discount codes with expiration dates and discount caps.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.12 (App Router) | High-performance React framework with Server & Client Components |
| **UI Library** | React 19.2 | Modern concurrent rendering and hooks |
| **Language** | TypeScript 5 | Strict static typing and end-to-end interface safety |
| **Styling** | Tailwind CSS 3.4 | Utility-first design system based on curated nature tokens |
| **Icons** | Lucide React | Modern, consistent iconography |
| **Database & Auth** | Supabase (PostgreSQL) | Managed database, authentication service, and object storage |
| **Payment Gateway** | Midtrans Snap | Indonesian payment gateway (QRIS, VA, E-wallets, Credit Card) |
| **Backend API** | Laravel 11 | API proxy and business logic controller (`aquaku-api`) |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 20.x or higher
* npm 10.x or higher
* Laravel 11 backend running on `http://127.0.0.1:8000` (or configured via environment variables)

### Installation

1. Clone the repository and navigate to the storefront directory:
   ```bash
   cd aquascape-store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

   **Environment Variables Reference:**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Backend API Endpoint
   AQUAKU_API_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_AQUAKU_API_URL=http://127.0.0.1:8000

   # Midtrans Payment Gateway
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Validate Code Quality:
   ```bash
   # Run ESLint validation
   npm run lint

   # Run TypeScript compilation check
   npx tsc --noEmit

   # Build for production
   npm run build
   ```

---

## 📁 Project Directory Structure

```
aquascape-store/
├── app/                      # Next.js App Router routes
│   ├── layout.tsx            # Global layout with font setup & metadata
│   ├── page.tsx              # Homepage
│   ├── shop/                 # Catalog & filter page
│   ├── product/[slug]/       # Product detail with reviews & specs
│   ├── cart/                 # Cart review & summary
│   ├── checkout/             # Midtrans checkout & payment
│   │   └── success/          # Order success & tracking details
│   ├── account/              # Customer profile & order history
│   ├── manage/               # Admin management portal
│   ├── community/            # Aquascape showcase & submissions
│   ├── guides/               # Step-by-step setup guides
│   ├── login/ & register/    # Authentication pages
│   └── (static)/             # About, Privacy, Terms, Shipping info
├── components/               # Modular UI Components
│   ├── layout/               # Navbar, Footer
│   ├── home/                 # Hero, CategoryGrid, FeaturedProducts, etc.
│   ├── shop/                 # ProductCatalog with search & filter panel
│   ├── product/              # ProductDetailView, ProductReviewsSection
│   ├── cart/                 # CartView
│   ├── checkout/             # CheckoutView, MidtransSnapScript, OrderSuccessView
│   ├── account/              # AccountView
│   ├── admin/                # AdminDashboard, ManageProductsView, ManageOrdersView, etc.
│   └── ui/                   # Shared UI (ProductCard, StarRating, Badge, SectionHeading)
├── lib/                      # Utilities & API integration layer
│   ├── api/                  # Typed client functions (products, orders, auth, reviews, promos)
│   ├── cart-context.tsx      # Global cart state & localStorage sync
│   ├── format.ts             # Currency formatter (IDR)
│   └── types.ts              # TypeScript domain types & interfaces
├── supabase/                 # PostgreSQL schema definitions & migrations
└── public/                   # Static assets, icons, and placeholder media
```

---

## 🛡️ Security & Dependency Compliance

This project enforces strict security standards:
* Pinned on **Next.js 16.2.12 LTS** with **React 19.2** and **ESLint 9**.
* Dependency overrides in `package.json` protect against upstream transitive vulnerabilities (`sharp`, `postcss`, `brace-expansion`).
* Sensitive Supabase service keys are kept strictly on server-side requests and never leaked to browser bundles.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
