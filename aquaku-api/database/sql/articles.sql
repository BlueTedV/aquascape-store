-- Run this migration in Supabase SQL Editor to create the help articles table for Aquaku Shop

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General Help',
  summary text NOT NULL,
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  author text NOT NULL DEFAULT 'Aquaku Specialist',
  read_time text NOT NULL DEFAULT '3 min read',
  is_published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);

-- Grant privileges for public read and service role write
GRANT SELECT ON public.articles TO anon, authenticated, service_role;
GRANT ALL ON public.articles TO service_role;

-- Seed initial Help Articles for the Knowledge Base
INSERT INTO public.articles (slug, title, category, summary, content, tags, author, read_time, is_published, featured)
VALUES
(
  'how-we-pack-and-ship-live-plants-safely',
  'How We Pack & Ship Live Plants Safely',
  'Shipping & Guarantee',
  'Learn about our multi-layer insulated packing method that keeps live aquatic plants hydrated and fresh in transit.',
  '## Insulated Temperature-Controlled Packaging
Every live plant harvested from our nursery is carefully inspected for health and pests, then sealed with moisture-retaining botanical tissue.

### Key Packaging Steps:
1. **Pest & Snail Inspection**: Each portion is submerged in a botanical rinse and hand-checked.
2. **Moisture-Sealed Bags**: Plants are sealed with pure oxygenated air and damp substrate tissue to prevent dehydration.
3. **Insulated Thermal Boxes**: Shipped in high-density foam cooler boxes with cold packs during summer or heat packs during colder seasons.
4. **Fast Transit Dispatch**: We only dispatch live livestock Monday through Thursday to avoid weekend courier delays.

If your package experiences transit delays or damage, our **100% Live Arrival Guarantee** will cover a prompt replacement.',
  ARRAY['shipping', 'plants', 'packaging', 'guarantee'],
  'Dr. Kevin Arisandy (Botanist)',
  '3 min read',
  true,
  true
),
(
  'live-arrival-guarantee-policy-and-claims',
  '100% Live Arrival Guarantee Policy & Claims',
  'Shipping & Guarantee',
  'Everything you need to know about claiming a replacement or refund for dead-on-arrival (DOA) plants or livestock.',
  '## Our Promise to Every Aquascaper
We guarantee that all live plants, ornamental fish, and dwarf shrimp will arrive alive, healthy, and vigorous.

### How to File a DOA Claim:
- **Timeframe**: Take clear photos or a short video of the unopened bag within **2 hours** of package delivery timestamp.
- **Submission**: Send the photo to `support@aquakushop.com` or directly via our Live WhatsApp chat with your **Order Number**.
- **Resolution**: Choose between an immediate free replacement dispatch or a 100% refund / store credit.

No lengthy claim forms or return shipments required for perished livestock.',
  ARRAY['doa', 'guarantee', 'refund', 'claims'],
  'Aquaku Support Team',
  '2 min read',
  true,
  true
),
(
  'beginners-guide-to-nitrogen-cycling',
  'Beginner’s Guide to Nitrogen Cycling in Planted Tanks',
  'Water Chemistry & Care',
  'Understand the beneficial bacterial cycle to safely introduce livestock without ammonia spikes.',
  '## What is the Nitrogen Cycle?
The nitrogen cycle converts toxic organic waste (fish waste, melting leaves) into harmless compounds via beneficial nitrifying bacteria.

### The 3 Stages of Cycling:
1. **Ammonia (NH3/NH4+) Spike**: Waste breaks down into toxic ammonia.
2. **Nitrite (NO2-) Rise**: *Nitrosomonas* bacteria convert ammonia into toxic nitrite.
3. **Nitrate (NO3-) Accumulation**: *Nitrobacter* bacteria convert nitrite into relatively safe nitrate, absorbed by plants as fertilizer.

### Recommended Steps:
- Dose starter bacteria daily for the first 14 days.
- Perform 30-50% water changes twice weekly during the first 3 weeks when using nutrient-rich active aqua soil.
- Test water with liquid test kits until Ammonia and Nitrite are strictly 0 ppm before introducing shrimp or sensitive fish.',
  ARRAY['cycling', 'nitrogen', 'water-parameters', 'bacteria'],
  'Master Scaper Andra',
  '5 min read',
  true,
  false
),
(
  'balancing-high-light-and-co2-injection',
  'Balancing High-Light and CO2 Injection',
  'Equipment & Lighting',
  'Avoid algae blooms by harmonizing PAR lighting intensity with pressurized carbon dioxide levels.',
  '## The Light-CO2 Equilibrium
Lighting acts as the gas pedal in a planted aquarium. The brighter the light, the faster plants demand carbon dioxide (CO2) and nutrients.

### Best Practices:
- **Photoperiod**: Start new setups with a maximum of 6 hours daily, gradually increasing to 7-8 hours after 4 weeks.
- **CO2 Target**: Aim for 25-30 ppm dissolved CO2 (indicated by a lime-green drop checker).
- **Timer Staggering**: Turn on CO2 injection 1-2 hours *before* lights turn on, and turn off CO2 1 hour *before* lights turn off.
- **Surface Agitation**: Ensure gentle surface ripple for adequate oxygen exchange during night hours.',
  ARRAY['co2', 'lighting', 'algae', 'equipment'],
  'Aquaku Tech Team',
  '4 min read',
  true,
  false
),
(
  'custom-aquascape-builds-and-consultation',
  'Custom Aquascape Builds & Installation Inquiries',
  'General Help',
  'Learn how our bespoke aquascaping design service works for private homes, offices, and showroom installations.',
  '## Tailored Nature Aquarium Builds
Looking for a turnkey, competition-grade Nature Aquarium or Iwagumi setup designed specifically for your space?

### What Our Service Includes:
1. **Initial Space & Tank Consultation**: Tank dimensions, low-iron glass specifications, cabinet styles, and lighting rigs.
2. **Hardscape Mockup & Approval**: Our artists assemble Dragon Stone or Root Wood layouts in dry boxes and share 3D photos for your feedback.
3. **Plant Palette Design**: Curating foreground carpet, stem heights, and epiphytes matching your desired maintenance level.
4. **On-Site Installation or Pre-Assembled Delivery**: Full white-glove setup and biological cycling guidance.

Reach out via the contact form or email `support@aquakushop.com` with your room dimensions to receive a quote within 24 hours.',
  ARRAY['custom-build', 'services', 'consultation'],
  'Design Studio Team',
  '3 min read',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  is_published = EXCLUDED.is_published,
  featured = EXCLUDED.featured,
  updated_at = now();
