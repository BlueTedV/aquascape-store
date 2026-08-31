# Aquaku — Aquascaping E-Commerce & Knowledge Platform

Aquaku is a fullstack e-commerce web application and community platform designed for aquascaping hobbyists, aquatic plant enthusiasts, and aquarium lifestyle products.

The architecture consists of a **Next.js 16 (App Router)** storefront paired with a **Laravel 11 REST API**, utilizing **Supabase (PostgreSQL, Authentication & Storage)** and the **Midtrans Snap Payment Gateway**.

---

## Key Features

### 1. Storefront & Product Catalog
- **Multi-parameter Filtering**: Filter products by Category, Badges (`New`, `Best Seller`, `Premium`, `Sale`), Tags (e.g. `Easy Care`, `High Light`, `Tissue Culture`), stock availability, and keyword search (`q`).
- **Flexible Sorting**: Sort items by price (ascending/descending), alphabetical name (A–Z / Z–A), and latest additions.
- **Product Details & Gallery**: Multi-angle image gallery with full WebP/PNG support, detailed technical specifications (dimensions, care level, lighting requirements, CO2 requirements, placement, origin, growth rate), and related product recommendations.
- **Dynamic Customer Reviews**: Authentic 1–5 star rating system where verified customers can submit written feedback, dynamically calculating real-time average scores and star rating distribution breakdowns.

### 2. Shopping Cart, Vouchers & Midtrans Checkout
- **Cart Management**: Client-side and account-synchronized shopping cart supporting real-time quantity adjustments and item removals.
- **Promotional Vouchers**: Supports percentage discounts, fixed-amount discounts, and free shipping vouchers with minimum purchase subtotal requirements and maximum discount caps.
- **Midtrans Snap Integration**: Secure Indonesian payment gateway supporting QRIS, Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata), E-wallets (GoPay, ShopeePay), and Credit Cards.
- **Webhook Callback Processing**: Real-time transaction state synchronization handling settlement, pending, expired, cancelled, and denied payment states.

### 3. Order Management & Official Invoicing
- **Printable A4 Invoices**: Official formatted receipts at `/orders/[orderNumber]/invoice` with order reference number (`INV/...`), customer details, shipping address, courier information, tracking number (resi), and itemized fee breakdown.
- **Order Lifecycle Tracking**: Order state transitions (`Pending`, `Processing`, `Shipped`, `Completed`, `Cancelled`) visible in customer dashboards and admin suites.

### 4. Aquascaping Tank & Equipment Calculator
- **Water Volume Estimator**: Computes gross and net water volume in Liters and US Gallons for standard rimless tank sizes (Nano 30C, 45P, 60P, 90P, 120P) or custom dimensions.
- **Substrate & Slope Calculator**: Calculates substrate volume in Liters and kilograms, estimating required commercial bag quantities based on front and back depth gradients.
- **Equipment Sizing Recommendations**: Automatic sizing calculations for lighting (lumens and watts for Low-Tech vs. High-Tech setups), canister filter flow rates (6x–10x turnover), CO2 bubble rates, heater wattage, and safe bioload / fish capacity.

### 5. Setup Guides & Community Showcase
- **Aquascape Setup Masterclass (`/guides`)**: Curated step-by-step guides covering hardscape placement, substrate layering, aquatic planting, water cycling, CO2 injection, and algae prevention.
- **Community Aquascape Gallery (`/community`)**: Community showcase featuring user-submitted aquarium setups, complete equipment/flora/fauna specifications, and interactive like counts.

### 6. Help Center & Knowledge Base
- **Knowledge Base & Search (`/articles`, `/contact`)**: Browse and search support articles by topic, keywords, or tags.
- **Markdown Support**: Native GitHub-flavored Markdown rendering for guides, troubleshooting checklists, callouts, and step-by-step procedures.
- **Admin Markdown Editor**: Interactive split-view editor with formatting toolbar (headers, bold, italics, lists, code blocks, quotes, tables) and live preview.

### 7. Customer Accounts & Wishlist
- **Authentication**: Supabase Auth integration supporting Sign In, Registration, and Password Reset workflows.
- **Account Dashboard (`/account`)**: Profile information management, default shipping address updates, and comprehensive past order history with invoice links.
- **Persistent Wishlist (`/wishlist`)**: Save favorite products across sessions with a one-click "Add All to Cart" action.

