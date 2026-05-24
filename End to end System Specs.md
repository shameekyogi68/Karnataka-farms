I have read through your \*\*entire 85-page PDF\*\* word by word. This is the most comprehensive nursery e-commerce specification I have ever seen.

Below is your \*\*final, actionable, solo-founder-friendly\*\* end-to-end specification. I have removed:  
\- Complex AI features (Plant.id, Google Vision → defer to Month 3+)  
\- Over-engineering (WebSockets, custom queues, microservices)  
\- High-cost integrations (Redis, dedicated servers)  
\- Anything that requires a team to maintain

What remains is \*\*production-ready, budget-friendly, and AI-model-friendly\*\* — you can give this to an AI (Cursor, Copilot, v0) and get a working site.

\---

\# KARNATAKA FARMS PLANT NURSERY  
\#\# FINAL END-TO-END DEVELOPMENT SPECIFICATION  
\#\#\# Budget Solo Founder Version | AI-Ready | Month 1 Launchable

\---

\#\# 0\. EXECUTIVE SUMMARY

| Item | Decision |  
|------|----------|  
| \*\*Stack\*\* | Next.js 14 \+ Tailwind CSS \+ Supabase (PostgreSQL) \+ Razorpay |  
| \*\*Hosting\*\* | Vercel (free tier) \+ Supabase (free tier) → ₹0/month for first 3 months |  
| \*\*Auth\*\* | Supabase Auth (magic link \+ Google) — no password complexity |  
| \*\*Payments\*\* | Razorpay (UPI, Cards, COD via manual verification) |  
| \*\*WhatsApp\*\* | Interakt (₹799/month) OR start with WhatsApp click-to-chat links (free) |  
| \*\*Email\*\* | Resend (free 3000 emails/month) or Brevo |  
| \*\*Maps\*\* | Google Places API (free ₹200 credit/month) |  
| \*\*Weather\*\* | OpenWeather API (free 1000 calls/day) |  
| \*\*Deploy\*\* | 1 person, 30 days to MVP |

\---

\#\# 1\. TECH STACK (FIXED — NO DEVIATION)

| Layer | Technology | Why |  
|-------|-----------|-----|  
| \*\*Frontend\*\* | Next.js 14 (App Router) | SEO, API routes, easy deployment |  
| \*\*Styling\*\* | Tailwind CSS | Mobile-first, no CSS conflicts |  
| \*\*Database\*\* | Supabase (PostgreSQL) | Free tier, built-in auth, real-time |  
| \*\*Auth\*\* | Supabase Auth | Magic links, Google OAuth, guest checkout support |  
| \*\*State\*\* | Zustand (client) \+ TanStack Query (server) | Simple, proven |  
| \*\*Forms\*\* | React Hook Form \+ Zod | Type-safe validation |  
| \*\*Payments\*\* | Razorpay | Indian market standard |  
| \*\*WhatsApp\*\* | Click-to-chat links (free) → Interakt later | Start free, upgrade later |  
| \*\*Email\*\* | Resend | Free 3000/month, React templates |  
| \*\*Maps\*\* | Google Places API | Address autofill |  
| \*\*Weather\*\* | OpenWeather API | Free tier sufficient |  
| \*\*Hosting\*\* | Vercel | Free, automatic deploys from GitHub |  
| \*\*Analytics\*\* | Vercel Analytics \+ Google Analytics 4 | Free |

\---

\#\# 2\. DATABASE SCHEMA (SUPABASE POSTGRESQL)

Run these in Supabase SQL editor exactly as written:

