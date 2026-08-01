// =========================================================
// BANDHAN PARTY PLOT — Data Layer
// -----------------------------------------------------------
// Every read/write to booking & enquiry data goes through the
// functions in this file. Right now they read/write the
// browser's localStorage. If you later connect a real backend
// (Google Sheets / Firebase / your own API), you only need to
// rewrite the functions in THIS file — booking.js and main.js
// never touch localStorage directly, so nothing else changes.
// =========================================================

const BOOKINGS_KEY = 'bandhan_bookings_v2';
const ENQUIRIES_KEY = 'bandhan_enquiries_v1';

const SLOT_LABELS = {
  morning: { name: 'Morning', hint: '8:00 AM – 2:00 PM' },
  evening: { name: 'Evening', hint: '5:00 PM – 11:00 PM' },
  fullday: { name: 'Full Day', hint: '8:00 AM – 11:00 PM' }
};
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function genId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
function nowISO() { return new Date().toISOString(); }

function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Could not read', key, e);
    return [];
  }
}
function writeStore(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

/* ---------------- Bookings ---------------- */
// Booking shape:
// { id, date:'YYYY-MM-DD', slot:'morning|evening|fullday', name, phone,
//   eventType, message, status:'pending|confirmed|cancelled',
//   source:'online|offline', createdAt, updatedAt }

function getBookings() {
  return readStore(BOOKINGS_KEY);
}
function saveBookings(arr) {
  writeStore(BOOKINGS_KEY, arr);
}
function addBooking(data) {
  const bookings = getBookings();
  const record = {
    id: genId(),
    date: data.date,
    slot: data.slot,
    name: data.name || '',
    phone: data.phone || '',
    eventType: data.eventType || 'Other',
    message: data.message || '',
    status: data.status || 'pending',
    source: data.source || 'online',
    createdAt: nowISO(),
    updatedAt: nowISO()
  };
  bookings.push(record);
  saveBookings(bookings);
  return record;
}
function updateBooking(id, patch) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  bookings[idx] = { ...bookings[idx], ...patch, updatedAt: nowISO() };
  saveBookings(bookings);
  return bookings[idx];
}
function deleteBooking(id) {
  const bookings = getBookings().filter(b => b.id !== id);
  saveBookings(bookings);
}
// Effective status of one date+slot, ignoring cancelled bookings.
function slotStatus(date, slot) {
  const relevant = getBookings().filter(b => b.date === date && b.slot === slot && b.status !== 'cancelled');
  if (relevant.some(b => b.status === 'confirmed')) return 'booked';
  if (relevant.some(b => b.status === 'pending')) return 'pending';
  return 'available';
}
function daySlots(date) {
  return {
    morning: slotStatus(date, 'morning'),
    evening: slotStatus(date, 'evening'),
    fullday: slotStatus(date, 'fullday')
  };
}
function dayStatus(date) {
  const s = daySlots(date);
  const vals = Object.values(s);
  if (vals.every(v => v === 'booked')) return 'booked';
  if (vals.some(v => v === 'booked' || v === 'pending')) return 'partial';
  return 'available';
}

/* ---------------- Enquiries ---------------- */
// Enquiry shape:
// { id, name, phone, eventType, eventDate, message, source:'homepage|booking',
//   status:'new|contacted|closed', createdAt }

function getEnquiries() {
  return readStore(ENQUIRIES_KEY);
}
function saveEnquiries(arr) {
  writeStore(ENQUIRIES_KEY, arr);
}
function addEnquiry(data) {
  const enquiries = getEnquiries();
  const record = {
    id: genId(),
    name: data.name || '',
    phone: data.phone || '',
    eventType: data.eventType || 'Other',
    eventDate: data.eventDate || '',
    message: data.message || '',
    source: data.source || 'homepage',
    status: 'new',
    createdAt: nowISO()
  };
  enquiries.unshift(record);
  saveEnquiries(enquiries);
  return record;
}
function updateEnquiry(id, patch) {
  const enquiries = getEnquiries();
  const idx = enquiries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  enquiries[idx] = { ...enquiries[idx], ...patch };
  saveEnquiries(enquiries);
  return enquiries[idx];
}
function deleteEnquiry(id) {
  saveEnquiries(getEnquiries().filter(e => e.id !== id));
}
