# Bandhan Party Plot — Website

Real business details only (no invented stats, testimonials, or stock "venue" photos).

## Files

```
bandhan-party-plot/
├── index.html          Home page
├── booking.html         Booking calendar (availability + request + staff admin)
├── css/style.css        All styling
├── js/main.js           Shared header/nav/scroll behaviour + homepage enquiry form
├── js/booking.js        Calendar engine + admin panel
└── assets/images/       Empty folder — drop your real venue photos here
```

## How to test in VS Code

1. Open this folder in VS Code.
2. Install the **Live Server** extension (if you don't have it).
3. Right-click `index.html` → **Open with Live Server**.
4. The site opens in your browser at `http://127.0.0.1:5500` (or similar) and reloads automatically as you edit.

No build step, no npm install — it's plain HTML/CSS/JS.

## Adding your real photos

Every image slot on the site is currently a labelled placeholder (dashed border + camera icon), *not* a stock photo — nothing on the live site claims to be a picture of your venue until you add one.

To add a photo:
1. Put the image file in `assets/images/` (e.g. `assets/images/lawn.jpg`).
2. In `index.html`, find the matching `<div class="photo-slot">` and replace it with:
   ```html
   <img src="assets/images/lawn.jpg" alt="Bandhan Party Plot lawn area">
   ```

## How the booking system works

The calendar on `booking.html` shows, per date, whether **Morning**, **Evening**, and **Full Day** slots are Available or Booked. A day is:
- 🟢 **Available** — no slots booked
- 🟠 **Partially Booked** — some slots booked
- 🔴 **Fully Booked** — all three slots booked

Customers click a date to see slot detail, then "Request This Date" opens a short form. Submitting it opens WhatsApp with a pre-filled message (name, phone, event type, date) sent to **07016669124** — you confirm the booking yourself on WhatsApp/call, same as before, just with far less back-and-forth.

### Staff admin panel
On `booking.html`, scroll down and click **Staff Login** (bottom-left corner). Default passcode:

```
bandhan123
```

**Change this passcode** in `js/booking.js` (the `ADMIN_PASSCODE` constant) before sharing the site publicly. From the unlocked panel you can mark any date + slot as Booked or Available, and clear bookings.

### ⚠️ Important limitation — read this

This booking system currently stores all data in your **browser's local storage only**. That means:
- Bookings you mark as staff on your laptop **will not show up** on a customer's phone, or even on your own phone.
- Clearing browser data/cache will erase the booking records.
- It's genuinely useful for **testing the design and flow**, and works fine as a single-device tool (e.g. the venue owner's own laptop used to quote availability on a call), but it is **not yet a shared, multi-device booking system**.

**To make availability sync across every visitor's device**, the front-end here needs to be connected to a real backend that all browsers read from. Reasonable options, roughly in order of effort:
1. **Google Sheets as a database** (via a free API like SheetDB or Apps Script) — quick to set up, good if you're comfortable editing a spreadsheet.
2. **Firebase Realtime Database / Firestore** — free tier, built for exactly this kind of shared live data, moderate setup.
3. **A small Node.js + Express + database (e.g. SQLite/Postgres) backend** — full control, more setup work, best long-term.

I can build any of these next — just let me know which you'd prefer and whether you have hosting in mind (e.g. a domain, or should I suggest free options like Netlify/Vercel + Firebase).

## SEO

`index.html` includes meta title/description/keywords targeting "Party Plot in Kalol", "Wedding Venue Kalol", "Marriage Hall Kalol", "Event Place in Kalol Gujarat", and "Birthday Party Venue Kalol", plus JSON-LD structured data with your real address, phone, and Instagram — all pulled directly from the details you gave me, nothing fabricated.