\`\`\`sql  
\-- 1\. Users table (extends Supabase auth)  
CREATE TABLE users (  
  id UUID PRIMARY KEY REFERENCES auth.users(id),  
  email VARCHAR(255) UNIQUE NOT NULL,  
  phone VARCHAR(20),  
  full\_name VARCHAR(255),  
  zip\_code VARCHAR(10),  
  hardiness\_zone INTEGER,  
  whatsapp\_opt\_in BOOLEAN DEFAULT FALSE,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 2\. Products table  
CREATE TABLE products (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  name\_en VARCHAR(200) NOT NULL,  
  name\_kn VARCHAR(200),  
  scientific\_name VARCHAR(200),  
  slug VARCHAR(200) UNIQUE NOT NULL,  
  description TEXT,  
  personality VARCHAR(100),  
  light\_level VARCHAR(20) CHECK (light\_level IN ('low', 'medium', 'bright')),  
  water\_frequency VARCHAR(50),  
  soil\_type VARCHAR(100),  
  growth\_speed VARCHAR(20),  
  pet\_safe BOOLEAN DEFAULT FALSE,  
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),  
  hardiness\_min INTEGER,  
  hardiness\_max INTEGER,  
  base\_price DECIMAL(10,2) NOT NULL,  
  compare\_price DECIMAL(10,2),  
  is\_active BOOLEAN DEFAULT TRUE,  
  is\_rescue BOOLEAN DEFAULT FALSE,  
  rescue\_discount INTEGER DEFAULT 50,  
  image\_urls TEXT\[\] DEFAULT '{}',  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 3\. Product sizes (variants)  
CREATE TABLE product\_sizes (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  product\_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,  
  size\_label VARCHAR(20) NOT NULL, \-- '4"', '6"', '10"'  
  pot\_diameter\_inches INTEGER,  
  price DECIMAL(10,2) NOT NULL,  
  stock\_quantity INTEGER DEFAULT 0,  
  sku VARCHAR(100) UNIQUE,  
  is\_default BOOLEAN DEFAULT FALSE  
);

\-- 4\. Categories  
CREATE TABLE categories (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  name VARCHAR(100) NOT NULL,  
  slug VARCHAR(100) UNIQUE NOT NULL,  
  icon VARCHAR(50),  
  display\_order INTEGER DEFAULT 0  
);

\-- 5\. Orders (guest checkout supported)  
CREATE TABLE orders (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  order\_number VARCHAR(50) UNIQUE NOT NULL,  
  user\_id UUID REFERENCES users(id),  
  guest\_email VARCHAR(255),  
  guest\_phone VARCHAR(20),  
  shipping\_address JSONB NOT NULL,  
  subtotal DECIMAL(10,2) NOT NULL,  
  shipping\_cost DECIMAL(10,2) DEFAULT 0,  
  discount\_amount DECIMAL(10,2) DEFAULT 0,  
  total\_amount DECIMAL(10,2) NOT NULL,  
  payment\_method VARCHAR(20) CHECK (payment\_method IN ('cod', 'upi', 'card')),  
  payment\_status VARCHAR(20) DEFAULT 'pending',  
  razorpay\_order\_id VARCHAR(100),  
  order\_status VARCHAR(20) DEFAULT 'pending',  
  tracking\_number VARCHAR(100),  
  weather\_hold BOOLEAN DEFAULT FALSE,  
  weather\_hold\_reason VARCHAR(200),  
  whatsapp\_opted\_in BOOLEAN DEFAULT FALSE,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  delivered\_at TIMESTAMPTZ  
);

\-- 6\. Order items  
CREATE TABLE order\_items (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  order\_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,  
  product\_id UUID NOT NULL REFERENCES products(id),  
  size\_id UUID NOT NULL REFERENCES product\_sizes(id),  
  product\_name VARCHAR(200) NOT NULL,  
  quantity INTEGER NOT NULL,  
  price DECIMAL(10,2) NOT NULL  
);

\-- 7\. Cart (guest \+ user)  
CREATE TABLE cart\_items (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID REFERENCES users(id),  
  session\_id VARCHAR(100),  
  product\_id UUID NOT NULL REFERENCES products(id),  
  size\_id UUID NOT NULL REFERENCES product\_sizes(id),  
  quantity INTEGER NOT NULL DEFAULT 1,  
  added\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 8\. Quiz responses  
CREATE TABLE quiz\_responses (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  session\_id VARCHAR(100) NOT NULL,  
  email VARCHAR(255),  
  light\_level VARCHAR(20),  
  home\_frequency VARCHAR(50),  
  has\_pets BOOLEAN,  
  experience VARCHAR(20),  
  zip\_code VARCHAR(10),  
  recommended\_ids UUID\[\] DEFAULT '{}',  
  discount\_code VARCHAR(20),  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 9\. Reviews  
CREATE TABLE reviews (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  product\_id UUID NOT NULL REFERENCES products(id),  
  user\_id UUID REFERENCES users(id),  
  order\_id UUID REFERENCES orders(id),  
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),  
  title VARCHAR(200),  
  content TEXT,  
  photos TEXT\[\] DEFAULT '{}',  
  tags TEXT\[\] DEFAULT '{}',  
  verified\_purchase BOOLEAN DEFAULT FALSE,  
  is\_approved BOOLEAN DEFAULT FALSE,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 10\. Warranty claims  
CREATE TABLE warranty\_claims (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  order\_id UUID NOT NULL REFERENCES orders(id),  
  user\_id UUID REFERENCES users(id),  
  product\_id UUID NOT NULL REFERENCES products(id),  
  photo\_urls TEXT\[\] NOT NULL,  
  issue\_type VARCHAR(50),  
  status VARCHAR(20) DEFAULT 'pending',  
  admin\_notes TEXT,  
  replacement\_credit DECIMAL(10,2),  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 11\. User plants (My Garden)  
CREATE TABLE user\_plants (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(id),  
  product\_id UUID NOT NULL REFERENCES products(id),  
  nickname VARCHAR(100),  
  photo\_url VARCHAR(500),  
  purchase\_date DATE,  
  next\_water\_date DATE,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 12\. City pages (SEO)  
CREATE TABLE city\_pages (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  city\_name VARCHAR(100) NOT NULL,  
  slug VARCHAR(100) UNIQUE NOT NULL,  
  content TEXT NOT NULL,  
  climate\_tips TEXT,  
  best\_plants TEXT\[\] DEFAULT '{}',  
  meta\_title VARCHAR(200),  
  meta\_description VARCHAR(500),  
  is\_published BOOLEAN DEFAULT FALSE,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 13\. B2B leads  
CREATE TABLE b2b\_leads (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  full\_name VARCHAR(255) NOT NULL,  
  phone VARCHAR(20) NOT NULL,  
  email VARCHAR(255),  
  company\_name VARCHAR(255),  
  project\_type VARCHAR(50),  
  plant\_count VARCHAR(50),  
  status VARCHAR(20) DEFAULT 'new',  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 14\. ZIP code to hardiness zone mapping (Karnataka focus)  
CREATE TABLE zip\_zones (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  zip\_code VARCHAR(10) NOT NULL UNIQUE,  
  city VARCHAR(100),  
  district VARCHAR(100),  
  hardiness\_zone INTEGER NOT NULL,  
  is\_serviceable BOOLEAN DEFAULT TRUE  
);

\-- Insert sample Karnataka ZIP codes  
INSERT INTO zip\_zones (zip\_code, city, district, hardiness\_zone) VALUES  
('560001', 'Bangalore', 'Bangalore Urban', 12),  
('560002', 'Bangalore', 'Bangalore Urban', 12),  
('575001', 'Mangalore', 'Dakshina Kannada', 11),  
('575002', 'Mangalore', 'Dakshina Kannada', 11),  
('570001', 'Mysore', 'Mysore', 11),  
('580001', 'Hubli', 'Dharwad', 11),  
('591301', 'Belgaum', 'Belgaum', 11),  
('576101', 'Udupi', 'Udupi', 11),  
('577001', 'Shimoga', 'Shimoga', 11);  
\`\`\`

\---

\#\# 3\. PAGE ROUTES & SPECIFICATIONS

| Route | Page | Purpose | Auth |  
|-------|------|---------|------|  
| \`/\` | Homepage | ZIP gate, hero, intent grid, trust bar, quiz CTA, seasonal, B2B, UGC, map | No |  
| \`/shop\` | Product listing | Filters, sort, product cards | No |  
| \`/shop/\[slug\]\` | Product detail | Care snapshot, size selector, reviews, WhatsApp | No |  
| \`/quiz\` | Plant quiz | 6 questions → email capture → results | No |  
| \`/quiz/results\` | Quiz results | 5-10 recommended plants \+ 10% discount | No |  
| \`/cart\` | Cart | Items, shipping calc, checkout CTA | No |  
| \`/checkout\` | Checkout | One page: address, payment, opt-in | No |  
| \`/checkout/success\` | Order confirmation | Order details, account creation prompt | No |  
| \`/my-garden\` | Dashboard | Plants, watering reminders, photo upload | Yes |  
| \`/account\` | Account | Profile, orders, addresses | Yes |  
| \`/warranty/claim\` | Warranty claim | Upload photos, submit claim | Yes |  
| \`/nursery/\[city\]\` | City SEO page | Local content, map, pickup info | No |  
| \`/care-guides/\[slug\]\` | Care guides | SEO content, related products | No |  
| \`/plant-rescue\` | Rescue section | 50% off damaged plants | No |  
| \`/office-plants\` | B2B | Quote request form | No |  
| \`/about\` | About | Brand story, nursery info | No |  
| \`/guarantee\` | Guarantee | 30-day guarantee T\&Cs | No |  
| \`/faq\` | FAQ | Common questions | No |  
| \`/contact\` | Contact | WhatsApp, email, form | No |

\---

\#\# 4\. CORE FEATURE SPECIFICATIONS

\#\#\# 4.1 ZIP Code Gate (Critical)

\*\*Location:\*\* Homepage hero \+ sticky top bar for unverified users

\*\*Logic:\*\*  
\`\`\`  
1\. User enters 6-digit PIN  
2\. Look up in zip\_zones table  
3\. If found → store in localStorage \+ cookie, set hardiness\_zone  
4\. Reload product listings (filter by hardiness\_min \<= zone \<= hardiness\_max)  
5\. If not found → show "We don't deliver here yet. Pickup from nursery?"  
\`\`\`

\*\*UI Component:\*\*  
\`\`\`jsx  
\<ZipGateModal   
  onZipSubmit={(zip, zone) \=\> {  
    localStorage.setItem('user\_zone', zone);  
    localStorage.setItem('user\_zip', zip);  
    router.refresh();  
  }}  
/\>  
\`\`\`

\---

\#\#\# 4.2 Guest Checkout (Non-Negotiable)

\*\*Rules:\*\*  
\- No account creation before purchase  
\- Collect: name, email, phone, address, ZIP  
\- After order success → prompt: "Create account to track orders"  
\- Link guest orders by email/phone if user creates account later

\---

\#\#\# 4.3 One-Page Checkout Fields (In Order)

| Field | Type | Required |  
|-------|------|----------|  
| Full name | Text | Yes |  
| WhatsApp number | Tel (10 digits) | Yes |  
| Email | Email | Yes |  
| Address line 1 | Text | Yes |  
| Address line 2 | Text | No |  
| City | Text (autofill from ZIP) | Yes |  
| PIN code | Number (6 digits) | Yes |  
| Landmark | Text | No |  
| Delivery method | Radio (Home / Pickup) | Yes |  
| Payment method | Radio (COD / UPI / Card) | Yes |  
| WhatsApp opt-in | Checkbox (pre-checked) | No |

\---

\#\#\# 4.4 Payment Methods

| Method | Implementation |  
|--------|----------------|  
| \*\*UPI\*\* | Razorpay — shows QR or deep links (GPay, PhonePe, Paytm) |  
| \*\*Card\*\* | Razorpay — hosted page |  
| \*\*COD\*\* | Manual — order marked "pending", verification call required |

\*\*COD Abuse Prevention:\*\*  
\- Max order value ₹2000 for COD  
\- First-time customers only  
\- Verification call before dispatch

\---

\#\#\# 4.5 Product Detail Page (PDP) — Above Fold

\*\*Required elements in order:\*\*

1\. Product name (common name \+ scientific name)  
2\. Personality line (e.g., "The Bedroom Guardian")  
3\. Image gallery (4-6 real photos, 1 with hand/bottle for scale)  
4\. Badges (Pet Safe / Low Light / Easy Care — each clickable filter)  
5\. \*\*Care snapshot\*\* (must be visible without scroll):  
   \- Light: ☀️ Low to bright indirect  
   \- Water: 💧 Every 10-14 days  
   \- Soil: 🌱 Well-draining  
   \- Growth: 📈 Slow  
6\. Size selector (radio buttons: 4" / 6" / 10" with price)  
7\. Size guarantee: "Now: 6-8" | Will grow to: 24-36" in 12 months"  
8\. Price \+ compare price (if on sale)  
9\. 30-day guarantee badge (links to /guarantee)  
10\. Shipping estimate: "Delivers to \[PIN\] by \[date\]"  
11\. \*\*Two buttons:\*\*  
    \- "Add to Cart" (primary, green, 48px)  
    \- "Check Stock on WhatsApp" (secondary, opens WhatsApp pre-filled)

\---

\#\#\# 4.6 6-Question Quiz

\*\*Questions (in order):\*\*

| \# | Question | Options |  
|---|----------|---------|  
| 1 | Where will your plant live? | Living room / Desk / Balcony |  
| 2 | How much light does that spot get? | Low / Medium / Bright |  
| 3 | How often are you home? | Most days / Travel often / Rarely |  
| 4 | Do you have pets or young kids? | Yes / No |  
| 5 | What's your plant experience? | Newbie / Some experience / Expert |  
| 6 | What's your PIN code? | \[6-digit input\] |

\*\*After Q6 → Email capture screen:\*\*  
\- "Enter your email to see your personalized recommendations \+ 10% off"  
\- Store email \+ answers in quiz\_responses table  
\- Generate unique discount code: \`QUIZ-\[random4\]\` (10% off, 7-day expiry)

\*\*Results page:\*\*  
\- Show 5-10 matching plants (card grid)  
\- Each card: photo, name, why it matches you  
\- "Add all to wishlist" button  
\- Discount code displayed \+ "Copy code"

\*\*Matching logic (server-side):\*\*  
\`\`\`sql  
SELECT \* FROM products   
WHERE   
  ($1 \= 'low' AND light\_level \= 'low') OR  
  ($1 \= 'medium' AND light\_level IN ('low', 'medium')) OR  
  ($1 \= 'bright' AND light\_level IN ('medium', 'bright'))  
AND   
  ($4 \= true AND pet\_safe \= true)  
AND  
  difficulty IN (CASE $5  
    WHEN 'newbie' THEN ('beginner')  
    WHEN 'some' THEN ('beginner', 'intermediate')  
    WHEN 'expert' THEN ('beginner', 'intermediate', 'expert')  
  END)  
AND  
  hardiness\_min \<= $6 AND hardiness\_max \>= $6  
ORDER BY   
  CASE WHEN pet\_safe \= true THEN 10 ELSE 0 END DESC,  
  CASE WHEN difficulty \= 'beginner' THEN 5 ELSE 0 END DESC  
LIMIT 10  
\`\`\`

\---

\#\#\# 4.7 Cart Abandonment Recovery

\*\*Sequence (3 emails, no WhatsApp until opt-in):\*\*

| Time | Channel | Subject | Incentive |  
|------|---------|---------|-----------|  
| 45 min | Email | "Your plants are waiting at Karnataka Farms 🌱" | None |  
| 24 hours | Email | "10% off your cart — just for you" | COMEBACK10 |  
| 72 hours | Email | "Only 2 left in stock — your cart expires soon" | None (urgency) |

\*\*Implementation:\*\*  
\- Store abandoned cart in \`cart\_items\` with session\_id  
\- Cron job (Vercel Cron Jobs or Supabase pg\_cron) every hour  
\- Check carts \>45 min old with no order  
\- Send email via Resend  
\- Stop if order created or cart cleared

\---

\#\#\# 4.8 Post-Purchase Care Sequence (WhatsApp \+ Email)

\*\*Trigger:\*\* Order status \= 'delivered' (from Shiprocket webhook)

\*\*Sequence:\*\*  
| Day | Channel | Message |  
|-----|---------|---------|  
| 0 | WhatsApp | "Unbox within 2 hours. Let plant rest 24h. Send photo for free health check." |  
| 7 | WhatsApp \+ Email | "First watering reminder \+ video link" |  
| 14 | WhatsApp | "Send a growth photo → get ₹50 credit" |  
| 21 | Email | "Fertilizer instructions \+ buy link (15% off)" |  
| 30 | Email | "30-day warranty expires. Upload photo — unhealthy \= free replacement" |  
| 60 | WhatsApp | "Soil refresh needed — shop soil mix" |

\*\*WhatsApp implementation (start with click-to-chat links, automate later):\*\*  
\`\`\`jsx  
\<a href={\`https://wa.me/91XXXXXXXXXX?text=I%20need%20help%20with%20my%20${plantName}\`}\>  
  Chat with us on WhatsApp  
\</a\>  
\`\`\`

\---

\#\#\# 4.9 "My Garden" Dashboard (Logged-in Users)

\*\*URL:\*\* \`/my-garden\`

\*\*Sections:\*\*  
1\. \*\*My Plants\*\* — Grid of purchased plants with:  
   \- Photo, name, purchase date  
   \- "Water today" badge if next\_water\_date \= today  
   \- "Upload photo" button  
2\. \*\*Care Schedule\*\* — Simple list:  
   \- "Water Snake Plant today"  
   \- "Fertilize Monstera in 3 days"  
3\. \*\*Photo Upload\*\* — Submit growth photo → stored in user\_plants table  
4\. \*\*Loyalty Tier\*\* — Simple progress bar:  
   \- Sprout (0-1000 points)  
   \- Seedling (1000-5000 points)  
   \- Bloom (5000+ points)

\*\*Points earned:\*\*  
\- Purchase: ₹1 \= 1 point  
\- Photo upload: 50 points  
\- Review with photo: 100 points  
\- Referral: 200 points

\---

\#\#\# 4.10 Warranty Claim Flow

\*\*URL:\*\* \`/warranty/claim\`

\*\*Form fields:\*\*  
1\. Order number (required)  
2\. Plant name (dropdown from order)  
3\. Issue type (Damaged on arrival / Declined after X days / Pests / Other)  
4\. Upload 2 photos (required)

\*\*Backend logic:\*\*  
\- Verify order exists and is \<30 days old  
\- Store photos in Supabase storage  
\- Create warranty\_claims record (status \= 'pending')  
\- Admin email notification  
\- Auto-approve if clear damage (manual review for complex cases)

\*\*Approval action:\*\*  
\- Replacement credit issued (store credit, no refund to card)  
\- Customer notified via email \+ WhatsApp  
\- Credit valid for 60 days

\---

\#\#\# 4.11 B2B Quote Form

\*\*URL:\*\* \`/office-plants\`

\*\*Form fields (only 4, no overload):\*\*  
1\. Full name  
2\. WhatsApp number  
3\. Company name  
4\. Project type (dropdown: Office / Hotel / Gifting / Event / Other)  
5\. Estimated plant count (\<50 / 50-200 / 200-500 / 500+)

\*\*On submit:\*\*  
\- Store in b2b\_leads table  
\- Send email to admin \+ WhatsApp notification  
\- Auto-reply: "We'll send you a quote within 24 hours"

\---

\#\#\# 4.12 Weather-Based Shipping Hold

\*\*When to check:\*\*  
\- At checkout (before payment)  
\- Daily at 6 AM for pending orders

\*\*Logic (OpenWeather API):\*\*  
\`\`\`  
1\. Get lat/lon from ZIP code (use zip\_zones table or geocoding)  
2\. Call OpenWeather forecast API  
3\. Check max temp in next 3 days  
4\. Check if heavy rain (\>10mm) in next 3 days

If max\_temp \> 40°C OR heavy\_rain \= true:  
  \- can\_ship \= false  
  \- hold\_reason \= "Extreme heat" or "Heavy rain forecast"  
  \- estimated\_ship\_date \= find next safe date (3+ days out)  
  \- Show warning on checkout: "Your area has extreme weather. We'll hold your order for safe delivery."  
  \- Customer can cancel or wait  
\`\`\`

\*\*Implementation (simplified for MVP):\*\*  
\- Start with manual weather check  
\- Show static banner: "We don't ship to very hot/rainy zones. Contact us for options."  
\- Automate with API in Month 2

\---

\#\# 5\. API ENDPOINTS (NEXT.JS API ROUTES)

| Method | Route | Purpose |  
|--------|-------|---------|  
| GET | \`/api/products\` | List with filters (light, pet, difficulty, price, size) |  
| GET | \`/api/products/\[slug\]\` | Single product |  
| GET | \`/api/products/search?q=\` | Search (name \+ scientific) |  
| POST | \`/api/cart\` | Add to cart |  
| GET | \`/api/cart\` | Get cart (session or user) |  
| PUT | \`/api/cart/\[id\]\` | Update quantity |  
| DELETE | \`/api/cart/\[id\]\` | Remove item |  
| POST | \`/api/checkout\` | Create order |  
| POST | \`/api/checkout/verify\` | Verify payment (Razorpay webhook) |  
| POST | \`/api/quiz\` | Submit quiz answers |  
| POST | \`/api/warranty\` | Submit warranty claim |  
| POST | \`/api/b2b\` | Submit B2B lead |  
| POST | \`/api/reviews\` | Submit review |  
| GET | \`/api/cities/\[city\]\` | Get city page content |  
| POST | \`/api/weather/check\` | Check shipping weather |

\---

\#\# 6\. ENVIRONMENT VARIABLES (.env.local)

\`\`\`env  
\# Supabase  
NEXT\_PUBLIC\_SUPABASE\_URL=your\_supabase\_url  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key  
SUPABASE\_SERVICE\_ROLE\_KEY=your\_service\_role\_key

\# Razorpay  
NEXT\_PUBLIC\_RAZORPAY\_KEY\_ID=rzp\_test\_xxx  
RAZORPAY\_KEY\_SECRET=xxx

\# Google Maps  
NEXT\_PUBLIC\_GOOGLE\_MAPS\_API\_KEY=xxx

\# OpenWeather  
OPENWEATHER\_API\_KEY=xxx

\# Email (Resend)  
RESEND\_API\_KEY=xxx  
FROM\_EMAIL=hello@karnatakafarms.in

\# WhatsApp (Interakt \- optional later)  
INTERAKT\_API\_KEY=xxx  
INTERAKT\_PHONE\_NUMBER\_ID=xxx

\# Site URL  
NEXT\_PUBLIC\_SITE\_URL=https://karnatakafarms.in  
\`\`\`

\---

\#\# 7\. DEPLOYMENT (VERCEL)

\*\*One-click deploy from GitHub:\*\*  
1\. Push code to GitHub repository  
2\. Go to vercel.com → Add New Project → Import GitHub repo  
3\. Add environment variables  
4\. Deploy

\*\*Database migrations:\*\*  
\- Run SQL schema in Supabase SQL editor  
\- Vercel will auto-deploy on every git push

\---

\#\# 8\. 30-DAY MVP DEVELOPMENT ROADMAP

\#\#\# Week 1-2: Foundation  
\- \[ \] Set up Next.js \+ Tailwind \+ Supabase  
\- \[ \] Run database schema  
\- \[ \] Build ZIP code gate modal  
\- \[ \] Build homepage (hero, intent grid, trust bar)  
\- \[ \] Build product listing page (with filters)  
\- \[ \] Build product detail page (care snapshot, size selector)  
\- \[ \] Add 20-30 products to database

\#\#\# Week 3: Checkout \+ Payments  
\- \[ \] Build cart page  
\- \[ \] Build one-page checkout (guest only)  
\- \[ \] Integrate Razorpay (UPI \+ Cards)  
\- \[ \] Add COD option (manual verification)  
\- \[ \] Add address autofill (Google Places)  
\- \[ \] Add 30-day guarantee badge

\#\#\# Week 4: Quiz \+ Emails \+ Launch  
\- \[ \] Build 6-question quiz with email capture  
\- \[ \] Build quiz results page  
\- \[ \] Set up welcome email series (Resend)  
\- \[ \] Set up cart abandonment emails  
\- \[ \] Add WhatsApp click-to-chat links  
\- \[ \] Launch with 20-30 products  
\- \[ \] Add Vercel Analytics \+ Google Analytics

\---

\#\# 9\. MONTH 2 ADDITIONS (After Launch)

\- \[ \] Post-purchase care email sequence (day 7,21,30,60)  
\- \[ \] "My Garden" dashboard  
\- \[ \] Warranty claim form  
\- \[ \] 3 city landing pages (Bangalore, Mangalore, Udupi)  
\- \[ \] 5 care guide articles  
\- \[ \] Plant rescue section (50% off)  
\- \[ \] B2B quote form  
\- \[ \] Customer review system with photo uploads

\---

\#\# 10\. WHAT TO AVOID (DO NOT BUILD)

| Feature | Why |  
|---------|-----|  
| Plant.id API (AI diagnosis) | Month 3+, not MVP |  
| Google Vision (UGC moderation) | Month 3+ |  
| Real-time inventory API | Start with CSV/manual |  
| WhatsApp Business API (Interakt) | Start with click-to-chat links (free) |  
| Redis / BullMQ | Supabase pg\_cron \+ simple jobs |  
| Mobile app | PWA is enough |  
| Live chat | WhatsApp is enough |  
| Multi-vendor marketplace | Year 2 |  
| Subscription boxes | Month 4+ |  
| Loyalty program | Month 4+ |  
| AR/3D previews | Never |

\---

\#\# 11\. WEEKLY MAINTENANCE TASKS (For You)

| Task | Time | Frequency |  
|------|------|-----------|  
| Update inventory (CSV upload) | 5 min | Daily |  
| Respond to WhatsApp queries | 15 min | Daily |  
| Pack and ship orders | 30 min | Daily |  
| Check warranty claims | 5 min | Daily |  
| Post 1 Instagram Reel | 10 min | Daily |  
| Update Google Business Profile | 5 min | Weekly |  
| Write 1 care guide | 1 hour | Weekly |

\*\*Total daily time:\*\* \~1 hour

\---

\#\# 12\. SUCCESS METRICS (TRACK FROM DAY 1\)

| Metric | Target | How to Track |  
|--------|--------|--------------|  
| Conversion rate | \>2% | Vercel Analytics |  
| Cart abandonment | \<50% | Custom event |  
| Quiz completion rate | \>60% | Database query |  
| WhatsApp opt-in rate | \>30% | Database query |  
| Guest checkout rate | \>70% | Database query |  
| Repeat purchase (90-day) | \>15% | Cohort analysis |  
| Warranty claim rate | \<5% | Database query |  
| Page load time (LCP) | \<2.5s | Vercel Analytics |

\---

\#\# 13\. IMMEDIATE NEXT STEPS

1\. \*\*Sign up for:\*\*  
   \- Vercel (free)  
   \- Supabase (free)  
   \- Razorpay (test mode)  
   \- Google Cloud (free ₹200 credit for Maps)  
   \- Resend (free 3000 emails)

2\. \*\*Buy domain:\*\* karnatakafarms.in (Cloudflare \~₹850/year)

3\. \*\*Create GitHub repository\*\* and push starter Next.js project

4\. \*\*Run database schema\*\* in Supabase SQL editor

5\. \*\*Add 20 products\*\* to products and product\_sizes tables

6\. \*\*Start coding\*\* from Week 1 roadmap

\---

\#\# 14\. READY-TO-USE CODE REQUESTS

If you want me to provide production-ready code for any of these, just ask:

1\. \*\*ZIP code gate component\*\* (Next.js \+ Supabase query)  
2\. \*\*6-question quiz component\*\* (with email capture)  
3\. \*\*One-page checkout\*\* (Razorpay integration)  
4\. \*\*Product detail page\*\* (with care snapshot \+ size selector)  
5\. \*\*Cart \+ cart abandonment setup\*\* (Resend emails)  
6\. \*\*Supabase schema SQL\*\* (copy-paste ready)  
7\. \*\*"My Garden" dashboard\*\* (React component)  
8\. \*\*Warranty claim form\*\* (with photo upload)  
9\. \*\*City landing page template\*\* (with schema markup)  
10\. \*\*OpenWeather API shipping check\*\* (serverless function)

\*\*Tell me which one you want first, and I will provide complete, copy-paste ready code.\*\*  
