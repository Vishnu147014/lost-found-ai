# ReuniteAI — AI-Powered Lost, Found & Courier Delivery Ecosystem

An intelligent, full-stack Lost & Found recovery platform featuring **Multi-Modal AI Matching**, an **interactive geospatial radar**, a **delivery partner logistics marketplace**, and an **incentive reward system** where finding and returning items unlocks **30% off shipping charges** on future lost items.

---

## 🌟 Key Features & The 3 Interfaces

### 1. 🔍 Interface 1: "I Lost Something" (Owner Portal)
- **User Registration & Contact**: Name, email, phone, and return delivery address.
- **Lost Item Specifications**: Category selection (Smartphones, Earbuds, Laptops, Wallets, Keys, Smartwatches, Jewelry, Documents), brand, model, color, and comprehensive condition description.
- **Accurate Location & Pinpoint**: Address search, preset hotspots, GPS location detection, and coordinate refinement on an interactive coordinate grid.
- **Photo Upload**: Drag-and-drop / file upload with sample test presets (iPhone 15 Pro, AirPods Pro 2, Fossil Leather Wallet, MacBook Air).
- **Encrypted Secret Clue**: Secret verification hint (e.g. lock screen wallpaper name, serial number snippet, inner card name) ensuring only the rightful owner can claim it.
- **Live Status Pipeline**: Visual tracker from `1. Reported` → `2. AI Matched` → `3. Courier Assigned` → `4. In Transit` → `5. Reunited`.

### 2. 🎁 Interface 2: "I Found Something" (Good Samaritan Finder Portal)
- **Finder Registration**: Contact and safe custody registration.
- **Found Item Photo & Auto-Tagging**: Instant visual contour extraction and category suggestion.
- **Accurate Location Where Discovered**: Pinpoint GPS location where the item was found.
- **30% Shipping Discount Reward System**:
  - Whenever a finder's reported item is successfully reunited with its owner, the finder receives a **Good Samaritan 30% Discount Voucher**.
  - If the finder ever loses an item in the future, their courier shipping charges are automatically reduced by **30%**!
  - Good Samaritan profile badge and voucher balance tracker.

### 3. 🛵 Interface 3: Delivery Partner Logistics Portal
- **Courier Registration & Onboarding**: Vehicle choice (Bicycle, Motorcycle, Car, Van), service zone, and driver profile.
- **Distance-Based Payout Engine**:
  - Automatic calculation of the route distance in km using the **Haversine formula**.
  - **Courier Payout Formula**: Base Payout ($6.00) + Distance Rate ($1.25 / km) + High-Value Electronic Handling Bonus ($4.00 for phones/laptops).
  - **Website Maintenance Commission**: 20-22% platform fee for server infrastructure, AI inference, and escrow guarantee.
- **Dual-OTP Security Protocol**:
  - **Step 1 (Pickup from Finder)**: Courier asks Finder for their 4-digit pickup OTP to confirm physical item custody.
  - **Step 2 (Dropoff to Owner)**: Courier asks Owner for their 4-digit delivery OTP at the doorstep.
  - **Instant Payout**: Courier's wallet balance is automatically credited upon final OTP delivery.

### 4. 🧠 Interface 4: AI Multi-Modal Match Hub
- Compares lost and found reports using:
  1. **Visual specifications score** (contours, color, brand, model).
  2. **Semantic keyword similarity** (descriptions, tags, accessories).
  3. **Geospatial & temporal proximity** (distance in km between loss point and discovery spot).
- Generates a composite **AI Confidence Score (0-100%)** with diagnostic human-readable rationale.
- Side-by-side visual comparison with security verification clue check.
- Integrated checkout drawer displaying distance, courier earnings, platform fee, and 30% discount token toggle.

### 5. 🗺️ Live Geospatial Radar Map
- Visual map canvas showing lost item markers (Red), found item markers (Green), and active couriers in transit (Cyan).
- Dynamic distance connector lines between pickup and delivery destinations.

---

## 🗄️ Supabase Backend & Database Setup

The application features a **dual-mode persistence architecture**:
- **Out of the box**: Runs immediately with local storage synchronization and rich realistic pre-seeded items.
- **Cloud Mode**: Connects to your Supabase PostgreSQL database whenever credentials are provided.

### Setting up Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to your **SQL Editor** in the Supabase Dashboard and run the provided SQL script:
   - File: `supabase-schema.sql` (located in the project root)
3. Copy your **Project URL** and **Anon Key** from `Settings` -> `API`.
4. Click the **Supabase** badge in the top navigation bar of the website to paste your keys, or create a `.env` file based on `.env.example`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🚀 Running the Project

### Development Server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build:
```bash
npm run build
```
