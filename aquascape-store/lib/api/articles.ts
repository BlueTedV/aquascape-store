import { authenticatedRequest, publicRequest } from "./auth";

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  author: string;
  readTime: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleAdminInput {
  title: string;
  slug?: string;
  category: string;
  summary: string;
  content: string;
  tags?: string[];
  author?: string;
  readTime?: string;
  isPublished?: boolean;
  featured?: boolean;
}

export const ARTICLE_CATEGORIES = [
  "All",
  "Shipping & Guarantee",
  "Plants & Flora",
  "Equipment & Lighting",
  "Water Chemistry & Care",
  "Hardscape & Layout",
  "General Help",
] as const;

export const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: "art-1",
    slug: "how-we-pack-and-ship-live-plants-safely",
    title: "How We Pack & Ship Live Plants Safely",
    category: "Shipping & Guarantee",
    summary:
      "Learn about our multi-layer insulated packing method that keeps live aquatic plants hydrated and fresh in transit.",
    content: `## Insulated Temperature-Controlled Packaging
Every live plant harvested from our nursery is carefully inspected for health and pests, then sealed with moisture-retaining botanical tissue.

### Key Packaging Steps:
1. **Pest & Snail Inspection**: Each portion is submerged in a botanical rinse and hand-checked leaf by leaf.
2. **Moisture-Sealed Oxygen Bags**: Plants are sealed with pure oxygenated air and damp substrate tissue to prevent dehydration.
3. **Insulated Thermal Boxes**: Shipped in high-density foam cooler boxes with cold packs during summer or heat packs during colder seasons.
4. **Fast Transit Dispatch**: We only dispatch live livestock Monday through Thursday to avoid weekend courier delays.

If your package experiences transit delays or damage, our **100% Live Arrival Guarantee** will cover a prompt replacement.`,
    tags: ["shipping", "plants", "packaging", "guarantee"],
    author: "Dr. Kevin Arisandy (Botanist)",
    readTime: "3 min read",
    isPublished: true,
    featured: true,
    createdAt: "2024-03-15T08:00:00.000Z",
  },
  {
    id: "art-2",
    slug: "live-arrival-guarantee-policy-and-claims",
    title: "100% Live Arrival Guarantee Policy & Claims",
    category: "Shipping & Guarantee",
    summary:
      "Everything you need to know about claiming a replacement or refund for dead-on-arrival (DOA) plants or livestock.",
    content: `## Our Promise to Every Aquascaper
We guarantee that all live plants, ornamental fish, and dwarf shrimp will arrive alive, healthy, and vigorous.

### How to File a DOA Claim:
- **Timeframe**: Take clear photos or a short video of the unopened bag within **2 hours** of package delivery timestamp.
- **Submission**: Send the photo to \`support@aquakushop.com\` or directly via our Live WhatsApp chat with your **Order Number**.
- **Resolution**: Choose between an immediate free replacement dispatch or a 100% refund / store credit.

No lengthy claim forms or return shipments required for perished livestock.`,
    tags: ["doa", "guarantee", "refund", "claims"],
    author: "Aquaku Support Team",
    readTime: "2 min read",
    isPublished: true,
    featured: true,
    createdAt: "2024-03-16T09:30:00.000Z",
  },
  {
    id: "art-3",
    slug: "beginners-guide-to-nitrogen-cycling",
    title: "Beginner’s Guide to Nitrogen Cycling in Planted Tanks",
    category: "Water Chemistry & Care",
    summary:
      "Understand the beneficial bacterial cycle to safely introduce livestock without ammonia spikes.",
    content: `## What is the Nitrogen Cycle?
The nitrogen cycle converts toxic organic waste (fish waste, melting leaves) into harmless compounds via beneficial nitrifying bacteria.

### The 3 Stages of Cycling:
1. **Ammonia (NH3/NH4+) Spike**: Waste breaks down into toxic ammonia.
2. **Nitrite (NO2-) Rise**: *Nitrosomonas* bacteria convert ammonia into toxic nitrite.
3. **Nitrate (NO3-) Accumulation**: *Nitrobacter* bacteria convert nitrite into relatively safe nitrate, absorbed by plants as fertilizer.

### Recommended Steps:
- Dose starter bacteria daily for the first 14 days.
- Perform 30-50% water changes twice weekly during the first 3 weeks when using nutrient-rich active aqua soil.
- Test water with liquid test kits until Ammonia and Nitrite are strictly 0 ppm before introducing shrimp or sensitive fish.`,
    tags: ["cycling", "nitrogen", "water-parameters", "bacteria"],
    author: "Master Scaper Andra",
    readTime: "5 min read",
    isPublished: true,
    featured: false,
    createdAt: "2024-03-18T10:15:00.000Z",
  },
  {
    id: "art-4",
    slug: "balancing-high-light-and-co2-injection",
    title: "Balancing High-Light and CO2 Injection",
    category: "Equipment & Lighting",
    summary:
      "Avoid algae blooms by harmonizing PAR lighting intensity with pressurized carbon dioxide levels.",
    content: `## The Light-CO2 Equilibrium
Lighting acts as the gas pedal in a planted aquarium. The brighter the light, the faster plants demand carbon dioxide (CO2) and nutrients.

### Best Practices:
- **Photoperiod**: Start new setups with a maximum of 6 hours daily, gradually increasing to 7-8 hours after 4 weeks.
- **CO2 Target**: Aim for 25-30 ppm dissolved CO2 (indicated by a lime-green drop checker).
- **Timer Staggering**: Turn on CO2 injection 1-2 hours *before* lights turn on, and turn off CO2 1 hour *before* lights turn off.
- **Surface Agitation**: Ensure gentle surface ripple for adequate oxygen exchange during night hours.`,
    tags: ["co2", "lighting", "algae", "equipment"],
    author: "Aquaku Tech Team",
    readTime: "4 min read",
    isPublished: true,
    featured: false,
    createdAt: "2024-03-20T11:00:00.000Z",
  },
  {
    id: "art-5",
    slug: "custom-aquascape-builds-and-consultation",
    title: "Custom Aquascape Builds & Installation Inquiries",
    category: "General Help",
    summary:
      "Learn how our bespoke aquascaping design service works for private homes, offices, and showroom installations.",
    content: `## Tailored Nature Aquarium Builds
Looking for a turnkey, competition-grade Nature Aquarium or Iwagumi setup designed specifically for your space?

### What Our Service Includes:
1. **Initial Space & Tank Consultation**: Tank dimensions, low-iron glass specifications, cabinet styles, and lighting rigs.
2. **Hardscape Mockup & Approval**: Our artists assemble Dragon Stone or Root Wood layouts in dry boxes and share 3D photos for your feedback.
3. **Plant Palette Design**: Curating foreground carpet, stem heights, and epiphytes matching your desired maintenance level.
4. **On-Site Installation or Pre-Assembled Delivery**: Full white-glove setup and biological cycling guidance.

Reach out via the contact form or email \`support@aquakushop.com\` with your room dimensions to receive a quote within 24 hours.`,
    tags: ["custom-build", "services", "consultation"],
    author: "Design Studio Team",
    readTime: "3 min read",
    isPublished: true,
    featured: true,
    createdAt: "2024-03-22T14:20:00.000Z",
  },
  {
    id: "art-6",
    slug: "choosing-the-right-substrate-active-soil-vs-inert-sand",
    title: "Choosing the Right Substrate: Active Soil vs Inert Sand",
    category: "Hardscape & Layout",
    summary:
      "A complete guide on active buffering soils vs inert cosmetic sands for plant root growth and shrimp health.",
    content: `## Substrate Foundation Comparison
Choosing the correct aquarium substrate directly determines plant vitality and water stability.

### Active Aqua Soil:
- Lowers pH and buffers KH naturally for acid-loving plants and Caridina shrimp.
- Packed with essential iron, potassium, and micronutrients for root feeders (Cryptocoryne, Amazon Swords).

### Inert Sand & Gravel:
- Chemically neutral (does not change pH/GH).
- Ideal for decorative foreground paths, hardscape canyons, and bottom dwellers like Corydoras.`,
    tags: ["substrate", "soil", "sand", "hardscape"],
    author: "Botanical Specialist Rian",
    readTime: "4 min read",
    isPublished: true,
    featured: false,
    createdAt: "2024-03-25T16:00:00.000Z",
  },
];

