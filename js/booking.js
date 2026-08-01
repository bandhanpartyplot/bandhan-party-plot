// =========================================================
// BANDHAN PARTY PLOT — Booking Calendar + Admin Dashboard
// -----------------------------------------------------------
// All reads/writes go through js/data.js (getBookings, addBooking,
// updateBooking, deleteBooking, dayStatus, daySlots, getEnquiries,
// addEnquiry, updateEnquiry, deleteEnquiry — all defined there).
// This file only renders the UI and wires up interactions.
// =========================================================

const ADMIN_PASSCODE = 'bandhan321'; // change before going live

let viewYear, viewMonth;        // calendar month currently shown (0-indexed month)
let selectedDate = null;        // 'YYYY-MM-DD' selected by the customer
let pendingRequest = null;      // { date } while the request modal is open
let editingBookingId = null;    // set when the admin modal is in "edit" mode
let bookingFilterStatus = 'all';
let activeAdminTab = 'bookings';

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function isPast(y, m, d) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(y, m, d) < today;
}
function friendlyDate(dateStr, opts) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN',
    opts || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function esc(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ---------- Calendar ----------
function renderCalendar() {
  const title = document.getElementById('calTitle');
  const daysWrap = document.getElementById('calDays');
  if (!title || !daysWrap) return;

  title.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  daysWrap.innerHTML = '';

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell empty';
    daysWrap.appendChild(empty);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = toDateStr(viewYear, viewMonth, d);
    const past = isPast(viewYear, viewMonth, d);
    const status = dayStatus(dateStr);
    const cell = document.createElement('div');
    cell.className = 'day-cell ' + (past ? 'past' : status);
    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === selectedDate) cell.classList.add('selected');
    cell.innerHTML = `<span class="dnum">${d}</span><span class="dstatus"></span>`;
    if (!past) {
      cell.addEventListener('click', () => {
        selectedDate = dateStr;
        renderCalendar();
        renderSlotPanel(dateStr);
      });
    }
    daysWrap.appendChild(cell);
  }
}

