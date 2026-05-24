I will now produce the \*\*full end-to-end module-wise specification\*\* for Karnataka Farms Plant Nursery. This is broken into \*\*11 modules\*\* — each module is a self-contained, buildable unit with clear inputs, outputs, logic, edge cases, and AI-friendly pseudocode.

You can build module by module. Each module is \*\*realistic, affordable, and solo-founder friendly\*\*.

\---

\# KARNATAKA FARMS PLANT NURSERY  
\#\# MODULE-WISE END-TO-END SPECIFICATIONS  
\#\#\# Version 1.0 | AI-Ready | Solo Founder Budget

\---

\#\# MODULE 1: ZIP CODE GATE & CLIMATE FILTERING

\#\#\# Purpose  
Prevent customers from ordering plants that will die in their climate. This single feature reduces returns by 30-50%.

\#\#\# Inputs  
| Field | Type | Validation |  
|-------|------|------------|  
| PIN code | String (6 digits) | Must exist in \`zip\_zones\` table |

\#\#\# Outputs  
| Output | Type | Description |  
|--------|------|-------------|  
| Hardiness zone | Integer (1-13) | USDA zone for this location |  
| City name | String | For display and SEO |  
| Is serviceable | Boolean | Can we deliver here? |  
| Filtered products | Array | Products matching zone \+ other filters |

\#\#\# Business Logic

\`\`\`javascript  
// Pseudo-code — implement in your API route  
function handleZipCode(zipCode) {  
  // 1\. Validate format  
  if (\!/^\\d{6}$/.test(zipCode)) {  
    return { error: "Enter 6-digit PIN code" };  
  }  
    
  // 2\. Look up in database  
  const zoneRecord \= await db.zip\_zones.findOne({   
    where: { zip\_code: zipCode }  
  });  
    
  // 3\. Handle not found  
  if (\!zoneRecord) {  
    return {   
      error: "We don't deliver to this location yet. Pick up from our nursery?",  
      canPickup: true,  
      nurseryAddress: "Karnataka Farms, \[Your Address\]"  
    };  
  }  
    
  // 4\. Store in session/localStorage  
  setUserSession({   
    zipCode,   
    hardinessZone: zoneRecord.hardiness\_zone,  
    city: zoneRecord.city   
  });  
    
  // 5\. Return success  
  return {  
    success: true,  
    hardinessZone: zoneRecord.hardiness\_zone,  
    city: zoneRecord.city,  
    isServiceable: zoneRecord.is\_serviceable  
  };  
}

// Product filtering based on zone  
function filterProductsByZone(products, userZone) {  
  return products.filter(product \=\>   
    product.hardiness\_min \<= userZone &&   
    product.hardiness\_max \>= userZone  
  );  
}  
\`\`\`

\#\#\# Edge Cases  
| Scenario | Behavior |  
|----------|----------|  
| PIN not in database | Show pickup option, don't block completely |  
| User skips ZIP gate | Show limited "national" products only |  
| Invalid format (less/more than 6 digits) | Show error, don't proceed |  
| Database timeout | Show cached results or static message |

\#\#\# Storage Required  
\- \`zip\_zones\` table (pre-populated with 100+ Karnataka PINs)  
\- User session (localStorage \+ cookie for server-side)

\#\#\# UI Component  
\`\`\`jsx  
\<ZipGateModal   
  isOpen={\!hasZip}  
  onSubmit={handleZipSubmit}  
  onSkip={() \=\> showLimitedCatalog()}  
/\>  
\`\`\`

\---

\#\# MODULE 2: PRODUCT DATABASE & CATALOG MANAGEMENT

\#\#\# Purpose  
Store and retrieve plant products with all attributes needed for filtering, displaying, and selling.

\#\#\# Database Schema (Already defined, this is the reference)

\`\`\`sql  
\-- Products table  
CREATE TABLE products (  
  id UUID PRIMARY KEY,  
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
  image\_urls TEXT\[\] DEFAULT '{}'  
);

\-- Product sizes (variants)  
CREATE TABLE product\_sizes (  
  id UUID PRIMARY KEY,  
  product\_id UUID REFERENCES products(id),  
  size\_label VARCHAR(20) NOT NULL,  
  pot\_diameter\_inches INTEGER,  
  price DECIMAL(10,2) NOT NULL,  
  stock\_quantity INTEGER DEFAULT 0,  
  sku VARCHAR(100) UNIQUE,  
  is\_default BOOLEAN DEFAULT FALSE  
);  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# GET \`/api/products\` (List with filters)

\*\*Query parameters:\*\*  
| Parameter | Type | Example | Description |  
|-----------|------|---------|-------------|  
| light | string | 'low' | low / medium / bright |  
| petSafe | boolean | 'true' | Filter pet-safe plants |  
| difficulty | string | 'beginner' | beginner / intermediate / expert |  
| minPrice | number | 299 | Minimum price |  
| maxPrice | number | 999 | Maximum price |  
| size | string | '6' | Pot size in inches |  
| search | string | 'snake' | Search in name \+ scientific |  
| page | number | 1 | Pagination |  
| limit | number | 20 | Items per page |  
| sort | string | 'price\_asc' | price\_asc / price\_desc / newest / popular |

\*\*Response:\*\*  
\`\`\`json  
{  
  "products": \[  
    {  
      "id": "uuid",  
      "name": "Snake Plant",  
      "slug": "snake-plant",  
      "image": "https://...",  
      "light\_level": "low",  
      "pet\_safe": true,  
      "difficulty": "beginner",  
      "base\_price": 599,  
      "sizes": \[  
        { "label": "4\\"", "price": 299, "in\_stock": true },  
        { "label": "6\\"", "price": 599, "in\_stock": true }  
      \]  
    }  
  \],  
  "total": 45,  
  "page": 1,  
  "totalPages": 3  
}  
\`\`\`

\#\#\#\# GET \`/api/products/\[slug\]\` (Single product)

\*\*Response:\*\*  
\`\`\`json  
{  
  "id": "uuid",  
  "name": "Snake Plant",  
  "scientific\_name": "Sansevieria trifasciata",  
  "personality": "The Bedroom Guardian",  
  "description": "Perfect for beginners...",  
  "light\_level": "low",  
  "water\_frequency": "Every 10-14 days",  
  "soil\_type": "Well-draining cactus mix",  
  "growth\_speed": "Slow",  
  "pet\_safe": true,  
  "difficulty": "beginner",  
  "hardiness\_min": 10,  
  "hardiness\_max": 12,  
  "base\_price": 599,  
  "compare\_price": 899,  
  "image\_urls": \["url1", "url2", "url3"\],  
  "sizes": \[  
    { "label": "4\\"", "price": 299, "stock": 12, "sku": "SNK-4" },  
    { "label": "6\\"", "price": 599, "stock": 8, "sku": "SNK-6" },  
    { "label": "10\\"", "price": 999, "stock": 3, "sku": "SNK-10" }  
  \],  
  "reviews": {  
    "average": 4.8,  
    "count": 23,  
    "items": \[...\]  
  }  
}  
\`\`\`

\#\#\# Input Validation (Zod schema)  
\`\`\`javascript  
const productFilterSchema \= z.object({  
  light: z.enum(\['low', 'medium', 'bright'\]).optional(),  
  petSafe: z.enum(\['true', 'false'\]).transform(v \=\> v \=== 'true').optional(),  
  difficulty: z.enum(\['beginner', 'intermediate', 'expert'\]).optional(),  
  minPrice: z.coerce.number().min(0).optional(),  
  maxPrice: z.coerce.number().min(0).optional(),  
  size: z.enum(\['4', '6', '10'\]).optional(),  
  search: z.string().max(100).optional(),  
  page: z.coerce.number().min(1).default(1),  
  limit: z.coerce.number().min(1).max(50).default(20),  
  sort: z.enum(\['price\_asc', 'price\_desc', 'newest', 'popular'\]).default('popular')  
});  
\`\`\`

\---

\#\# MODULE 3: SHOPPING CART (GUEST \+ USER)

\#\#\# Purpose  
Allow users to add products, manage quantities, and persist cart across sessions (no login required).

\#\#\# Data Storage

\*\*Database table:\*\*  
\`\`\`sql  
CREATE TABLE cart\_items (  
  id UUID PRIMARY KEY,  
  user\_id UUID REFERENCES users(id),        \-- NULL for guests  
  session\_id VARCHAR(100),                  \-- For guest carts  
  product\_id UUID NOT NULL,  
  size\_id UUID NOT NULL,  
  quantity INTEGER NOT NULL DEFAULT 1,  
  added\_at TIMESTAMPTZ DEFAULT NOW()  
);  
\`\`\`

\*\*Cart identification logic:\*\*  
\`\`\`  
if (user logged in):  
  use user\_id  
else:  
  use session\_id (from cookie/localStorage)  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# POST \`/api/cart\` (Add item)  
\*\*Request body:\*\*  
\`\`\`json  
{  
  "product\_id": "uuid",  
  "size\_id": "uuid",  
  "quantity": 1  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "success": true,  
  "cart": {  
    "items": \[...\],  
    "subtotal": 599,  
    "item\_count": 1  
  }  
}  
\`\`\`

\#\#\#\# GET \`/api/cart\` (Get cart)  
\*\*Response:\*\*  
\`\`\`json  
{  
  "items": \[  
    {  
      "id": "cart\_item\_id",  
      "product\_id": "uuid",  
      "product\_name": "Snake Plant",  
      "size\_label": "6\\"",  
      "quantity": 2,  
      "price": 599,  
      "total": 1198,  
      "image\_url": "..."  
    }  
  \],  
  "subtotal": 1198,  
  "shipping": 49,  
  "discount": 0,  
  "total": 1247,  
  "item\_count": 2  
}  
\`\`\`

\#\#\#\# PUT \`/api/cart/\[id\]\` (Update quantity)  
\*\*Request body:\*\*  
\`\`\`json  
{ "quantity": 3 }  
\`\`\`

\#\#\#\# DELETE \`/api/cart/\[id\]\` (Remove item)

\#\#\# Business Logic

\`\`\`javascript  
// Add to cart logic  
async function addToCart(userId, sessionId, productId, sizeId, quantity) {  
  // 1\. Check stock availability  
  const size \= await db.product\_sizes.findById(sizeId);  
  if (size.stock\_quantity \< quantity) {  
    return { error: "Only " \+ size.stock\_quantity \+ " left in stock" };  
  }  
    
  // 2\. Find existing cart item  
  const existing \= await db.cart\_items.findOne({  
    where: {  
      user\_id: userId || null,  
      session\_id: sessionId || null,  
      product\_id: productId,  
      size\_id: sizeId  
    }  
  });  
    
  // 3\. Update or insert  
  if (existing) {  
    const newQuantity \= existing.quantity \+ quantity;  
    if (newQuantity \> 10\) {  
      return { error: "Maximum 10 items per product" };  
    }  
    await db.cart\_items.update(existing.id, { quantity: newQuantity });  
  } else {  
    await db.cart\_items.insert({  
      user\_id: userId,  
      session\_id: sessionId,  
      product\_id: productId,  
      size\_id: sizeId,  
      quantity: Math.min(quantity, 10\)  
    });  
  }  
    
  // 4\. Return updated cart  
  return await getCart(userId, sessionId);  
}  
\`\`\`

\#\#\# Edge Cases  
| Scenario | Behavior |  
|----------|----------|  
| Add more than stock | Show error with available quantity |  
| Add more than 10 items | Cap at 10, show message |  
| Product discontinued | Remove from cart, show notification |  
| Guest cart after login | Merge guest cart into user cart |

\---

\#\# MODULE 4: GUEST CHECKOUT & ORDER CREATION

\#\#\# Purpose  
Complete purchase without account creation. One-page checkout with all necessary fields.

\#\#\# Form Fields (in order)

\`\`\`javascript  
const checkoutSchema \= z.object({  
  // Customer info  
  fullName: z.string().min(2, "Enter full name"),  
  phone: z.string().regex(/^\[6-9\]\\d{9}$/, "Enter 10-digit mobile number"),  
  email: z.string().email("Enter valid email"),  
    
  // Address  
  addressLine1: z.string().min(5, "Enter address"),  
  addressLine2: z.string().optional(),  
  city: z.string().min(2, "Enter city"),  
  pincode: z.string().length(6, "Enter 6-digit PIN"),  
  landmark: z.string().optional(),  
    
  // Delivery  
  deliveryMethod: z.enum(\['home', 'pickup'\]),  
    
  // Payment  
  paymentMethod: z.enum(\['cod', 'upi', 'card'\]),  
    
  // Consent  
  whatsappOptIn: z.boolean().default(false)  
});  
\`\`\`

\#\#\# Order Creation API

\#\#\#\# POST \`/api/checkout\`

\*\*Request body:\*\*  
\`\`\`json  
{  
  "customer": {  
    "fullName": "Ramesh Kumar",  
    "phone": "9876543210",  
    "email": "ramesh@example.com",  
    "addressLine1": "\#123, 1st Main",  
    "addressLine2": "Indiranagar",  
    "city": "Bangalore",  
    "pincode": "560001",  
    "landmark": "Near Metro"  
  },  
  "deliveryMethod": "home",  
  "paymentMethod": "upi",  
  "whatsappOptIn": true,  
  "cart": { ... } // from session  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "success": true,  
  "orderId": "uuid",  
  "orderNumber": "KF-2026-00123",  
  "razorpayOrderId": "order\_xxx",  // if UPI/card  
  "totalAmount": 1247,  
  "paymentMethod": "upi"  
}  
\`\`\`

\#\#\# Business Logic

\`\`\`javascript  
async function createOrder(checkoutData, cart, userZone) {  
  // 1\. Validate cart not empty  
  if (cart.items.length \=== 0\) {  
    return { error: "Cart is empty" };  
  }  
    
  // 2\. Check stock for all items  
  for (const item of cart.items) {  
    const size \= await db.product\_sizes.findById(item.size\_id);  
    if (size.stock\_quantity \< item.quantity) {  
      return {   
        error: \`${item.product\_name} only ${size.stock\_quantity} left\`   
      };  
    }  
  }  
    
  // 3\. Check weather hold  
  const weatherCheck \= await checkShippingWeather(checkoutData.customer.pincode);  
  if (\!weatherCheck.canShip && checkoutData.deliveryMethod \=== 'home') {  
    return {  
      error: \`Weather hold: ${weatherCheck.holdReason}. Delivery not available.\`,  
      weatherHold: true  
    };  
  }  
    
  // 4\. Calculate totals  
  const subtotal \= cart.items.reduce((sum, i) \=\> sum \+ (i.price \* i.quantity), 0);  
  const shippingCost \= (subtotal \>= 499\) ? 0 : 49;  
  const total \= subtotal \+ shippingCost;  
    
  // 5\. Create order record  
  const orderNumber \= \`KF-${new Date().getFullYear()}-${Date.now()}\`;  
  const order \= await db.orders.insert({  
    order\_number: orderNumber,  
    guest\_email: checkoutData.customer.email,  
    guest\_phone: checkoutData.customer.phone,  
    shipping\_address: checkoutData.customer,  
    subtotal,  
    shipping\_cost: shippingCost,  
    total\_amount: total,  
    payment\_method: checkoutData.paymentMethod,  
    whatsapp\_opted\_in: checkoutData.whatsappOptIn,  
    order\_status: 'pending'  
  });  
    
  // 6\. Create order items  
  for (const item of cart.items) {  
    await db.order\_items.insert({  
      order\_id: order.id,  
      product\_id: item.product\_id,  
      size\_id: item.size\_id,  
      product\_name: item.product\_name,  
      quantity: item.quantity,  
      price: item.price  
    });  
  }  
    
  // 7\. Reserve inventory (decrement stock)  
  for (const item of cart.items) {  
    await db.product\_sizes.decrementStock(item.size\_id, item.quantity);  
  }  
    
  // 8\. For online payments, create Razorpay order  
  let razorpayOrder \= null;  
  if (checkoutData.paymentMethod \!== 'cod') {  
    razorpayOrder \= await createRazorpayOrder({  
      amount: total \* 100,  // paise  
      currency: 'INR',  
      receipt: orderNumber,  
      notes: { orderId: order.id }  
    });  
  }  
    
  // 9\. Clear cart  
  await clearCart(checkoutData.sessionId, checkoutData.userId);  
    
  // 10\. Schedule post-purchase jobs  
  if (checkoutData.whatsappOptIn) {  
    await scheduleWhatsAppOptIn(order.id, checkoutData.customer.phone);  
  }  
    
  return {  
    success: true,  
    orderId: order.id,  
    orderNumber,  
    razorpayOrderId: razorpayOrder?.id,  
    totalAmount: total  
  };  
}  
\`\`\`

\#\#\# Payment Verification Webhook

\#\#\#\# POST \`/api/webhooks/razorpay\`

\`\`\`javascript  
async function handleRazorpayWebhook(payload) {  
  // 1\. Verify signature  
  const isValid \= verifyRazorpaySignature(payload);  
  if (\!isValid) return { error: "Invalid signature" };  
    
  // 2\. Get event  
  const event \= payload.event;  
    
  if (event \=== 'payment.captured') {  
    const orderId \= payload.payload.order.entity.receipt;  
    await db.orders.update(  
      { order\_number: orderId },  
      {   
        payment\_status: 'paid',  
        order\_status: 'confirmed',  
        paid\_at: new Date()  
      }  
    );  
      
    // Trigger Shiprocket order creation  
    await createShipment(orderId);  
      
    // Send confirmation emails/WhatsApp  
    await sendOrderConfirmation(orderId);  
  }  
    
  if (event \=== 'payment.failed') {  
    // Mark order as failed, restock inventory  
    await handleFailedPayment(orderId);  
  }  
}  
\`\`\`

\---

\#\# MODULE 5: PRODUCT DETAIL PAGE (PDP)

\#\#\# Purpose  
Display plant with care information BEFORE the add-to-cart button. Build trust and reduce returns.

\#\#\# Required Data Fetch

\`\`\`javascript  
// Server component (Next.js)  
async function ProductPage({ params }) {  
  const product \= await db.products.findOne({  
    where: { slug: params.slug, is\_active: true }  
  });  
    
  if (\!product) return notFound();  
    
  const sizes \= await db.product\_sizes.findAll({  
    where: { product\_id: product.id }  
  });  
    
  const reviews \= await db.reviews.findAll({  
    where: { product\_id: product.id, is\_approved: true },  
    limit: 10,  
    order: { created\_at: 'desc' }  
  });  
    
  const userZone \= await getUserZone(); // from ZIP gate  
    
  return \<ProductDetail product={product} sizes={sizes} reviews={reviews} userZone={userZone} /\>;  
}  
\`\`\`

\#\#\# UI Component Structure

\`\`\`jsx  
// Above the fold (visible without scroll)  
\<ProductName name={product.name\_en} scientific={product.scientific\_name} /\>  
\<PersonalityTag text={product.personality} /\>  
\<ImageGallery images={product.image\_urls} /\>  
\<Badges   
  petSafe={product.pet\_safe}   
  lightLevel={product.light\_level}  
  difficulty={product.difficulty}  
/\>  
\<CareSnapshot   
  light={product.light\_level}  
  water={product.water\_frequency}  
  soil={product.soil\_type}  
  growth={product.growth\_speed}  
/\>  
\<SizeSelector sizes={sizes} onChange={setSelectedSize} /\>  
\<SizeGuarantee current="6-8\\"" mature="24-36\\"" /\>  
\<PriceDisplay   
  price={selectedSize?.price || product.base\_price}  
  comparePrice={product.compare\_price}  
/\>  
\<GuaranteeBadge /\>  
\<ShippingEstimate zipCode={userZone?.zip} /\>  
\<div className="flex gap-4"\>  
  \<AddToCartButton productId={product.id} sizeId={selectedSize.id} /\>  
  \<WhatsAppStockButton   
    productName={product.name\_en}  
    sku={selectedSize.sku}  
  /\>  
\</div\>

// Below the fold  
\<ReviewSection reviews={reviews} productId={product.id} /\>  
\<UnboxingVideos videos={customerVideos} /\>  
\<ExpandableCareGuide product={product} /\>  
\<RelatedProducts category={product.category\_id} /\>  
\`\`\`

\#\#\# Care Snapshot Component (Critical)

\`\`\`jsx  
function CareSnapshot({ light, water, soil, growth }) {  
  return (  
    \<div className="grid grid-cols-2 gap-3 my-4 p-3 bg-green-50 rounded-lg"\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>☀️\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Light\</p\>  
          \<p className="font-medium capitalize"\>{light}\</p\>  
        \</div\>  
      \</div\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>💧\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Water\</p\>  
          \<p className="font-medium"\>{water}\</p\>  
        \</div\>  
      \</div\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>🌱\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Soil\</p\>  
          \<p className="font-medium"\>{soil}\</p\>  
        \</div\>  
      \</div\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>📈\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Growth\</p\>  
          \<p className="font-medium"\>{growth}\</p\>  
        \</div\>  
      \</div\>  
    \</div\>  
  );  
}  
\`\`\`

\---

\#\# MODULE 6: PLANT QUIZ (LEAD CAPTURE)

\#\#\# Purpose  
Help uncertain customers find matching plants. Capture email for marketing. Give 10% discount.

\#\#\# Quiz Flow

\`\`\`jsx  
// 6 questions, one at a time  
const questions \= \[  
  { id: 'location', text: 'Where will your plant live?',   
    options: \['Living room', 'Desk', 'Balcony'\] },  
  { id: 'light', text: 'How much light does that spot get?',  
    options: \['Low (no direct sun)', 'Medium (some sun)', 'Bright (direct sun)'\] },  
  { id: 'home', text: 'How often are you home?',  
    options: \['Most days', 'Travel sometimes', 'Rarely home'\] },  
  { id: 'pets', text: 'Do you have pets or young kids?',  
    options: \['Yes (filter toxic plants)', 'No'\] },  
  { id: 'experience', text: 'What\\'s your plant experience?',  
    options: \['Newbie', 'Some experience', 'Plant expert'\] },  
  { id: 'zip', text: 'What\\'s your PIN code?',  
    inputType: 'number', maxLength: 6 }  
\];

// After question 6 → email capture screen  
\<EmailCapture   
  onSubmit={(email) \=\> {  
    saveQuizAnswers({ ...answers, email });  
    showResults();  
  }}  
  discountCode="QUIZ-ABCD"  
/\>

// Results page  
\<ResultsPage   
  recommendations={matchedPlants}  
  discountCode="QUIZ-ABCD"  
/\>  
\`\`\`

\#\#\# Quiz Matching Logic (API)

\#\#\#\# POST \`/api/quiz\`

\*\*Request body:\*\*  
\`\`\`json  
{  
  "location": "Living room",  
  "light": "Low",  
  "home": "Most days",  
  "pets": "No",  
  "experience": "Newbie",  
  "zip": "560001",  
  "email": "user@example.com"  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "recommendations": \[  
    { "id": "uuid", "name": "Snake Plant", "match\_score": 95, "reason": "Thrives in low light, perfect for beginners" },  
    { "id": "uuid", "name": "ZZ Plant", "match\_score": 90, "reason": "Almost unkillable, handles neglect" }  
  \],  
  "discount\_code": "QUIZ-ABCD"  
}  
\`\`\`

\#\#\# Matching Algorithm

\`\`\`javascript  
async function getQuizRecommendations(answers, userZone) {  
  // Build SQL query based on answers  
  let query \= db.products.query();  
    
  // Light filter  
  if (answers.light \=== 'Low') {  
    query \= query.where('light\_level', 'low');  
  } else if (answers.light \=== 'Medium') {  
    query \= query.where('light\_level', 'in', \['low', 'medium'\]);  
  } else if (answers.light \=== 'Bright') {  
    query \= query.where('light\_level', 'in', \['medium', 'bright'\]);  
  }  
    
  // Pet filter  
  if (answers.pets \=== 'Yes') {  
    query \= query.where('pet\_safe', true);  
  }  
    
  // Difficulty filter  
  if (answers.experience \=== 'Newbie') {  
    query \= query.where('difficulty', 'beginner');  
  } else if (answers.experience \=== 'Some experience') {  
    query \= query.where('difficulty', 'in', \['beginner', 'intermediate'\]);  
  }  
    
  // Hardiness zone  
  query \= query.where('hardiness\_min', '\<=', userZone);  
  query \= query.where('hardiness\_max', '\>=', userZone);  
    
  // Get results and score  
  let results \= await query.limit(20);  
    
  results \= results.map(plant \=\> ({  
    ...plant,  
    match\_score: calculateMatchScore(plant, answers)  
  }));  
    
  results.sort((a, b) \=\> b.match\_score \- a.match\_score);  
    
  // Store quiz response  
  await db.quiz\_responses.insert({  
    email: answers.email,  
    light\_level: answers.light,  
    home\_frequency: answers.home,  
    has\_pets: answers.pets \=== 'Yes',  
    experience: answers.experience,  
    zip\_code: answers.zip,  
    recommended\_ids: results.slice(0, 10).map(p \=\> p.id),  
    discount\_code: generateDiscountCode()  
  });  
    
  return results.slice(0, 10);  
}

function calculateMatchScore(plant, answers) {  
  let score \= 0;  
  if (plant.pet\_safe && answers.pets \=== 'Yes') score \+= 30;  
  if (plant.difficulty \=== 'beginner' && answers.experience \=== 'Newbie') score \+= 25;  
  if (plant.light\_level \=== answers.light.toLowerCase()) score \+= 20;  
  if (plant.is\_rescue \=== false) score \+= 10; // Prefer healthy plants  
  if (plant.stock\_quantity \> 0\) score \+= 10;  
  return score;  
}  
\`\`\`

\---

\#\# MODULE 7: ORDER MANAGEMENT & TRACKING

\#\#\# Purpose  
Track orders from pending to delivered. Handle COD verification, shipping updates, and status notifications.

\#\#\# Order Status Flow

\`\`\`  
pending (just created)  
   │  
   ├──→ cancelled (user or admin)  
   │  
   ↓  
confirmed (payment received or COD verified)  
   │  
   ↓  
processing (being packed)  
   │  
   ↓  
shipped (dispatched, tracking available)  
   │  
   ↓  
delivered (customer received)  
   │  
   ↓  
refunded (warranty claim approved)  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# GET \`/api/orders/\[id\]\` (Get order details)

\*\*Response:\*\*  
\`\`\`json  
{  
  "orderNumber": "KF-2026-00123",  
  "status": "shipped",  
  "trackingNumber": "SHIP123456",  
  "trackingUrl": "https://shiprocket.com/track/SHIP123456",  
  "items": \[...\],  
  "shippingAddress": {...},  
  "totalAmount": 1247,  
  "paymentMethod": "upi",  
  "createdAt": "2026-05-24T10:00:00Z",  
  "estimatedDelivery": "2026-05-28",  
  "canClaimWarranty": false, // true if delivered \<30 days  
  "warrantyDeadline": null  
}  
\`\`\`

\#\#\#\# POST \`/api/orders/\[id\]/cancel\` (Cancel order)

\*\*Conditions for cancellation:\*\*  
\- Order status is 'pending' or 'confirmed'  
\- Not yet shipped  
\- COD orders can be cancelled anytime before dispatch

\#\#\# COD Verification Flow

\`\`\`javascript  
// Admin dashboard action  
async function verifyCODOrder(orderId) {  
  const order \= await db.orders.findById(orderId);  
    
  // Call customer to verify  
  const callResult \= await makeVerificationCall(order.guest\_phone);  
    
  if (callResult.confirmed) {  
    await db.orders.update(orderId, {  
      order\_status: 'confirmed',  
      payment\_status: 'pending' // COD payment collected on delivery  
    });  
    await createShipment(orderId);  
    await sendOrderConfirmed(orderId);  
  } else {  
    await db.orders.update(orderId, {  
      order\_status: 'cancelled',  
      cancellation\_reason: 'COD verification failed'  
    });  
  }  
}  
\`\`\`

\#\#\# Shipping Status Webhook

\#\#\#\# POST \`/api/webhooks/shiprocket\`

\`\`\`javascript  
async function handleShipmentUpdate(payload) {  
  const { order\_id, status, awb\_code, courier\_name } \= payload;  
    
  const orderNumber \= order\_id; // Your order number  
  const trackingNumber \= awb\_code;  
    
  if (status \=== 'pickup\_scheduled') {  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'processing'  
    });  
  }  
    
  if (status \=== 'picked\_up') {  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'shipped',  
      tracking\_number: trackingNumber,  
      shipped\_at: new Date()  
    });  
    await sendShipmentNotification(orderNumber, trackingNumber);  
  }  
    
  if (status \=== 'delivered') {  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'delivered',  
      delivered\_at: new Date()  
    });  
      
    // Trigger post-purchase care sequence  
    await schedulePostPurchaseSequence(orderNumber);  
  }  
    
  if (status \=== 'rto' || status \=== 'cancelled') {  
    // Restock inventory  
    await restockOrderItems(orderNumber);  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'cancelled'  
    });  
  }  
}  
\`\`\`

\---

\#\# MODULE 8: POST-PURCHASE CARE SEQUENCE

\#\#\# Purpose  
Keep customers successful with their plants. Drive repeat purchases through care reminders.

\#\#\# Data Model

\`\`\`sql  
CREATE TABLE user\_plants (  
  id UUID PRIMARY KEY,  
  user\_id UUID REFERENCES users(id),  
  product\_id UUID REFERENCES products(id),  
  nickname VARCHAR(100),  
  photo\_url VARCHAR(500),  
  purchase\_date DATE,  
  next\_water\_date DATE,  
  last\_care\_reminder\_sent DATE,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE TABLE care\_sequence\_logs (  
  id UUID PRIMARY KEY,  
  order\_id UUID REFERENCES orders(id),  
  user\_id UUID REFERENCES users(id),  
  day\_number INTEGER,  \-- 0, 7, 14, 21, 28, 30, 60  
  channel VARCHAR(20), \-- 'email', 'whatsapp'  
  message\_template VARCHAR(100),  
  sent\_at TIMESTAMPTZ,  
  opened\_at TIMESTAMPTZ  
);  
\`\`\`

\#\#\# Sequence Definition

\`\`\`javascript  
const CARE\_SEQUENCE \= \[  
  { day: 0, channel: 'whatsapp', template: 'delivery\_day' },  
  { day: 7, channel: 'email', template: 'first\_watering' },  
  { day: 14, channel: 'whatsapp', template: 'growth\_check' },  
  { day: 21, channel: 'email', template: 'fertilizer\_guide' },  
  { day: 28, channel: 'whatsapp', template: 'propagation\_tips' },  
  { day: 30, channel: 'email', template: 'warranty\_reminder' },  
  { day: 60, channel: 'whatsapp', template: 'soil\_refresh' }  
\];

// Trigger when order status becomes 'delivered'  
async function schedulePostPurchaseSequence(orderId) {  
  const order \= await db.orders.findById(orderId);  
  const items \= await db.order\_items.findByOrderId(orderId);  
    
  // Create user\_plants records  
  for (const item of items) {  
    await db.user\_plants.insert({  
      user\_id: order.user\_id,  
      product\_id: item.product\_id,  
      purchase\_date: new Date(),  
      next\_water\_date: calculateNextWaterDate(item.product\_id)  
    });  
  }  
    
  // Schedule care messages  
  for (const step of CARE\_SEQUENCE) {  
    const delayMs \= step.day \* 24 \* 60 \* 60 \* 1000;  
    await scheduleJob({  
      type: 'care\_message',  
      orderId,  
      userId: order.user\_id,  
      day: step.day,  
      channel: step.channel,  
      template: step.template,  
      scheduledAt: new Date(Date.now() \+ delayMs)  
    });  
  }  
}  
\`\`\`

\#\#\# Message Templates (Copy-Paste)

\*\*Day 0 (WhatsApp):\*\*  
\`\`\`  
🌱 Your \[Plant Name\] has arrived\!

📦 Unbox within 2 hours  
💧 Let plant rest for 24 hours before watering  
📸 Reply with a photo for a free health check

Need help? Reply here or call \+91-XXXXXXXXXX  
\`\`\`

\*\*Day 7 (Email):\*\*  
\`\`\`  
Subject: Time to water your \[Plant Name\] 🌿

Hi \[Name\],

Your \[Plant Name\] needs its first drink\!

💧 Watering guide: \[Link to video\]  
🌡️ Check soil: Insert finger 1 inch deep — if dry, water  
📏 Amount: 100-200ml depending on pot size

Watch the 30-second video: \[Link\]

Happy planting\!  
Karnataka Farms Team  
\`\`\`

\*\*Day 30 (Email):\*\*  
\`\`\`  
Subject: Your 30-day warranty ends in 3 days ⏰

Hi \[Name\],

Has your \[Plant Name\] been thriving? Or struggling?

📸 Upload a photo here: \[Link\]  
✅ If healthy → We'll extend your warranty by 30 days  
⚠️ If unhealthy → We'll send a replacement for FREE

No returns needed. Just a photo.

\[Upload Photo Button\]

This offer expires in 72 hours.

Warmly,  
Karnataka Farms  
\`\`\`

\---

\#\# MODULE 9: WARRANTY CLAIM SYSTEM

\#\#\# Purpose  
Handle replacement requests with photo verification. Build trust while preventing abuse.

\#\#\# Claim Form

\*\*URL:\*\* \`/warranty/claim\`

\*\*Form fields:\*\*  
\`\`\`javascript  
const claimSchema \= z.object({  
  orderNumber: z.string().regex(/^KF-\\d{4}-\\d+$/, "Enter valid order number"),  
  plantName: z.string().min(1, "Select a plant"),  
  issueType: z.enum(\['damaged\_on\_arrival', 'declined\_after\_days', 'pests', 'other'\]),  
  daysSinceDelivery: z.number().min(0).max(30),  
  photo1: z.instanceof(File).refine(f \=\> f.size \< 5 \* 1024 \* 1024),  
  photo2: z.instanceof(File).refine(f \=\> f.size \< 5 \* 1024 \* 1024),  
  description: z.string().max(500).optional()  
});  
\`\`\`

\#\#\# API Endpoint

\#\#\#\# POST \`/api/warranty\`

\`\`\`javascript  
async function submitWarrantyClaim(data) {  
  // 1\. Find order  
  const order \= await db.orders.findOne({  
    where: { order\_number: data.orderNumber }  
  });  
    
  if (\!order) {  
    return { error: "Order not found" };  
  }  
    
  // 2\. Check if within 30 days of delivery  
  const daysSinceDelivery \= Math.floor(  
    (new Date() \- new Date(order.delivered\_at)) / (1000 \* 60 \* 60 \* 24\)  
  );  
    
  if (daysSinceDelivery \> 30\) {  
    return { error: "Warranty expired after 30 days" };  
  }  
    
  // 3\. Check if already claimed  
  const existingClaim \= await db.warranty\_claims.findOne({  
    where: { order\_id: order.id, status: \['pending', 'approved'\] }  
  });  
    
  if (existingClaim) {  
    return { error: "A claim already exists for this order" };  
  }  
    
  // 4\. Upload photos to Supabase storage  
  const photoUrls \= await Promise.all(\[  
    uploadFile(data.photo1, \`claims/${order.id}/photo1.jpg\`),  
    uploadFile(data.photo2, \`claims/${order.id}/photo2.jpg\`)  
  \]);  
    
  // 5\. Create claim record  
  const claim \= await db.warranty\_claims.insert({  
    order\_id: order.id,  
    user\_id: order.user\_id,  
    product\_id: await getProductFromOrder(order.id, data.plantName),  
    photo\_urls: photoUrls,  
    issue\_type: data.issueType,  
    description: data.description,  
    status: 'pending'  
  });  
    
  // 6\. Notify admin  
  await sendAdminNotification(\`New warranty claim: ${claim.id}\`);  
    
  // 7\. Auto-approve simple cases (damaged on arrival)  
  if (data.issueType \=== 'damaged\_on\_arrival') {  
    await autoApproveClaim(claim.id);  
  }  
    
  return {  
    success: true,  
    claimId: claim.id,  
    status: 'pending',  
    message: "Claim submitted. We'll respond within 24 hours."  
  };  
}

// Admin approval action  
async function approveClaim(claimId, replacementCredit \= null) {  
  const claim \= await db.warranty\_claims.update(claimId, {  
    status: 'approved',  
    admin\_notes: 'Approved',  
    replacement\_credit: replacementCredit || calculateReplacementCredit(claim.order\_id)  
  });  
    
  // Issue store credit  
  await db.users.update(claim.user\_id, {  
    store\_credit: db.raw(\`store\_credit \+ ${claim.replacement\_credit}\`)  
  });  
    
  // Send customer notification  
  await sendClaimApproved(claim.user\_id, claim.replacement\_credit);  
    
  // Mark order as having claimed warranty  
  await db.orders.update(claim.order\_id, {  
    guarantee\_claimed: true  
  });  
    
  return { success: true };  
}  
\`\`\`

\#\#\# Claim Status Dashboard (Admin)

| Claim ID | Order | Customer | Issue | Photos | Status | Action |  
|----------|-------|----------|-------|--------|--------|--------|  
| CL-001 | KF-2026-00123 | Ramesh | Damaged on arrival | \[View\] | Pending | Approve / Reject |  
| CL-002 | KF-2026-00145 | Priya | Declined after 7 days | \[View\] | Approved | \- |

\---

\#\# MODULE 10: "MY GARDEN" DASHBOARD

\#\#\# Purpose  
Customer portal to track their plants, get care reminders, and upload growth photos.

\#\#\# Page Structure

\*\*URL:\*\* \`/my-garden\` (requires login)

\*\*Sections:\*\*

\`\`\`jsx  
\<MyGardenDashboard\>  
  {/\* My Plants Section \*/}  
  \<MyPlantsList\>  
    {plants.map(plant \=\> (  
      \<PlantCard\>  
        \<PlantImage src={plant.photo} /\>  
        \<PlantName\>{plant.nickname || plant.product\_name}\</PlantName\>  
        \<PurchaseDate\>Bought: {plant.purchase\_date}\</PurchaseDate\>  
        \<NextWatering class={plant.next\_water\_date \<= today ? 'bg-red-100' : ''}\>  
          Water on: {plant.next\_water\_date}  
        \</NextWatering\>  
        \<UploadButton onClick={() \=\> openUploadModal(plant)}\>  
          📸 Upload growth photo  
        \</UploadButton\>  
      \</PlantCard\>  
    ))}  
  \</MyPlantsList\>  
    
  {/\* Watering Schedule \*/}  
  \<WateringSchedule\>  
    \<h3\>Today's Tasks\</h3\>  
    {todayTasks.map(task \=\> (  
      \<TaskItem\>  
        💧 Water {task.plant\_name}  
        \<MarkDoneButton /\>  
      \</TaskItem\>  
    ))}  
  \</WateringSchedule\>  
    
  {/\* Loyalty Progress \*/}  
  \<LoyaltyCard\>  
    \<TierName\>{userTier.name}\</TierName\>  
    \<ProgressBar value={pointsToNextTier} max={nextTierThreshold} /\>  
    \<PointsBalance\>{userPoints} points\</PointsBalance\>  
    \<TierBenefits\>  
      {userTier.benefits.map(b \=\> \<BenefitItem\>{b}\</BenefitItem\>)}  
    \</TierBenefits\>  
  \</LoyaltyCard\>  
    
  {/\* Warranty Claims \*/}  
  \<ClaimsSection\>  
    {claims.map(claim \=\> (  
      \<ClaimCard status={claim.status}\>  
        Claim \#{claim.id} \- {claim.status}  
      \</ClaimCard\>  
    ))}  
  \</ClaimsSection\>  
\</MyGardenDashboard\>  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# GET \`/api/garden/plants\`

\`\`\`javascript  
async function getUserPlants(userId) {  
  return await db.user\_plants.findAll({  
    where: { user\_id: userId },  
    include: \['product'\]  
  });  
}  
\`\`\`

\#\#\#\# POST \`/api/garden/photos\`

\`\`\`javascript  
async function uploadGrowthPhoto(userId, plantId, photoFile) {  
  const photoUrl \= await uploadToStorage(photoFile, \`user\_plants/${userId}/${plantId}\`);  
    
  await db.user\_plants.update(  
    { user\_id: userId, product\_id: plantId },  
    { photo\_url: photoUrl }  
  );  
    
  // Award points for photo upload  
  await awardPoints(userId, 50, 'Photo upload');  
    
  // Ask permission to use in marketing  
  return { success: true, photoUrl };  
}  
\`\`\`

\---

\#\# MODULE 11: ADMIN PANEL (SOLO FRIENDLY)

\#\#\# Purpose  
Manage orders, inventory, products, and claims from one simple dashboard.

\#\#\# Pages

\#\#\#\# \`/admin/orders\`  
\- List all orders with filters (status, date range)  
\- Update order status  
\- Print packing slip  
\- Mark COD as verified

\#\#\#\# \`/admin/inventory\`  
\- List products with stock levels  
\- Bulk update stock via CSV upload  
\- Set low stock alerts (email when \<5)

\#\#\#\# \`/admin/products\`  
\- Add/edit products  
\- Upload images  
\- Set attributes (light, water, pet safe, difficulty, hardiness zone)

\#\#\#\# \`/admin/claims\`  
\- View warranty claims with photos  
\- Approve/reject with one click  
\- Issue store credit

\#\#\#\# \`/admin/analytics\`  
\- Sales by day/week/month  
\- Top selling products  
\- Conversion rate  
\- Warranty claim rate

\#\#\# CSV Inventory Upload

\*\*Template:\*\*  
\`\`\`csv  
sku,stock\_quantity  
SNK-4,15  
SNK-6,8  
ZZ-6,12  
\`\`\`

\*\*Upload handler:\*\*  
\`\`\`javascript  
async function bulkUpdateInventory(csvFile) {  
  const rows \= await parseCSV(csvFile);  
    
  for (const row of rows) {  
    await db.product\_sizes.update(  
      { sku: row.sku },  
      { stock\_quantity: row.stock\_quantity }  
    );  
  }  
    
  return { success: true, updated: rows.length };  
}  
\`\`\`

\---

\#\# DEPLOYMENT CHECKLIST

\#\#\# Before Launch  
\- \[ \] Supabase database created with all tables  
\- \[ \] 20+ products added with complete attributes  
\- \[ \] 100+ ZIP codes in zip\_zones table  
\- \[ \] Razorpay test mode working  
\- \[ \] Shiprocket account connected  
\- \[ \] Resend email verified  
\- \[ \] Google Maps API key restricted to domain  
\- \[ \] Vercel project connected to GitHub  
\- \[ \] Environment variables set  
\- \[ \] SSL enabled (automatic with Vercel)  
\- \[ \] Test order completed end-to-end

\#\#\# Launch Day  
\- \[ \] Razorpay live mode activated  
\- \[ \] Shiprocket live mode  
\- \[ \] Google Analytics installed  
\- \[ \] WhatsApp number verified  
\- \[ \] 30-day guarantee text on all product pages  
\- \[ \] ZIP code gate working  
\- \[ \] Guest checkout functional  
\- \[ \] Mobile responsive on iPhone and Android

\---

\#\# READY-TO-USE DELIVERABLES (Tell me which one)

1\. \*\*Complete Next.js project structure\*\* (folder by folder)  
2\. \*\*Supabase SQL schema\*\* (copy-paste ready)  
3\. \*\*ZIP code gate component\*\* (full React code)  
4\. \*\*6-question quiz component\*\* (with email capture)  
5\. \*\*One-page checkout\*\* (Razorpay integration)  
6\. \*\*Product detail page\*\* (care snapshot \+ size selector)  
7\. \*\*Cart with abandonment tracking\*\*  
8\. \*\*Post-purchase email templates\*\* (Resend format)  
9\. \*\*Admin panel pages\*\* (orders, inventory, claims)  
10\. \*\*"My Garden" dashboard\*\* (full React component)

\*\*Just reply with the module number (1-11) or deliverable number (1-10) you want first.\*\*  
I will now produce the \*\*full end-to-end module-wise specification\*\* for Karnataka Farms Plant Nursery. This is broken into \*\*11 modules\*\* — each module is a self-contained, buildable unit with clear inputs, outputs, logic, edge cases, and AI-friendly pseudocode.

You can build module by module. Each module is \*\*realistic, affordable, and solo-founder friendly\*\*.

\---

\# KARNATAKA FARMS PLANT NURSERY  
\#\# MODULE-WISE END-TO-END SPECIFICATIONS  
\#\#\# Version 1.0 | AI-Ready | Solo Founder Budget

\---

\#\# MODULE 1: ZIP CODE GATE & CLIMATE FILTERING

\#\#\# Purpose  
Prevent customers from ordering plants that will die in their climate. This single feature reduces returns by 30-50%.

\#\#\# Inputs  
| Field | Type | Validation |  
|-------|------|------------|  
| PIN code | String (6 digits) | Must exist in \`zip\_zones\` table |

\#\#\# Outputs  
| Output | Type | Description |  
|--------|------|-------------|  
| Hardiness zone | Integer (1-13) | USDA zone for this location |  
| City name | String | For display and SEO |  
| Is serviceable | Boolean | Can we deliver here? |  
| Filtered products | Array | Products matching zone \+ other filters |

\#\#\# Business Logic

\`\`\`javascript  
// Pseudo-code — implement in your API route  
function handleZipCode(zipCode) {  
  // 1\. Validate format  
  if (\!/^\\d{6}$/.test(zipCode)) {  
    return { error: "Enter 6-digit PIN code" };  
  }  
    
  // 2\. Look up in database  
  const zoneRecord \= await db.zip\_zones.findOne({   
    where: { zip\_code: zipCode }  
  });  
    
  // 3\. Handle not found  
  if (\!zoneRecord) {  
    return {   
      error: "We don't deliver to this location yet. Pick up from our nursery?",  
      canPickup: true,  
      nurseryAddress: "Karnataka Farms, \[Your Address\]"  
    };  
  }  
    
  // 4\. Store in session/localStorage  
  setUserSession({   
    zipCode,   
    hardinessZone: zoneRecord.hardiness\_zone,  
    city: zoneRecord.city   
  });  
    
  // 5\. Return success  
  return {  
    success: true,  
    hardinessZone: zoneRecord.hardiness\_zone,  
    city: zoneRecord.city,  
    isServiceable: zoneRecord.is\_serviceable  
  };  
}

// Product filtering based on zone  
function filterProductsByZone(products, userZone) {  
  return products.filter(product \=\>   
    product.hardiness\_min \<= userZone &&   
    product.hardiness\_max \>= userZone  
  );  
}  
\`\`\`

\#\#\# Edge Cases  
| Scenario | Behavior |  
|----------|----------|  
| PIN not in database | Show pickup option, don't block completely |  
| User skips ZIP gate | Show limited "national" products only |  
| Invalid format (less/more than 6 digits) | Show error, don't proceed |  
| Database timeout | Show cached results or static message |

\#\#\# Storage Required  
\- \`zip\_zones\` table (pre-populated with 100+ Karnataka PINs)  
\- User session (localStorage \+ cookie for server-side)

\#\#\# UI Component  
\`\`\`jsx  
\<ZipGateModal   
  isOpen={\!hasZip}  
  onSubmit={handleZipSubmit}  
  onSkip={() \=\> showLimitedCatalog()}  
/\>  
\`\`\`

\---

\#\# MODULE 2: PRODUCT DATABASE & CATALOG MANAGEMENT

\#\#\# Purpose  
Store and retrieve plant products with all attributes needed for filtering, displaying, and selling.

\#\#\# Database Schema (Already defined, this is the reference)

\`\`\`sql  
\-- Products table  
CREATE TABLE products (  
  id UUID PRIMARY KEY,  
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
  image\_urls TEXT\[\] DEFAULT '{}'  
);

\-- Product sizes (variants)  
CREATE TABLE product\_sizes (  
  id UUID PRIMARY KEY,  
  product\_id UUID REFERENCES products(id),  
  size\_label VARCHAR(20) NOT NULL,  
  pot\_diameter\_inches INTEGER,  
  price DECIMAL(10,2) NOT NULL,  
  stock\_quantity INTEGER DEFAULT 0,  
  sku VARCHAR(100) UNIQUE,  
  is\_default BOOLEAN DEFAULT FALSE  
);  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# GET \`/api/products\` (List with filters)

\*\*Query parameters:\*\*  
| Parameter | Type | Example | Description |  
|-----------|------|---------|-------------|  
| light | string | 'low' | low / medium / bright |  
| petSafe | boolean | 'true' | Filter pet-safe plants |  
| difficulty | string | 'beginner' | beginner / intermediate / expert |  
| minPrice | number | 299 | Minimum price |  
| maxPrice | number | 999 | Maximum price |  
| size | string | '6' | Pot size in inches |  
| search | string | 'snake' | Search in name \+ scientific |  
| page | number | 1 | Pagination |  
| limit | number | 20 | Items per page |  
| sort | string | 'price\_asc' | price\_asc / price\_desc / newest / popular |

\*\*Response:\*\*  
\`\`\`json  
{  
  "products": \[  
    {  
      "id": "uuid",  
      "name": "Snake Plant",  
      "slug": "snake-plant",  
      "image": "https://...",  
      "light\_level": "low",  
      "pet\_safe": true,  
      "difficulty": "beginner",  
      "base\_price": 599,  
      "sizes": \[  
        { "label": "4\\"", "price": 299, "in\_stock": true },  
        { "label": "6\\"", "price": 599, "in\_stock": true }  
      \]  
    }  
  \],  
  "total": 45,  
  "page": 1,  
  "totalPages": 3  
}  
\`\`\`

\#\#\#\# GET \`/api/products/\[slug\]\` (Single product)

\*\*Response:\*\*  
\`\`\`json  
{  
  "id": "uuid",  
  "name": "Snake Plant",  
  "scientific\_name": "Sansevieria trifasciata",  
  "personality": "The Bedroom Guardian",  
  "description": "Perfect for beginners...",  
  "light\_level": "low",  
  "water\_frequency": "Every 10-14 days",  
  "soil\_type": "Well-draining cactus mix",  
  "growth\_speed": "Slow",  
  "pet\_safe": true,  
  "difficulty": "beginner",  
  "hardiness\_min": 10,  
  "hardiness\_max": 12,  
  "base\_price": 599,  
  "compare\_price": 899,  
  "image\_urls": \["url1", "url2", "url3"\],  
  "sizes": \[  
    { "label": "4\\"", "price": 299, "stock": 12, "sku": "SNK-4" },  
    { "label": "6\\"", "price": 599, "stock": 8, "sku": "SNK-6" },  
    { "label": "10\\"", "price": 999, "stock": 3, "sku": "SNK-10" }  
  \],  
  "reviews": {  
    "average": 4.8,  
    "count": 23,  
    "items": \[...\]  
  }  
}  
\`\`\`

\#\#\# Input Validation (Zod schema)  
\`\`\`javascript  
const productFilterSchema \= z.object({  
  light: z.enum(\['low', 'medium', 'bright'\]).optional(),  
  petSafe: z.enum(\['true', 'false'\]).transform(v \=\> v \=== 'true').optional(),  
  difficulty: z.enum(\['beginner', 'intermediate', 'expert'\]).optional(),  
  minPrice: z.coerce.number().min(0).optional(),  
  maxPrice: z.coerce.number().min(0).optional(),  
  size: z.enum(\['4', '6', '10'\]).optional(),  
  search: z.string().max(100).optional(),  
  page: z.coerce.number().min(1).default(1),  
  limit: z.coerce.number().min(1).max(50).default(20),  
  sort: z.enum(\['price\_asc', 'price\_desc', 'newest', 'popular'\]).default('popular')  
});  
\`\`\`

\---

\#\# MODULE 3: SHOPPING CART (GUEST \+ USER)

\#\#\# Purpose  
Allow users to add products, manage quantities, and persist cart across sessions (no login required).

\#\#\# Data Storage

\*\*Database table:\*\*  
\`\`\`sql  
CREATE TABLE cart\_items (  
  id UUID PRIMARY KEY,  
  user\_id UUID REFERENCES users(id),        \-- NULL for guests  
  session\_id VARCHAR(100),                  \-- For guest carts  
  product\_id UUID NOT NULL,  
  size\_id UUID NOT NULL,  
  quantity INTEGER NOT NULL DEFAULT 1,  
  added\_at TIMESTAMPTZ DEFAULT NOW()  
);  
\`\`\`

\*\*Cart identification logic:\*\*  
\`\`\`  
if (user logged in):  
  use user\_id  
else:  
  use session\_id (from cookie/localStorage)  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# POST \`/api/cart\` (Add item)  
\*\*Request body:\*\*  
\`\`\`json  
{  
  "product\_id": "uuid",  
  "size\_id": "uuid",  
  "quantity": 1  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "success": true,  
  "cart": {  
    "items": \[...\],  
    "subtotal": 599,  
    "item\_count": 1  
  }  
}  
\`\`\`

\#\#\#\# GET \`/api/cart\` (Get cart)  
\*\*Response:\*\*  
\`\`\`json  
{  
  "items": \[  
    {  
      "id": "cart\_item\_id",  
      "product\_id": "uuid",  
      "product\_name": "Snake Plant",  
      "size\_label": "6\\"",  
      "quantity": 2,  
      "price": 599,  
      "total": 1198,  
      "image\_url": "..."  
    }  
  \],  
  "subtotal": 1198,  
  "shipping": 49,  
  "discount": 0,  
  "total": 1247,  
  "item\_count": 2  
}  
\`\`\`

\#\#\#\# PUT \`/api/cart/\[id\]\` (Update quantity)  
\*\*Request body:\*\*  
\`\`\`json  
{ "quantity": 3 }  
\`\`\`

\#\#\#\# DELETE \`/api/cart/\[id\]\` (Remove item)

\#\#\# Business Logic

\`\`\`javascript  
// Add to cart logic  
async function addToCart(userId, sessionId, productId, sizeId, quantity) {  
  // 1\. Check stock availability  
  const size \= await db.product\_sizes.findById(sizeId);  
  if (size.stock\_quantity \< quantity) {  
    return { error: "Only " \+ size.stock\_quantity \+ " left in stock" };  
  }  
    
  // 2\. Find existing cart item  
  const existing \= await db.cart\_items.findOne({  
    where: {  
      user\_id: userId || null,  
      session\_id: sessionId || null,  
      product\_id: productId,  
      size\_id: sizeId  
    }  
  });  
    
  // 3\. Update or insert  
  if (existing) {  
    const newQuantity \= existing.quantity \+ quantity;  
    if (newQuantity \> 10\) {  
      return { error: "Maximum 10 items per product" };  
    }  
    await db.cart\_items.update(existing.id, { quantity: newQuantity });  
  } else {  
    await db.cart\_items.insert({  
      user\_id: userId,  
      session\_id: sessionId,  
      product\_id: productId,  
      size\_id: sizeId,  
      quantity: Math.min(quantity, 10\)  
    });  
  }  
    
  // 4\. Return updated cart  
  return await getCart(userId, sessionId);  
}  
\`\`\`

\#\#\# Edge Cases  
| Scenario | Behavior |  
|----------|----------|  
| Add more than stock | Show error with available quantity |  
| Add more than 10 items | Cap at 10, show message |  
| Product discontinued | Remove from cart, show notification |  
| Guest cart after login | Merge guest cart into user cart |

\---

\#\# MODULE 4: GUEST CHECKOUT & ORDER CREATION

\#\#\# Purpose  
Complete purchase without account creation. One-page checkout with all necessary fields.

\#\#\# Form Fields (in order)

\`\`\`javascript  
const checkoutSchema \= z.object({  
  // Customer info  
  fullName: z.string().min(2, "Enter full name"),  
  phone: z.string().regex(/^\[6-9\]\\d{9}$/, "Enter 10-digit mobile number"),  
  email: z.string().email("Enter valid email"),  
    
  // Address  
  addressLine1: z.string().min(5, "Enter address"),  
  addressLine2: z.string().optional(),  
  city: z.string().min(2, "Enter city"),  
  pincode: z.string().length(6, "Enter 6-digit PIN"),  
  landmark: z.string().optional(),  
    
  // Delivery  
  deliveryMethod: z.enum(\['home', 'pickup'\]),  
    
  // Payment  
  paymentMethod: z.enum(\['cod', 'upi', 'card'\]),  
    
  // Consent  
  whatsappOptIn: z.boolean().default(false)  
});  
\`\`\`

\#\#\# Order Creation API

\#\#\#\# POST \`/api/checkout\`

\*\*Request body:\*\*  
\`\`\`json  
{  
  "customer": {  
    "fullName": "Ramesh Kumar",  
    "phone": "9876543210",  
    "email": "ramesh@example.com",  
    "addressLine1": "\#123, 1st Main",  
    "addressLine2": "Indiranagar",  
    "city": "Bangalore",  
    "pincode": "560001",  
    "landmark": "Near Metro"  
  },  
  "deliveryMethod": "home",  
  "paymentMethod": "upi",  
  "whatsappOptIn": true,  
  "cart": { ... } // from session  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "success": true,  
  "orderId": "uuid",  
  "orderNumber": "KF-2026-00123",  
  "razorpayOrderId": "order\_xxx",  // if UPI/card  
  "totalAmount": 1247,  
  "paymentMethod": "upi"  
}  
\`\`\`

\#\#\# Business Logic

\`\`\`javascript  
async function createOrder(checkoutData, cart, userZone) {  
  // 1\. Validate cart not empty  
  if (cart.items.length \=== 0\) {  
    return { error: "Cart is empty" };  
  }  
    
  // 2\. Check stock for all items  
  for (const item of cart.items) {  
    const size \= await db.product\_sizes.findById(item.size\_id);  
    if (size.stock\_quantity \< item.quantity) {  
      return {   
        error: \`${item.product\_name} only ${size.stock\_quantity} left\`   
      };  
    }  
  }  
    
  // 3\. Check weather hold  
  const weatherCheck \= await checkShippingWeather(checkoutData.customer.pincode);  
  if (\!weatherCheck.canShip && checkoutData.deliveryMethod \=== 'home') {  
    return {  
      error: \`Weather hold: ${weatherCheck.holdReason}. Delivery not available.\`,  
      weatherHold: true  
    };  
  }  
    
  // 4\. Calculate totals  
  const subtotal \= cart.items.reduce((sum, i) \=\> sum \+ (i.price \* i.quantity), 0);  
  const shippingCost \= (subtotal \>= 499\) ? 0 : 49;  
  const total \= subtotal \+ shippingCost;  
    
  // 5\. Create order record  
  const orderNumber \= \`KF-${new Date().getFullYear()}-${Date.now()}\`;  
  const order \= await db.orders.insert({  
    order\_number: orderNumber,  
    guest\_email: checkoutData.customer.email,  
    guest\_phone: checkoutData.customer.phone,  
    shipping\_address: checkoutData.customer,  
    subtotal,  
    shipping\_cost: shippingCost,  
    total\_amount: total,  
    payment\_method: checkoutData.paymentMethod,  
    whatsapp\_opted\_in: checkoutData.whatsappOptIn,  
    order\_status: 'pending'  
  });  
    
  // 6\. Create order items  
  for (const item of cart.items) {  
    await db.order\_items.insert({  
      order\_id: order.id,  
      product\_id: item.product\_id,  
      size\_id: item.size\_id,  
      product\_name: item.product\_name,  
      quantity: item.quantity,  
      price: item.price  
    });  
  }  
    
  // 7\. Reserve inventory (decrement stock)  
  for (const item of cart.items) {  
    await db.product\_sizes.decrementStock(item.size\_id, item.quantity);  
  }  
    
  // 8\. For online payments, create Razorpay order  
  let razorpayOrder \= null;  
  if (checkoutData.paymentMethod \!== 'cod') {  
    razorpayOrder \= await createRazorpayOrder({  
      amount: total \* 100,  // paise  
      currency: 'INR',  
      receipt: orderNumber,  
      notes: { orderId: order.id }  
    });  
  }  
    
  // 9\. Clear cart  
  await clearCart(checkoutData.sessionId, checkoutData.userId);  
    
  // 10\. Schedule post-purchase jobs  
  if (checkoutData.whatsappOptIn) {  
    await scheduleWhatsAppOptIn(order.id, checkoutData.customer.phone);  
  }  
    
  return {  
    success: true,  
    orderId: order.id,  
    orderNumber,  
    razorpayOrderId: razorpayOrder?.id,  
    totalAmount: total  
  };  
}  
\`\`\`

\#\#\# Payment Verification Webhook

\#\#\#\# POST \`/api/webhooks/razorpay\`

\`\`\`javascript  
async function handleRazorpayWebhook(payload) {  
  // 1\. Verify signature  
  const isValid \= verifyRazorpaySignature(payload);  
  if (\!isValid) return { error: "Invalid signature" };  
    
  // 2\. Get event  
  const event \= payload.event;  
    
  if (event \=== 'payment.captured') {  
    const orderId \= payload.payload.order.entity.receipt;  
    await db.orders.update(  
      { order\_number: orderId },  
      {   
        payment\_status: 'paid',  
        order\_status: 'confirmed',  
        paid\_at: new Date()  
      }  
    );  
      
    // Trigger Shiprocket order creation  
    await createShipment(orderId);  
      
    // Send confirmation emails/WhatsApp  
    await sendOrderConfirmation(orderId);  
  }  
    
  if (event \=== 'payment.failed') {  
    // Mark order as failed, restock inventory  
    await handleFailedPayment(orderId);  
  }  
}  
\`\`\`

\---

\#\# MODULE 5: PRODUCT DETAIL PAGE (PDP)

\#\#\# Purpose  
Display plant with care information BEFORE the add-to-cart button. Build trust and reduce returns.

\#\#\# Required Data Fetch

\`\`\`javascript  
// Server component (Next.js)  
async function ProductPage({ params }) {  
  const product \= await db.products.findOne({  
    where: { slug: params.slug, is\_active: true }  
  });  
    
  if (\!product) return notFound();  
    
  const sizes \= await db.product\_sizes.findAll({  
    where: { product\_id: product.id }  
  });  
    
  const reviews \= await db.reviews.findAll({  
    where: { product\_id: product.id, is\_approved: true },  
    limit: 10,  
    order: { created\_at: 'desc' }  
  });  
    
  const userZone \= await getUserZone(); // from ZIP gate  
    
  return \<ProductDetail product={product} sizes={sizes} reviews={reviews} userZone={userZone} /\>;  
}  
\`\`\`

\#\#\# UI Component Structure

\`\`\`jsx  
// Above the fold (visible without scroll)  
\<ProductName name={product.name\_en} scientific={product.scientific\_name} /\>  
\<PersonalityTag text={product.personality} /\>  
\<ImageGallery images={product.image\_urls} /\>  
\<Badges   
  petSafe={product.pet\_safe}   
  lightLevel={product.light\_level}  
  difficulty={product.difficulty}  
/\>  
\<CareSnapshot   
  light={product.light\_level}  
  water={product.water\_frequency}  
  soil={product.soil\_type}  
  growth={product.growth\_speed}  
/\>  
\<SizeSelector sizes={sizes} onChange={setSelectedSize} /\>  
\<SizeGuarantee current="6-8\\"" mature="24-36\\"" /\>  
\<PriceDisplay   
  price={selectedSize?.price || product.base\_price}  
  comparePrice={product.compare\_price}  
/\>  
\<GuaranteeBadge /\>  
\<ShippingEstimate zipCode={userZone?.zip} /\>  
\<div className="flex gap-4"\>  
  \<AddToCartButton productId={product.id} sizeId={selectedSize.id} /\>  
  \<WhatsAppStockButton   
    productName={product.name\_en}  
    sku={selectedSize.sku}  
  /\>  
\</div\>

// Below the fold  
\<ReviewSection reviews={reviews} productId={product.id} /\>  
\<UnboxingVideos videos={customerVideos} /\>  
\<ExpandableCareGuide product={product} /\>  
\<RelatedProducts category={product.category\_id} /\>  
\`\`\`

\#\#\# Care Snapshot Component (Critical)

\`\`\`jsx  
function CareSnapshot({ light, water, soil, growth }) {  
  return (  
    \<div className="grid grid-cols-2 gap-3 my-4 p-3 bg-green-50 rounded-lg"\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>☀️\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Light\</p\>  
          \<p className="font-medium capitalize"\>{light}\</p\>  
        \</div\>  
      \</div\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>💧\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Water\</p\>  
          \<p className="font-medium"\>{water}\</p\>  
        \</div\>  
      \</div\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>🌱\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Soil\</p\>  
          \<p className="font-medium"\>{soil}\</p\>  
        \</div\>  
      \</div\>  
      \<div className="flex items-center gap-2"\>  
        \<span className="text-xl"\>📈\</span\>  
        \<div\>  
          \<p className="text-xs text-gray-500"\>Growth\</p\>  
          \<p className="font-medium"\>{growth}\</p\>  
        \</div\>  
      \</div\>  
    \</div\>  
  );  
}  
\`\`\`

\---

\#\# MODULE 6: PLANT QUIZ (LEAD CAPTURE)

\#\#\# Purpose  
Help uncertain customers find matching plants. Capture email for marketing. Give 10% discount.

\#\#\# Quiz Flow

\`\`\`jsx  
// 6 questions, one at a time  
const questions \= \[  
  { id: 'location', text: 'Where will your plant live?',   
    options: \['Living room', 'Desk', 'Balcony'\] },  
  { id: 'light', text: 'How much light does that spot get?',  
    options: \['Low (no direct sun)', 'Medium (some sun)', 'Bright (direct sun)'\] },  
  { id: 'home', text: 'How often are you home?',  
    options: \['Most days', 'Travel sometimes', 'Rarely home'\] },  
  { id: 'pets', text: 'Do you have pets or young kids?',  
    options: \['Yes (filter toxic plants)', 'No'\] },  
  { id: 'experience', text: 'What\\'s your plant experience?',  
    options: \['Newbie', 'Some experience', 'Plant expert'\] },  
  { id: 'zip', text: 'What\\'s your PIN code?',  
    inputType: 'number', maxLength: 6 }  
\];

// After question 6 → email capture screen  
\<EmailCapture   
  onSubmit={(email) \=\> {  
    saveQuizAnswers({ ...answers, email });  
    showResults();  
  }}  
  discountCode="QUIZ-ABCD"  
/\>

// Results page  
\<ResultsPage   
  recommendations={matchedPlants}  
  discountCode="QUIZ-ABCD"  
/\>  
\`\`\`

\#\#\# Quiz Matching Logic (API)

\#\#\#\# POST \`/api/quiz\`

\*\*Request body:\*\*  
\`\`\`json  
{  
  "location": "Living room",  
  "light": "Low",  
  "home": "Most days",  
  "pets": "No",  
  "experience": "Newbie",  
  "zip": "560001",  
  "email": "user@example.com"  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "recommendations": \[  
    { "id": "uuid", "name": "Snake Plant", "match\_score": 95, "reason": "Thrives in low light, perfect for beginners" },  
    { "id": "uuid", "name": "ZZ Plant", "match\_score": 90, "reason": "Almost unkillable, handles neglect" }  
  \],  
  "discount\_code": "QUIZ-ABCD"  
}  
\`\`\`

\#\#\# Matching Algorithm

\`\`\`javascript  
async function getQuizRecommendations(answers, userZone) {  
  // Build SQL query based on answers  
  let query \= db.products.query();  
    
  // Light filter  
  if (answers.light \=== 'Low') {  
    query \= query.where('light\_level', 'low');  
  } else if (answers.light \=== 'Medium') {  
    query \= query.where('light\_level', 'in', \['low', 'medium'\]);  
  } else if (answers.light \=== 'Bright') {  
    query \= query.where('light\_level', 'in', \['medium', 'bright'\]);  
  }  
    
  // Pet filter  
  if (answers.pets \=== 'Yes') {  
    query \= query.where('pet\_safe', true);  
  }  
    
  // Difficulty filter  
  if (answers.experience \=== 'Newbie') {  
    query \= query.where('difficulty', 'beginner');  
  } else if (answers.experience \=== 'Some experience') {  
    query \= query.where('difficulty', 'in', \['beginner', 'intermediate'\]);  
  }  
    
  // Hardiness zone  
  query \= query.where('hardiness\_min', '\<=', userZone);  
  query \= query.where('hardiness\_max', '\>=', userZone);  
    
  // Get results and score  
  let results \= await query.limit(20);  
    
  results \= results.map(plant \=\> ({  
    ...plant,  
    match\_score: calculateMatchScore(plant, answers)  
  }));  
    
  results.sort((a, b) \=\> b.match\_score \- a.match\_score);  
    
  // Store quiz response  
  await db.quiz\_responses.insert({  
    email: answers.email,  
    light\_level: answers.light,  
    home\_frequency: answers.home,  
    has\_pets: answers.pets \=== 'Yes',  
    experience: answers.experience,  
    zip\_code: answers.zip,  
    recommended\_ids: results.slice(0, 10).map(p \=\> p.id),  
    discount\_code: generateDiscountCode()  
  });  
    
  return results.slice(0, 10);  
}

function calculateMatchScore(plant, answers) {  
  let score \= 0;  
  if (plant.pet\_safe && answers.pets \=== 'Yes') score \+= 30;  
  if (plant.difficulty \=== 'beginner' && answers.experience \=== 'Newbie') score \+= 25;  
  if (plant.light\_level \=== answers.light.toLowerCase()) score \+= 20;  
  if (plant.is\_rescue \=== false) score \+= 10; // Prefer healthy plants  
  if (plant.stock\_quantity \> 0\) score \+= 10;  
  return score;  
}  
\`\`\`

\---

\#\# MODULE 7: ORDER MANAGEMENT & TRACKING

\#\#\# Purpose  
Track orders from pending to delivered. Handle COD verification, shipping updates, and status notifications.

\#\#\# Order Status Flow

\`\`\`  
pending (just created)  
   │  
   ├──→ cancelled (user or admin)  
   │  
   ↓  
confirmed (payment received or COD verified)  
   │  
   ↓  
processing (being packed)  
   │  
   ↓  
shipped (dispatched, tracking available)  
   │  
   ↓  
delivered (customer received)  
   │  
   ↓  
refunded (warranty claim approved)  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# GET \`/api/orders/\[id\]\` (Get order details)

\*\*Response:\*\*  
\`\`\`json  
{  
  "orderNumber": "KF-2026-00123",  
  "status": "shipped",  
  "trackingNumber": "SHIP123456",  
  "trackingUrl": "https://shiprocket.com/track/SHIP123456",  
  "items": \[...\],  
  "shippingAddress": {...},  
  "totalAmount": 1247,  
  "paymentMethod": "upi",  
  "createdAt": "2026-05-24T10:00:00Z",  
  "estimatedDelivery": "2026-05-28",  
  "canClaimWarranty": false, // true if delivered \<30 days  
  "warrantyDeadline": null  
}  
\`\`\`

\#\#\#\# POST \`/api/orders/\[id\]/cancel\` (Cancel order)

\*\*Conditions for cancellation:\*\*  
\- Order status is 'pending' or 'confirmed'  
\- Not yet shipped  
\- COD orders can be cancelled anytime before dispatch

\#\#\# COD Verification Flow

\`\`\`javascript  
// Admin dashboard action  
async function verifyCODOrder(orderId) {  
  const order \= await db.orders.findById(orderId);  
    
  // Call customer to verify  
  const callResult \= await makeVerificationCall(order.guest\_phone);  
    
  if (callResult.confirmed) {  
    await db.orders.update(orderId, {  
      order\_status: 'confirmed',  
      payment\_status: 'pending' // COD payment collected on delivery  
    });  
    await createShipment(orderId);  
    await sendOrderConfirmed(orderId);  
  } else {  
    await db.orders.update(orderId, {  
      order\_status: 'cancelled',  
      cancellation\_reason: 'COD verification failed'  
    });  
  }  
}  
\`\`\`

\#\#\# Shipping Status Webhook

\#\#\#\# POST \`/api/webhooks/shiprocket\`

\`\`\`javascript  
async function handleShipmentUpdate(payload) {  
  const { order\_id, status, awb\_code, courier\_name } \= payload;  
    
  const orderNumber \= order\_id; // Your order number  
  const trackingNumber \= awb\_code;  
    
  if (status \=== 'pickup\_scheduled') {  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'processing'  
    });  
  }  
    
  if (status \=== 'picked\_up') {  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'shipped',  
      tracking\_number: trackingNumber,  
      shipped\_at: new Date()  
    });  
    await sendShipmentNotification(orderNumber, trackingNumber);  
  }  
    
  if (status \=== 'delivered') {  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'delivered',  
      delivered\_at: new Date()  
    });  
      
    // Trigger post-purchase care sequence  
    await schedulePostPurchaseSequence(orderNumber);  
  }  
    
  if (status \=== 'rto' || status \=== 'cancelled') {  
    // Restock inventory  
    await restockOrderItems(orderNumber);  
    await db.orders.update({ order\_number: orderNumber }, {  
      order\_status: 'cancelled'  
    });  
  }  
}  
\`\`\`

\---

\#\# MODULE 8: POST-PURCHASE CARE SEQUENCE

\#\#\# Purpose  
Keep customers successful with their plants. Drive repeat purchases through care reminders.

\#\#\# Data Model

\`\`\`sql  
CREATE TABLE user\_plants (  
  id UUID PRIMARY KEY,  
  user\_id UUID REFERENCES users(id),  
  product\_id UUID REFERENCES products(id),  
  nickname VARCHAR(100),  
  photo\_url VARCHAR(500),  
  purchase\_date DATE,  
  next\_water\_date DATE,  
  last\_care\_reminder\_sent DATE,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE TABLE care\_sequence\_logs (  
  id UUID PRIMARY KEY,  
  order\_id UUID REFERENCES orders(id),  
  user\_id UUID REFERENCES users(id),  
  day\_number INTEGER,  \-- 0, 7, 14, 21, 28, 30, 60  
  channel VARCHAR(20), \-- 'email', 'whatsapp'  
  message\_template VARCHAR(100),  
  sent\_at TIMESTAMPTZ,  
  opened\_at TIMESTAMPTZ  
);  
\`\`\`

\#\#\# Sequence Definition

\`\`\`javascript  
const CARE\_SEQUENCE \= \[  
  { day: 0, channel: 'whatsapp', template: 'delivery\_day' },  
  { day: 7, channel: 'email', template: 'first\_watering' },  
  { day: 14, channel: 'whatsapp', template: 'growth\_check' },  
  { day: 21, channel: 'email', template: 'fertilizer\_guide' },  
  { day: 28, channel: 'whatsapp', template: 'propagation\_tips' },  
  { day: 30, channel: 'email', template: 'warranty\_reminder' },  
  { day: 60, channel: 'whatsapp', template: 'soil\_refresh' }  
\];

// Trigger when order status becomes 'delivered'  
async function schedulePostPurchaseSequence(orderId) {  
  const order \= await db.orders.findById(orderId);  
  const items \= await db.order\_items.findByOrderId(orderId);  
    
  // Create user\_plants records  
  for (const item of items) {  
    await db.user\_plants.insert({  
      user\_id: order.user\_id,  
      product\_id: item.product\_id,  
      purchase\_date: new Date(),  
      next\_water\_date: calculateNextWaterDate(item.product\_id)  
    });  
  }  
    
  // Schedule care messages  
  for (const step of CARE\_SEQUENCE) {  
    const delayMs \= step.day \* 24 \* 60 \* 60 \* 1000;  
    await scheduleJob({  
      type: 'care\_message',  
      orderId,  
      userId: order.user\_id,  
      day: step.day,  
      channel: step.channel,  
      template: step.template,  
      scheduledAt: new Date(Date.now() \+ delayMs)  
    });  
  }  
}  
\`\`\`

\#\#\# Message Templates (Copy-Paste)

\*\*Day 0 (WhatsApp):\*\*  
\`\`\`  
🌱 Your \[Plant Name\] has arrived\!

📦 Unbox within 2 hours  
💧 Let plant rest for 24 hours before watering  
📸 Reply with a photo for a free health check

Need help? Reply here or call \+91-XXXXXXXXXX  
\`\`\`

\*\*Day 7 (Email):\*\*  
\`\`\`  
Subject: Time to water your \[Plant Name\] 🌿

Hi \[Name\],

Your \[Plant Name\] needs its first drink\!

💧 Watering guide: \[Link to video\]  
🌡️ Check soil: Insert finger 1 inch deep — if dry, water  
📏 Amount: 100-200ml depending on pot size

Watch the 30-second video: \[Link\]

Happy planting\!  
Karnataka Farms Team  
\`\`\`

\*\*Day 30 (Email):\*\*  
\`\`\`  
Subject: Your 30-day warranty ends in 3 days ⏰

Hi \[Name\],

Has your \[Plant Name\] been thriving? Or struggling?

📸 Upload a photo here: \[Link\]  
✅ If healthy → We'll extend your warranty by 30 days  
⚠️ If unhealthy → We'll send a replacement for FREE

No returns needed. Just a photo.

\[Upload Photo Button\]

This offer expires in 72 hours.

Warmly,  
Karnataka Farms  
\`\`\`

\---

\#\# MODULE 9: WARRANTY CLAIM SYSTEM

\#\#\# Purpose  
Handle replacement requests with photo verification. Build trust while preventing abuse.

\#\#\# Claim Form

\*\*URL:\*\* \`/warranty/claim\`

\*\*Form fields:\*\*  
\`\`\`javascript  
const claimSchema \= z.object({  
  orderNumber: z.string().regex(/^KF-\\d{4}-\\d+$/, "Enter valid order number"),  
  plantName: z.string().min(1, "Select a plant"),  
  issueType: z.enum(\['damaged\_on\_arrival', 'declined\_after\_days', 'pests', 'other'\]),  
  daysSinceDelivery: z.number().min(0).max(30),  
  photo1: z.instanceof(File).refine(f \=\> f.size \< 5 \* 1024 \* 1024),  
  photo2: z.instanceof(File).refine(f \=\> f.size \< 5 \* 1024 \* 1024),  
  description: z.string().max(500).optional()  
});  
\`\`\`

\#\#\# API Endpoint

\#\#\#\# POST \`/api/warranty\`

\`\`\`javascript  
async function submitWarrantyClaim(data) {  
  // 1\. Find order  
  const order \= await db.orders.findOne({  
    where: { order\_number: data.orderNumber }  
  });  
    
  if (\!order) {  
    return { error: "Order not found" };  
  }  
    
  // 2\. Check if within 30 days of delivery  
  const daysSinceDelivery \= Math.floor(  
    (new Date() \- new Date(order.delivered\_at)) / (1000 \* 60 \* 60 \* 24\)  
  );  
    
  if (daysSinceDelivery \> 30\) {  
    return { error: "Warranty expired after 30 days" };  
  }  
    
  // 3\. Check if already claimed  
  const existingClaim \= await db.warranty\_claims.findOne({  
    where: { order\_id: order.id, status: \['pending', 'approved'\] }  
  });  
    
  if (existingClaim) {  
    return { error: "A claim already exists for this order" };  
  }  
    
  // 4\. Upload photos to Supabase storage  
  const photoUrls \= await Promise.all(\[  
    uploadFile(data.photo1, \`claims/${order.id}/photo1.jpg\`),  
    uploadFile(data.photo2, \`claims/${order.id}/photo2.jpg\`)  
  \]);  
    
  // 5\. Create claim record  
  const claim \= await db.warranty\_claims.insert({  
    order\_id: order.id,  
    user\_id: order.user\_id,  
    product\_id: await getProductFromOrder(order.id, data.plantName),  
    photo\_urls: photoUrls,  
    issue\_type: data.issueType,  
    description: data.description,  
    status: 'pending'  
  });  
    
  // 6\. Notify admin  
  await sendAdminNotification(\`New warranty claim: ${claim.id}\`);  
    
  // 7\. Auto-approve simple cases (damaged on arrival)  
  if (data.issueType \=== 'damaged\_on\_arrival') {  
    await autoApproveClaim(claim.id);  
  }  
    
  return {  
    success: true,  
    claimId: claim.id,  
    status: 'pending',  
    message: "Claim submitted. We'll respond within 24 hours."  
  };  
}

// Admin approval action  
async function approveClaim(claimId, replacementCredit \= null) {  
  const claim \= await db.warranty\_claims.update(claimId, {  
    status: 'approved',  
    admin\_notes: 'Approved',  
    replacement\_credit: replacementCredit || calculateReplacementCredit(claim.order\_id)  
  });  
    
  // Issue store credit  
  await db.users.update(claim.user\_id, {  
    store\_credit: db.raw(\`store\_credit \+ ${claim.replacement\_credit}\`)  
  });  
    
  // Send customer notification  
  await sendClaimApproved(claim.user\_id, claim.replacement\_credit);  
    
  // Mark order as having claimed warranty  
  await db.orders.update(claim.order\_id, {  
    guarantee\_claimed: true  
  });  
    
  return { success: true };  
}  
\`\`\`

\#\#\# Claim Status Dashboard (Admin)

| Claim ID | Order | Customer | Issue | Photos | Status | Action |  
|----------|-------|----------|-------|--------|--------|--------|  
| CL-001 | KF-2026-00123 | Ramesh | Damaged on arrival | \[View\] | Pending | Approve / Reject |  
| CL-002 | KF-2026-00145 | Priya | Declined after 7 days | \[View\] | Approved | \- |

\---

\#\# MODULE 10: "MY GARDEN" DASHBOARD

\#\#\# Purpose  
Customer portal to track their plants, get care reminders, and upload growth photos.

\#\#\# Page Structure

\*\*URL:\*\* \`/my-garden\` (requires login)

\*\*Sections:\*\*

\`\`\`jsx  
\<MyGardenDashboard\>  
  {/\* My Plants Section \*/}  
  \<MyPlantsList\>  
    {plants.map(plant \=\> (  
      \<PlantCard\>  
        \<PlantImage src={plant.photo} /\>  
        \<PlantName\>{plant.nickname || plant.product\_name}\</PlantName\>  
        \<PurchaseDate\>Bought: {plant.purchase\_date}\</PurchaseDate\>  
        \<NextWatering class={plant.next\_water\_date \<= today ? 'bg-red-100' : ''}\>  
          Water on: {plant.next\_water\_date}  
        \</NextWatering\>  
        \<UploadButton onClick={() \=\> openUploadModal(plant)}\>  
          📸 Upload growth photo  
        \</UploadButton\>  
      \</PlantCard\>  
    ))}  
  \</MyPlantsList\>  
    
  {/\* Watering Schedule \*/}  
  \<WateringSchedule\>  
    \<h3\>Today's Tasks\</h3\>  
    {todayTasks.map(task \=\> (  
      \<TaskItem\>  
        💧 Water {task.plant\_name}  
        \<MarkDoneButton /\>  
      \</TaskItem\>  
    ))}  
  \</WateringSchedule\>  
    
  {/\* Loyalty Progress \*/}  
  \<LoyaltyCard\>  
    \<TierName\>{userTier.name}\</TierName\>  
    \<ProgressBar value={pointsToNextTier} max={nextTierThreshold} /\>  
    \<PointsBalance\>{userPoints} points\</PointsBalance\>  
    \<TierBenefits\>  
      {userTier.benefits.map(b \=\> \<BenefitItem\>{b}\</BenefitItem\>)}  
    \</TierBenefits\>  
  \</LoyaltyCard\>  
    
  {/\* Warranty Claims \*/}  
  \<ClaimsSection\>  
    {claims.map(claim \=\> (  
      \<ClaimCard status={claim.status}\>  
        Claim \#{claim.id} \- {claim.status}  
      \</ClaimCard\>  
    ))}  
  \</ClaimsSection\>  
\</MyGardenDashboard\>  
\`\`\`

\#\#\# API Endpoints

\#\#\#\# GET \`/api/garden/plants\`

\`\`\`javascript  
async function getUserPlants(userId) {  
  return await db.user\_plants.findAll({  
    where: { user\_id: userId },  
    include: \['product'\]  
  });  
}  
\`\`\`

\#\#\#\# POST \`/api/garden/photos\`

\`\`\`javascript  
async function uploadGrowthPhoto(userId, plantId, photoFile) {  
  const photoUrl \= await uploadToStorage(photoFile, \`user\_plants/${userId}/${plantId}\`);  
    
  await db.user\_plants.update(  
    { user\_id: userId, product\_id: plantId },  
    { photo\_url: photoUrl }  
  );  
    
  // Award points for photo upload  
  await awardPoints(userId, 50, 'Photo upload');  
    
  // Ask permission to use in marketing  
  return { success: true, photoUrl };  
}  
\`\`\`

\---

\#\# MODULE 11: ADMIN PANEL (SOLO FRIENDLY)

\#\#\# Purpose  
Manage orders, inventory, products, and claims from one simple dashboard.

\#\#\# Pages

\#\#\#\# \`/admin/orders\`  
\- List all orders with filters (status, date range)  
\- Update order status  
\- Print packing slip  
\- Mark COD as verified

\#\#\#\# \`/admin/inventory\`  
\- List products with stock levels  
\- Bulk update stock via CSV upload  
\- Set low stock alerts (email when \<5)

\#\#\#\# \`/admin/products\`  
\- Add/edit products  
\- Upload images  
\- Set attributes (light, water, pet safe, difficulty, hardiness zone)

\#\#\#\# \`/admin/claims\`  
\- View warranty claims with photos  
\- Approve/reject with one click  
\- Issue store credit

\#\#\#\# \`/admin/analytics\`  
\- Sales by day/week/month  
\- Top selling products  
\- Conversion rate  
\- Warranty claim rate

\#\#\# CSV Inventory Upload

\*\*Template:\*\*  
\`\`\`csv  
sku,stock\_quantity  
SNK-4,15  
SNK-6,8  
ZZ-6,12  
\`\`\`

\*\*Upload handler:\*\*  
\`\`\`javascript  
async function bulkUpdateInventory(csvFile) {  
  const rows \= await parseCSV(csvFile);  
    
  for (const row of rows) {  
    await db.product\_sizes.update(  
      { sku: row.sku },  
      { stock\_quantity: row.stock\_quantity }  
    );  
  }  
    
  return { success: true, updated: rows.length };  
}  
\`\`\`

\---

\#\# DEPLOYMENT CHECKLIST

\#\#\# Before Launch  
\- \[ \] Supabase database created with all tables  
\- \[ \] 20+ products added with complete attributes  
\- \[ \] 100+ ZIP codes in zip\_zones table  
\- \[ \] Razorpay test mode working  
\- \[ \] Shiprocket account connected  
\- \[ \] Resend email verified  
\- \[ \] Google Maps API key restricted to domain  
\- \[ \] Vercel project connected to GitHub  
\- \[ \] Environment variables set  
\- \[ \] SSL enabled (automatic with Vercel)  
\- \[ \] Test order completed end-to-end

\#\#\# Launch Day  
\- \[ \] Razorpay live mode activated  
\- \[ \] Shiprocket live mode  
\- \[ \] Google Analytics installed  
\- \[ \] WhatsApp number verified  
\- \[ \] 30-day guarantee text on all product pages  
\- \[ \] ZIP code gate working  
\- \[ \] Guest checkout functional  
\- \[ \] Mobile responsive on iPhone and Android

\---

\#\# READY-TO-USE DELIVERABLES (Tell me which one)

1\. \*\*Complete Next.js project structure\*\* (folder by folder)  
2\. \*\*Supabase SQL schema\*\* (copy-paste ready)  
3\. \*\*ZIP code gate component\*\* (full React code)  
4\. \*\*6-question quiz component\*\* (with email capture)  
5\. \*\*One-page checkout\*\* (Razorpay integration)  
6\. \*\*Product detail page\*\* (care snapshot \+ size selector)  
7\. \*\*Cart with abandonment tracking\*\*  
8\. \*\*Post-purchase email templates\*\* (Resend format)  
9\. \*\*Admin panel pages\*\* (orders, inventory, claims)  
10\. \*\*"My Garden" dashboard\*\* (full React component)

\*\*Just reply with the module number (1-11) or deliverable number (1-10) you want first.\*\*  