### 8. Admin Management Suite (`/manage`)
- **Analytics Overview**: Live revenue metrics, total orders, average order value, order status distributions, low-stock warnings, and top-selling products.
- **Product Catalog Management**: Create, edit, and delete products, manage stock levels, assign categories and badges, configure specifications JSON, and upload product gallery images.
- **Order Processing**: Filter orders by status, update delivery states, assign courier tracking numbers (resi), view customer invoices, and execute bulk cleanup.
- **Article Management**: Create, edit, tag, and publish help articles using the integrated Markdown editor.
- **Promotions & Vouchers**: Create promotional discount codes with custom rules and track usage limits.
- **Hero Carousel Banners**: Customize homepage hero carousel banners, call-to-action buttons, links, and slide ordering.
- **Media Uploads**: Direct image uploads to Supabase Storage with automatic URL generation and fallback protection.

---

## Technology Stack

| Layer | Technology | Version / Details |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.2.x` |
| **UI Library** | React | `19.2.x` |
| **Language** | TypeScript | `5.6.x` |
| **Styling** | Tailwind CSS | `3.4.x` |
| **Icons** | Lucide React | `0.427.x` |
| **Backend Framework** | Laravel REST API | `11.x` / `12.x` (PHP `^8.3`) |
| **Database & Auth** | Supabase (PostgreSQL) | Auth, Database, Storage, Row Level Security (RLS) |
| **Payment Gateway** | Midtrans Snap | PHP SDK `midtrans/midtrans-php` |
| **Architecture Modeling** | Draw.io XML Models | Use Case, CDM, ERD, PDM, DFD Level 0 & Level 1 |

---

## Project Structure

```
c:\ukk\
├── AquakuShop_Diagram.drawio      # Comprehensive Draw.io system diagram
├── AquakuShop_Diagram.drawio.xml  # Draw.io XML diagram export
├── diagrams/                      # System design and architecture models
│   ├── 1_Use_Case_Diagram.drawio.xml
│   ├── 2_CDM_Diagram.drawio.xml
│   ├── 3_ERD_Diagram.drawio.xml
│   ├── 4_PDM_Diagram.drawio.xml
│   ├── 5_DFD_Level_0_Diagram.drawio.xml
│   └── 6_DFD_Level_1_Diagram.drawio.xml
│
├── aquascape-store/               # Frontend Web Application (Next.js 16)
│   ├── app/                       # App Router pages and route handlers
│   │   ├── (auth)/                # Login, register, password reset routes
│   │   ├── about/                 # About company page
│   │   ├── account/               # Customer account dashboard & order history
│   │   ├── articles/              # Knowledge base & guide articles
│   │   ├── calculator/            # Aquascape tank & substrate calculator
│   │   ├── cart/                  # Shopping cart view
│   │   ├── checkout/              # Midtrans Snap checkout & success view
│   │   ├── community/             # Aquascape community showcase
│   │   ├── contact/               # Support & FAQ search
│   │   ├── guides/                # Curated aquascaping tutorials
│   │   ├── manage/                # Admin dashboard suite
│   │   ├── orders/[orderNumber]/  # Printable A4 customer invoices
│   │   ├── privacy/ & terms/      # Legal & compliance pages
│   │   ├── product/[slug]/        # Product detail page & reviews
│   │   ├── shipping/              # Shipping information
│   │   ├── shop/                  # Catalog search & multi-filter page
│   │   └── wishlist/              # Saved favorite products
│   ├── components/                # Modular UI components
│   │   ├── account/               # Account profile & address forms
│   │   ├── admin/                 # Admin views, product forms, Markdown editor
│   │   ├── auth/                  # Authentication modals & forms
│   │   ├── calculator/            # Interactive calculator modules
│   │   ├── cart/ & checkout/      # Cart drawer, order summary, Midtrans modal
│   │   ├── home/                  # Hero carousel, featured grid, guides section
│   │   ├── layout/                # Navbar, Footer, Mobile Navigation
│   │   ├── order/                 # Invoice layout & tracking status
│   │   ├── product/               # ProductDetailView, ProductReviewsSection
│   │   ├── shop/                  # Filter sidebar, sort bar, product cards
│   │   └── ui/                    # MarkdownRenderer, Badges, Modals, Buttons
│   ├── lib/                       # API clients, contexts, and utilities
│   │   ├── api/                   # Typed API modules (products, orders, reviews, etc.)
│   │   ├── supabase/              # Supabase client, server, and middleware helpers
│   │   ├── cart-context.tsx       # Persistent cart context provider
│   │   └── wishlist-context.tsx   # Persistent wishlist context provider
│   └── supabase/                  # SQL schema references for frontend development
│
└── aquaku-api/                    # Backend REST API (Laravel 11)
    ├── app/Http/Controllers/Api/  # REST API Controllers
    │   ├── AccountController.php      # User profile & saved addresses
    │   ├── AdminProductController.php # Product catalog administration
    │   ├── AdminUploadController.php  # Image upload handler
    │   ├── ArticleController.php      # Knowledge base article endpoints
    │   ├── AuthController.php         # Supabase Auth proxy endpoints
    │   ├── GalleryController.php      # Community showcase endpoints
    │   ├── HeroSlideController.php    # Homepage carousel banner endpoints
    │   ├── OrderController.php        # Checkout, order tracking, Midtrans callback
    │   ├── ProductController.php      # Product catalog, categories, related items
    │   ├── PromoController.php        # Voucher validation & administration
    │   └── ReviewController.php       # Product ratings & reviews
    ├── app/Services/              # Core business logic & integrations
    │   ├── MidtransService.php        # Midtrans Snap transaction & notification handler
    │   ├── SupabaseCatalogService.php # Supabase product & category queries
    │   ├── SupabaseOrderService.php   # Order creation, items, & status management
    │   ├── SupabaseStorageService.php # Supabase object storage file uploads
    │   └── VoucherService.php         # Discount calculations & voucher verification
    ├── database/sql/              # Supabase SQL migration files
    │   ├── schema.sql                 # Base tables, foreign keys, and indexes
    │   ├── reviews.sql                # Reviews table & rating aggregation triggers
    │   ├── articles.sql               # Articles, tags, and article_tags tables
    │   ├── promos.sql                 # Promotional vouchers & discount rules
    │   ├── hero_slides.sql            # Homepage hero carousel slides
    │   ├── gallery.sql                # Community showcase & like counters
    │   ├── orders.sql                 # Order lifecycle & courier tracking columns
    │   ├── add-voucher-discount-to-orders.sql # Voucher tracking on orders
    │   ├── admin-support.sql          # Admin helper functions & role checks
    │   └── fix-product-read-grants.sql# Public access permissions
    └── routes/api.php             # REST API route definitions