// ---------- Customer slot panel ----------
function renderSlotPanel(dateStr) {
  const label = document.getElementById('selDateLabel');
  const list = document.getElementById('slotList');
  const hint = document.getElementById('slotHint');
  const requestBtn = document.getElementById('requestBtn');
  if (!label || !list) return;

  label.textContent = friendlyDate(dateStr);
  hint.style.display = 'none';
  list.innerHTML = '';

  const slots = daySlots(dateStr);
  let anyAvailable = false;

  Object.keys(SLOT_LABELS).forEach(key => {
    const st = slots[key]; // 'available' | 'pending' | 'booked'
    if (st === 'available') anyAvailable = true;
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="s-name">${SLOT_LABELS[key].name}<small>${SLOT_LABELS[key].hint}</small></span>
      <span class="tag ${st}">${st}</span>
    `;
    list.appendChild(li);
  });

  requestBtn.disabled = !anyAvailable;
  requestBtn.textContent = anyAvailable ? 'Request This Date' : 'Fully Booked';
  requestBtn.onclick = () => { if (anyAvailable) openRequestModal(dateStr); };
}

// ---------- Customer request modal ----------
function openRequestModal(dateStr) {
  pendingRequest = { date: dateStr };
  const modal = document.getElementById('requestModal');
  document.getElementById('modalDateLine').textContent =
    `For ${friendlyDate(dateStr)}. Send your details and we'll confirm on WhatsApp.`;

  const slots = daySlots(dateStr);
  const slotSelect = document.getElementById('rSlot');
  slotSelect.innerHTML = Object.keys(SLOT_LABELS)
    .filter(key => slots[key] === 'available')
    .map(key => `<option value="${key}">${SLOT_LABELS[key].name} (${SLOT_LABELS[key].hint})</option>`)
    .join('');

  modal.classList.add('show');
}
function closeRequestModal() {
  document.getElementById('requestModal').classList.remove('show');
  document.getElementById('requestForm').reset();
  pendingRequest = null;
}

// ---------- Admin: bookings table ----------
function statusActions(b) {
  if (b.status === 'pending') {
    return `
      <button class="confirm" data-act="confirm" data-id="${b.id}">Confirm</button>
      <button class="decline" data-act="decline" data-id="${b.id}">Decline</button>
      <button class="edit" data-act="edit" data-id="${b.id}">Edit</button>
      <button class="delete" data-act="delete" data-id="${b.id}">Delete</button>`;
  }
  if (b.status === 'confirmed') {
    return `
      <button class="cancel" data-act="cancel" data-id="${b.id}">Cancel</button>
      <button class="edit" data-act="edit" data-id="${b.id}">Edit</button>
      <button class="delete" data-act="delete" data-id="${b.id}">Delete</button>`;
  }
  return `
    <button class="confirm" data-act="restore" data-id="${b.id}">Restore</button>
    <button class="delete" data-act="delete" data-id="${b.id}">Delete</button>`;
}

function renderBookingTable() {
  const wrap = document.getElementById('bookingTable');
  if (!wrap) return;
  let bookings = getBookings().slice().sort((a, b) => a.date.localeCompare(b.date));
  if (bookingFilterStatus !== 'all') bookings = bookings.filter(b => b.status === bookingFilterStatus);

  document.getElementById('countBookings').textContent = getBookings().filter(b => b.status === 'pending').length;

  if (!bookings.length) {
    wrap.innerHTML = `<div class="admin-empty">No ${bookingFilterStatus === 'all' ? '' : bookingFilterStatus + ' '}bookings yet.</div>`;
    return;
  }

  wrap.innerHTML = bookings.map(b => `
    <div class="booking-card">
      <div class="bk-info">
        <span class="bk-date">${friendlyDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${SLOT_LABELS[b.slot] ? SLOT_LABELS[b.slot].name : b.slot}</span>
        <span class="bk-meta"><b>${esc(b.name)}</b> · ${esc(b.phone)} · ${esc(b.eventType)}</span>
        ${b.message ? `<span class="bk-meta">${esc(b.message)}</span>` : ''}
        <span class="bk-meta">Source: ${b.source} <span class="tag ${b.status}" style="margin-left:6px;">${b.status}</span></span>
      </div>
      <div class="bk-actions">${statusActions(b)}</div>
    </div>
  `).join('');

  wrap.querySelectorAll('button[data-act]').forEach(btn => {
    btn.addEventListener('click', () => handleBookingAction(btn.dataset.act, btn.dataset.id));
  });
}

function handleBookingAction(action, id) {
  if (action === 'confirm' || action === 'restore') updateBooking(id, { status: action === 'restore' ? 'pending' : 'confirmed' });
  else if (action === 'decline' || action === 'cancel') updateBooking(id, { status: 'cancelled' });
  else if (action === 'delete') { if (confirm('Delete this booking permanently?')) deleteBooking(id); }
  else if (action === 'edit') openAdminModal(getBookings().find(b => b.id === id));
  refreshAll();
}

// ---------- Admin: enquiries table ----------
const ENQUIRY_TAG_CLASS = { new: 'pending', contacted: 'confirmed', closed: 'cancelled' };

function renderEnquiryTable() {
  const wrap = document.getElementById('enquiryTable');
  if (!wrap) return;
  const enquiries = getEnquiries();
  document.getElementById('countEnquiries').textContent = enquiries.filter(e => e.status === 'new').length;

  if (!enquiries.length) {
    wrap.innerHTML = `<div class="admin-empty">No enquiries yet — homepage form submissions will appear here automatically.</div>`;
    return;
  }

  wrap.innerHTML = enquiries.map(e => `
    <div class="booking-card">
      <div class="bk-info">
        <span class="bk-date">${new Date(e.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}${e.eventDate ? ' · Event: ' + friendlyDate(e.eventDate, { day:'numeric', month:'short', year:'numeric' }) : ''}</span>
        <span class="bk-meta"><b>${esc(e.name)}</b> · ${esc(e.phone)} · ${esc(e.eventType)}</span>
        ${e.message ? `<span class="bk-meta">${esc(e.message)}</span>` : ''}
        <span class="bk-meta">Via ${e.source} <span class="tag ${ENQUIRY_TAG_CLASS[e.status] || 'pending'}" style="margin-left:6px;">${e.status}</span></span>
      </div>
      <div class="bk-actions">
        <button class="confirm" data-eact="convert" data-id="${e.id}">Convert to Booking</button>
        ${e.status !== 'contacted' ? `<button class="edit" data-eact="contacted" data-id="${e.id}">Mark Contacted</button>` : ''}
        ${e.status !== 'closed' ? `<button class="cancel" data-eact="closed" data-id="${e.id}">Close</button>` : ''}
        <button class="delete" data-eact="delete" data-id="${e.id}">Delete</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('button[data-eact]').forEach(btn => {
    btn.addEventListener('click', () => handleEnquiryAction(btn.dataset.eact, btn.dataset.id));
  });
}

function handleEnquiryAction(action, id) {
  const enquiry = getEnquiries().find(e => e.id === id);
  if (action === 'contacted') updateEnquiry(id, { status: 'contacted' });
  else if (action === 'closed') updateEnquiry(id, { status: 'closed' });
  else if (action === 'delete') { if (confirm('Delete this enquiry?')) deleteEnquiry(id); }
  else if (action === 'convert') {
    openAdminModal(null, {
      date: enquiry.eventDate || '', slot: 'fullday', name: enquiry.name, phone: enquiry.phone,
      eventType: enquiry.eventType, message: enquiry.message, status: 'confirmed'
    });
    updateEnquiry(id, { status: 'contacted' });
  }
  refreshAll();
}

// ---------- Admin: add/edit booking modal ----------
function openAdminModal(existingBooking, prefill) {
  const modal = document.getElementById('adminBookingModal');
  const form = document.getElementById('adminBookingForm');
  form.reset();
  editingBookingId = existingBooking ? existingBooking.id : null;
  document.getElementById('adminModalTitle').textContent = existingBooking ? 'Edit Booking' : 'New Offline Booking';
  document.getElementById('abId').value = editingBookingId || '';

  const data = existingBooking || prefill || {};
  document.getElementById('abDate').value = data.date || '';
  document.getElementById('abSlot').value = data.slot || 'fullday';
  document.getElementById('abName').value = data.name || '';
  document.getElementById('abPhone').value = data.phone || '';
  document.getElementById('abType').value = data.eventType || 'Wedding';
  document.getElementById('abStatus').value = data.status || 'confirmed';
  document.getElementById('abMsg').value = data.message || '';

  modal.classList.add('show');
}
function closeAdminModal() {
  document.getElementById('adminBookingModal').classList.remove('show');
  editingBookingId = null;
}

// ---------- Refresh everything on screen ----------
function refreshAll() {
  renderCalendar();
  if (selectedDate) renderSlotPanel(selectedDate);
  const adminUnlocked = document.getElementById('adminUnlocked');
  if (adminUnlocked && adminUnlocked.style.display !== 'none') {
    renderBookingTable();
    renderEnquiryTable();
  }
}

// ---------- Wire everything up ----------
document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  viewYear = now.getFullYear();
  viewMonth = now.getMonth();
  renderCalendar();

  document.getElementById('prevMonth').addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  // customer request modal
  document.getElementById('modalClose').addEventListener('click', closeRequestModal);
  document.getElementById('requestModal').addEventListener('click', (e) => { if (e.target.id === 'requestModal') closeRequestModal(); });

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingRequest) return;
    const slot = document.getElementById('rSlot').value;
    const name = document.getElementById('rName').value.trim();
    const phone = document.getElementById('rPhone').value.trim();
    const type = document.getElementById('rType').value;
    const msg = document.getElementById('rMsg').value.trim();

    addBooking({ date: pendingRequest.date, slot, name, phone, eventType: type, message: msg, status: 'pending', source: 'online' });

    const friendly = friendlyDate(pendingRequest.date, { day: 'numeric', month: 'long', year: 'numeric' });
    let text = `Hi, I'd like to request a booking at Bandhan Party Plot.%0ADate: ${encodeURIComponent(friendly)}%0ASlot: ${encodeURIComponent(SLOT_LABELS[slot].name)}%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AEvent Type: ${encodeURIComponent(type)}`;
    if (msg) text += `%0AMessage: ${encodeURIComponent(msg)}`;
    window.open(`https://wa.me/917016669124?text=${text}`, '_blank');

    closeRequestModal();
    refreshAll();
  });

  // staff login
  const adminToggle = document.getElementById('adminToggle');
  const adminPanel = document.getElementById('adminPanel');
  adminToggle.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
    if (!adminPanel.classList.contains('hidden')) adminPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.getElementById('adminUnlock').addEventListener('click', () => {
    if (document.getElementById('adminPass').value === ADMIN_PASSCODE) {
      document.getElementById('adminLocked').style.display = 'none';
      document.getElementById('adminUnlocked').style.display = 'block';
      renderBookingTable();
      renderEnquiryTable();
    } else {
      alert('Incorrect passcode.');
    }
  });

  // admin tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeAdminTab = tab.dataset.tab;
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.getElementById('tab-bookings').classList.toggle('hidden', activeAdminTab !== 'bookings');
      document.getElementById('tab-enquiries').classList.toggle('hidden', activeAdminTab !== 'enquiries');
    });
  });

  // booking status filter chips
  document.querySelectorAll('#bookingFilter .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      bookingFilterStatus = chip.dataset.status;
      document.querySelectorAll('#bookingFilter .filter-chip').forEach(c => c.classList.toggle('active', c === chip));
      renderBookingTable();
    });
  });

  // new offline booking / edit modal
  document.getElementById('newOfflineBtn').addEventListener('click', () => openAdminModal(null));
  document.getElementById('adminModalClose').addEventListener('click', closeAdminModal);
  document.getElementById('adminBookingModal').addEventListener('click', (e) => { if (e.target.id === 'adminBookingModal') closeAdminModal(); });

  document.getElementById('adminBookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      date: document.getElementById('abDate').value,
      slot: document.getElementById('abSlot').value,
      name: document.getElementById('abName').value.trim(),
      phone: document.getElementById('abPhone').value.trim(),
      eventType: document.getElementById('abType').value,
      status: document.getElementById('abStatus').value,
      message: document.getElementById('abMsg').value.trim()
    };
    if (editingBookingId) updateBooking(editingBookingId, payload);
    else addBooking({ ...payload, source: 'offline' });
    closeAdminModal();
    refreshAll();
  });

  // live-ish sync: pick up changes made in OTHER tabs of this same browser
  window.addEventListener('storage', (e) => {
    if (e.key === BOOKINGS_KEY || e.key === ENQUIRIES_KEY) refreshAll();
  });
});