// In-memory / local storage fallback cache for dynamic client updates
let localArticlesCache: ArticleItem[] = [...DEFAULT_ARTICLES];

function filterArticlesLocally(
  articles: ArticleItem[],
  query?: string,
  category?: string,
  publishedOnly = true
): ArticleItem[] {
  let result = publishedOnly ? articles.filter((a) => a.isPublished) : [...articles];

  if (category && category !== "All") {
    result = result.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getArticles(params?: {
  query?: string;
  category?: string;
}): Promise<ArticleItem[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("q", params.query);
    if (params?.category && params.category !== "All") searchParams.set("category", params.category);

    const queryStr = searchParams.toString();
    const endpoint = `/api/articles${queryStr ? `?${queryStr}` : ""}`;
    const data = await publicRequest<ArticleItem[]>(endpoint, {
      next: { revalidate: 120, tags: ["articles"] },
    });
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Articles API unavailable, using local articles data:", err);
  }

  return filterArticlesLocally(localArticlesCache, params?.query, params?.category, true);
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  try {
    const data = await publicRequest<ArticleItem>(`/api/articles/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120, tags: ["articles"] },
    });
    if (data) return data;
  } catch (err) {
    console.warn("Articles API detail unavailable:", err);
  }

  const found = localArticlesCache.find((a) => a.slug === slug);
  return found ?? null;
}

export async function getAdminArticles(params?: {
  query?: string;
  category?: string;
}): Promise<ArticleItem[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("q", params.query);
    if (params?.category && params.category !== "All") searchParams.set("category", params.category);

    const queryStr = searchParams.toString();
    const endpoint = `/api/admin/articles${queryStr ? `?${queryStr}` : ""}`;
    const data = await authenticatedRequest<ArticleItem[]>(endpoint);
    if (Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn("Admin articles API unavailable, using local articles cache:", err);
  }

  return filterArticlesLocally(localArticlesCache, params?.query, params?.category, false);
}

export async function createAdminArticle(input: ArticleAdminInput): Promise<ArticleItem> {
  try {
    const newArticle = await authenticatedRequest<ArticleItem>("/api/admin/articles", {
      method: "POST",
      body: JSON.stringify(input),
    });
    localArticlesCache = [newArticle, ...localArticlesCache];
    return newArticle;
  } catch (err) {
    console.warn("API create failed, saving to local state:", err);
    const slug = input.slug?.trim() || input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const created: ArticleItem = {
      id: `art-${Date.now()}`,
      slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      content: input.content,
      tags: input.tags || [],
      author: input.author || "Aquaku Specialist",
      readTime: input.readTime || "3 min read",
      isPublished: input.isPublished !== undefined ? input.isPublished : true,
      featured: input.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localArticlesCache = [created, ...localArticlesCache];
    return created;
  }
}

export async function updateAdminArticle(id: string, input: ArticleAdminInput): Promise<ArticleItem> {
  try {
    const updated = await authenticatedRequest<ArticleItem>(`/api/admin/articles/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    localArticlesCache = localArticlesCache.map((a) => (a.id === id ? updated : a));
    return updated;
  } catch (err) {
    console.warn("API update failed, updating in local state:", err);
    let updatedItem: ArticleItem | null = null;
    localArticlesCache = localArticlesCache.map((a) => {
      if (a.id === id) {
        updatedItem = {
          ...a,
          title: input.title ?? a.title,
          slug: input.slug ?? a.slug,
          category: input.category ?? a.category,
          summary: input.summary ?? a.summary,
          content: input.content ?? a.content,
          tags: input.tags ?? a.tags,
          author: input.author ?? a.author,
          readTime: input.readTime ?? a.readTime,
          isPublished: input.isPublished !== undefined ? input.isPublished : a.isPublished,
          featured: input.featured !== undefined ? input.featured : a.featured,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return a;
    });
    if (updatedItem) return updatedItem;
    throw err;
  }
}

export async function deleteAdminArticle(id: string): Promise<boolean> {
  try {
    await authenticatedRequest<{ deleted: boolean }>(`/api/admin/articles/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("API delete failed, removing from local state:", err);
  }
  localArticlesCache = localArticlesCache.filter((a) => a.id !== id);
  return true;
}