```

---

## Getting Started

### Prerequisites
- **Node.js**: `20.x` or higher
- **npm**: `10.x` or higher
- **PHP**: `8.2` or higher (`8.3` recommended) with extensions: `curl`, `mbstring`, `openssl`, `pdo`, `pdo_sqlite` or `pdo_pgsql`
- **Composer**: `2.x` or higher
- A **Supabase** project (Project URL, Anon Key, Service Role Key)
- A **Midtrans** account (Server Key, Client Key) for payment processing

---

### 1. Database Setup (Supabase)

Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and run the SQL migration scripts located in `aquaku-api/database/sql/` in the SQL Editor in the following order:

1. `schema.sql` — Creates base tables (`categories`, `products`, `profiles`, `shipping_addresses`, `orders`, `order_items`) and initial RLS policies.
2. `reviews.sql` — Creates `reviews` table and automated trigger functions for updating product rating averages and review counts.
3. `articles.sql` — Creates `articles`, `tags`, and `article_tags` tables with fulltext indexes.
4. `promos.sql` — Creates `promos` table for promotional vouchers.
5. `hero_slides.sql` — Creates `hero_slides` table for homepage carousel banners.
6. `gallery.sql` — Creates `gallery_items` table for user tank setups and like counts.
7. `orders.sql` — Enhances order status and tracking fields.
8. `add-voucher-discount-to-orders.sql` — Adds voucher code and discount tracking columns to orders.
9. `admin-support.sql` — Installs admin role validation functions and security policies.
10. `fix-product-read-grants.sql` — Grants public read access for catalog browsing.

> [!NOTE]
> Make sure to create a public storage bucket named `product-images` in Supabase Storage with public read permissions for product and banner media uploads.

---

### 2. Backend Setup (`aquaku-api`)

1. Navigate to the backend directory:
   ```bash
   cd aquaku-api
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Configure environment variables:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env

   # On Linux/macOS:
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Edit `.env` with your Supabase and Midtrans credentials:
   ```env
   APP_NAME=Aquaku
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://127.0.0.1:8000
   FRONTEND_URL=http://localhost:3000

   # Supabase Configuration
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_STORAGE_BUCKET=product-images

   # Admin Configuration
   ADMIN_EMAILS=owner@example.com
   ADMIN_DELETE_PASSCODE=admin123

   # Midtrans Payment Gateway
   MIDTRANS_SERVER_KEY=your-midtrans-server-key
   MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   MIDTRANS_IS_PRODUCTION=false
   MIDTRANS_IS_SANITIZED=true
   MIDTRANS_IS_3DS=true
   ```

6. Start the Laravel development server:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://127.0.0.1:8000`.

---

### 3. Frontend Setup (`aquascape-store`)

