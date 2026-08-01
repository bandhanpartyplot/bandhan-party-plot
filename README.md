# Bandhan Party Plot — Website

Real business details only (no invented stats, testimonials, or stock "venue" photos).

## Files

```
bandhan-party-plot/
├── index.html          Home page
├── booking.html          Booking calendar + staff admin dashboard
├── css/style.css         All styling
├── js/data.js            Data layer — every booking/enquiry read & write goes through here
├── js/main.js            Shared header/nav/scroll + homepage enquiry form
├── js/booking.js         Calendar, request flow, and admin dashboard UI
└── assets/images/        Empty folder — drop your real venue photos here
```

## How to test in VS Code

1. Open this folder in VS Code.
2. Install the **Live Server** extension (if you don't have it).
3. Right-click `index.html` → **Open with Live Server**.
4. The site opens in your browser and reloads automatically as you edit.

No build step, no npm install — it's plain HTML/CSS/JS.

## Adding your real photos

Every image slot is a labelled placeholder (dashed border + camera icon), not a stock photo. To add a real one, drop the file in `assets/images/` and in `index.html` replace the matching `<div class="photo-slot">…</div>` with:
```html
<img src="assets/images/lawn.jpg" alt="Bandhan Party Plot lawn area">
```

## How the booking system works now

### For customers (`booking.html`)
A month calendar shows each day as:
- 🟢 **Available** — Morning, Evening and Full Day are all open
- 🟠 **Partially booked** — some slots are booked or awaiting confirmation
- 🔴 **Fully booked** — every slot is taken

Clicking a date shows live status per slot (Available / Pending / Booked). "Request This Date" opens a form for the still-available slots; submitting it **saves the request** (status `pending`) and opens WhatsApp with the details pre-filled, sent to 07016669124.

### For you (staff admin dashboard)
Click **Staff Login** (bottom-left of `booking.html`). Default passcode:
```
bandhan123
```
**Change this** in `js/booking.js` (`ADMIN_PASSCODE`) before sharing the site publicly.

From the dashboard you can now:
- **Confirm** or **Decline** any pending request from a customer
- **Cancel** a confirmed booking (kept on record, not deleted) or **Restore** a cancelled one
- **Edit** any booking — change the date, slot, customer details, or status
- **Add a New Offline Booking** — for phone calls or walk-ins, filled in by you, saved directly as confirmed (or pending, your choice)
- **Delete** a record permanently
- See every **homepage enquiry form** submission in its own tab, in the order received, and **Convert** any enquiry straight into a booking with one click (pre-fills the booking form from the enquiry)
- Filter bookings by status (All / Pending / Confirmed / Cancelled)

This is exactly the "confirm, cancel, edit, book on behalf of an offline customer" workflow you asked for.

### Enquiry form → live into the dashboard
Every submission of the homepage enquiry form (`index.html`) is saved immediately as a record in the admin dashboard's **Enquiries** tab — *in addition to* opening WhatsApp — so nothing gets lost even if you're busy and don't reply on WhatsApp right away. You can mark it Contacted, Close it, or Convert it to a real booking.

### What "live" means right now, honestly
All of this data is stored in your **browser's localStorage**. Concretely:
- **Within the same browser, in multiple tabs** (e.g. you have the admin dashboard open in one tab and preview the customer calendar in another) — changes appear in the other tab automatically within a second or two. This is real, native browser behaviour, not a trick.
- **Across different devices or browsers** (your phone vs. a customer's phone, or Chrome vs. Firefox) — data does **not** sync. Each browser has its own separate copy.
- Clearing browser data/cache erases the records.

So today it's genuinely useful as a **single-device tool** — e.g. you run the venue from one laptop/tablet and use it to track every enquiry and booking in one place — but it is **not yet** a system where a customer's phone and your phone see the same live availability.

### Making it truly live across every device
`js/data.js` is written so this is a small, contained change — booking.js and main.js never touch localStorage directly, they only call functions like `addBooking()`, `getBookings()`, `updateBooking()`. To go fully live, only `js/data.js` needs to change its storage functions to talk to a shared backend instead of localStorage. In order of effort:

1. **Google Sheets as a database** (via SheetDB or Google Apps Script) — quickest, good if you're comfortable in a spreadsheet, free.
2. **Firebase Firestore** — free tier, purpose-built for exactly this (real-time sync across every device out of the box via `onSnapshot`), maybe an hour of setup.
3. **A small Node.js/Express + database backend** — full control, more work, best long-term if you want your own server.

I'd recommend #2 (Firebase) as the sweet spot — no server to maintain, genuinely real-time, and free at this scale. Say the word and I'll wire it in.

## SEO

`index.html` includes meta title/description/keywords targeting "Party Plot in Kalol", "Wedding Venue Kalol", "Marriage Hall Kalol", "Event Place in Kalol Gujarat", and "Birthday Party Venue Kalol", plus JSON-LD structured data with your real address, phone, and Instagram — all pulled directly from the details you gave me.