1. Navigate to the frontend directory:
   ```bash
   cd aquascape-store
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env.local

   # On Linux/macOS:
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Backend API URL
   AQUAKU_API_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_AQUAKU_API_URL=http://127.0.0.1:8000

   # Midtrans Client Configuration
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Code Verification & Build Commands:
   ```bash
   # Run TypeScript type check
   npx tsc --noEmit

   # Run ESLint validation
   npm run lint

   # Create production build
   npm run build
   ```

---

## API Reference Overview

### Public & Storefront Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | Retrieve all product categories |
| `GET` | `/api/products` | Query product catalog with filters (`category`, `badge`, `q`, `sort`, `stock`) |
| `GET` | `/api/products/featured` | Fetch featured products for homepage highlights |
| `GET` | `/api/products/{slug}` | Retrieve single product details and technical specifications |
| `GET` | `/api/products/{slug}/related` | Fetch related product recommendations |
| `GET` | `/api/products/{slug}/reviews` | List customer reviews and rating summary |
| `POST` | `/api/products/{slug}/reviews` | Submit a new customer review (1–5 stars) |
| `GET` | `/api/hero-slides` | Retrieve active homepage hero carousel slides |
| `GET` | `/api/articles` | List published knowledge base articles with tag filters |
| `GET` | `/api/articles/{slug}` | Retrieve article details and Markdown content |
| `GET` | `/api/gallery` | List community aquascape setups |
| `POST` | `/api/gallery` | Submit a user aquascape setup |
| `POST` | `/api/gallery/{id}/like` | Increment like count for a community setup |
| `POST` | `/api/vouchers/validate` | Validate promo code and calculate discount values |
| `POST` | `/api/orders/checkout` | Create order and generate Midtrans Snap payment token |
| `GET` | `/api/orders/{orderNumber}` | Retrieve order details and invoice data |
| `POST` | `/api/midtrans/notification` | Webhook endpoint for Midtrans payment status notifications |

### Authentication & Account Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new customer account |
| `POST` | `/api/auth/login` | Authenticate customer credentials and return session |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/auth/logout` | Invalidate active user session |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Update account password using recovery token |
| `PUT` | `/api/account/profile` | Update account full name and phone number |
| `PUT` | `/api/account/shipping-address` | Save or update default shipping address |
| `GET` | `/api/account/orders` | List order history for authenticated user |

### Admin Suite Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/analytics` | Retrieve revenue, orders, inventory warnings, and top products |
| `GET` | `/api/admin/products` | Retrieve all catalog products for administration |
| `POST` | `/api/admin/products` | Create a new catalog product |
| `PUT` | `/api/admin/products/{id}` | Update product information, stock, and specifications |
| `DELETE`| `/api/admin/products` | Purge or reset catalog items (requires passcode) |
| `GET` | `/api/admin/orders` | List all customer orders with filtering |
| `PATCH`| `/api/admin/orders/{id}/status` | Update order status and assign courier tracking numbers |
| `DELETE`| `/api/admin/orders` | Bulk purge orders (requires passcode) |
| `GET` | `/api/admin/hero-slides` | List hero carousel slides |
| `POST` | `/api/admin/hero-slides` | Create a new hero carousel slide |
| `DELETE`| `/api/admin/hero-slides/{id}` | Delete a hero carousel slide |
| `GET` | `/api/admin/promos` | List promotional vouchers |
| `POST` | `/api/admin/promos` | Create a promotional voucher code |
| `DELETE`| `/api/admin/promos/{id}` | Remove a promotional voucher |
| `GET` | `/api/admin/articles` | List all articles including drafts |
| `POST` | `/api/admin/articles` | Create a knowledge base article |
| `PUT` | `/api/admin/articles/{id}` | Update article content and metadata |
| `DELETE`| `/api/admin/articles/{id}` | Delete a knowledge base article |
| `POST` | `/api/admin/uploads/images` | Upload image files directly to Supabase Storage |

---

## Security & Architecture Considerations

- **Role-Based Access Control (RBAC)**: Sensitive administrative endpoints verify user credentials against configured `ADMIN_EMAILS` and database roles.
- **Row-Level Security (RLS)**: Supabase PostgreSQL tables utilize granular RLS policies to restrict unauthorized data mutations.
- **Secret Isolation**: Critical keys (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `ADMIN_DELETE_PASSCODE`) are restricted to server-side environments and never exposed in frontend browser bundles.
- **Payment Verification**: Midtrans webhook signatures are validated against order hashes to prevent replay or spoofed notification attacks.

---

## License

This project is licensed under the [MIT License](LICENSE).

