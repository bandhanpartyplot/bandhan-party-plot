// =========================================================
// BANDHAN PARTY PLOT — Booking Calendar
// -----------------------------------------------------------
// Front-end only demo: booking data is saved in this browser's
// localStorage. There is no shared server, so changes made by
// staff on one device/browser will NOT appear on a customer's
// device. This is intentional for a zero-backend static site.
// See README.md for how to wire this up to a real backend
// (Google Sheets, Firebase, or a small Node/Express API) so
// availability is shared across everyone automatically.
// =========================================================

const STORAGE_KEY = 'bandhan_booking_data_v1';
const ADMIN_PASSCODE = 'bandhan123'; // change before going live
const SLOT_LABELS = {
  morning: { name: 'Morning', hint: '8:00 AM – 2:00 PM' },
  evening: { name: 'Evening', hint: '5:00 PM – 11:00 PM' },
  fullday: { name: 'Full Day', hint: '8:00 AM – 11:00 PM' }
};
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let bookingData = loadData();
let viewYear, viewMonth; // 0-indexed month
let selectedDate = null; // 'YYYY-MM-DD'
let pendingRequest = null; // { date, slot }

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Could not read booking data, starting fresh.', e);
    return {};
  }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData));
}
function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function getSlots(dateStr) {
  const entry = bookingData[dateStr] || {};
  return {
    morning: entry.morning === 'booked' ? 'booked' : 'available',
    evening: entry.evening === 'booked' ? 'booked' : 'available',
    fullday: entry.fullday === 'booked' ? 'booked' : 'available',
    note: entry.note || ''
  };
}
function dayStatus(dateStr) {
  const s = getSlots(dateStr);
  const bookedCount = ['morning', 'evening', 'fullday'].filter(k => s[k] === 'booked').length;
  if (bookedCount === 3) return 'booked';
  if (bookedCount > 0) return 'partial';
  return 'available';
}
function isPast(y, m, d) {
  const today = new Date(); today.setHours(0,0,0,0);
  const cellDate = new Date(y, m, d);
  return cellDate < today;
}

// ---------- Calendar rendering ----------
function renderCalendar() {
  const title = document.getElementById('calTitle');
  const daysWrap = document.getElementById('calDays');
  if (!title || !daysWrap) return;

  title.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  daysWrap.innerHTML = '';

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell empty';
    daysWrap.appendChild(empty);
  }

  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = toDateStr(viewYear, viewMonth, d);
    const cell = document.createElement('div');
    const past = isPast(viewYear, viewMonth, d);
    const status = dayStatus(dateStr);

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

// ---------- Slot panel ----------
function renderSlotPanel(dateStr) {
  const label = document.getElementById('selDateLabel');
  const list = document.getElementById('slotList');
  const hint = document.getElementById('slotHint');
  const requestBtn = document.getElementById('requestBtn');
  if (!label || !list) return;

  const dateObj = new Date(dateStr + 'T00:00:00');
  const friendly = dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  label.textContent = friendly;
  hint.style.display = 'none';
  list.innerHTML = '';

  const slots = getSlots(dateStr);
  let anyAvailable = false;

  Object.keys(SLOT_LABELS).forEach(key => {
    const st = slots[key];
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
  requestBtn.onclick = () => {
    if (!anyAvailable) return;
    openRequestModal(dateStr);
  };
}

// ---------- Request modal ----------
function openRequestModal(dateStr) {
  pendingRequest = { date: dateStr };
  const modal = document.getElementById('requestModal');
  const dateLine = document.getElementById('modalDateLine');
  const dateObj = new Date(dateStr + 'T00:00:00');
  const friendly = dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  dateLine.textContent = `For ${friendly}. Send your details and we'll confirm the exact slot on WhatsApp.`;
  modal.classList.add('show');
}
function closeRequestModal() {
  document.getElementById('requestModal').classList.remove('show');
  document.getElementById('requestForm').reset();
  pendingRequest = null;
}

// ---------- Admin panel ----------
function renderAdminList() {
  const wrap = document.getElementById('adminList');
  if (!wrap) return;
  const entries = Object.keys(bookingData).sort();
  if (!entries.length) {
    wrap.innerHTML = '<p style="font-size:.85rem; color:var(--ink-soft);">No dates marked as booked yet.</p>';
    return;
  }
  wrap.innerHTML = '';
  entries.forEach(dateStr => {
    const slots = getSlots(dateStr);
    const bookedSlots = Object.keys(SLOT_LABELS).filter(k => slots[k] === 'booked');
    if (!bookedSlots.length) return;
    const row = document.createElement('div');
    row.className = 'admin-entry';
    row.innerHTML = `
      <span>${dateStr} — ${bookedSlots.map(k => SLOT_LABELS[k].name).join(', ')}</span>
      <button data-date="${dateStr}">Clear all</button>
    `;
    row.querySelector('button').addEventListener('click', () => {
      delete bookingData[dateStr];
      saveData();
      renderAdminList();
      renderCalendar();
      if (selectedDate) renderSlotPanel(selectedDate);
    });
    wrap.appendChild(row);
  });
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

  // modal close
  document.getElementById('modalClose').addEventListener('click', closeRequestModal);
  document.getElementById('requestModal').addEventListener('click', (e) => {
    if (e.target.id === 'requestModal') closeRequestModal();
  });

  // request form -> WhatsApp
  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingRequest) return;
    const name = document.getElementById('rName').value.trim();
    const phone = document.getElementById('rPhone').value.trim();
    const type = document.getElementById('rType').value;
    const msg = document.getElementById('rMsg').value.trim();
    const dateObj = new Date(pendingRequest.date + 'T00:00:00');
    const friendly = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let text = `Hi, I'd like to request a booking at Bandhan Party Plot.%0ADate: ${encodeURIComponent(friendly)}%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AEvent Type: ${encodeURIComponent(type)}`;
    if (msg) text += `%0AMessage: ${encodeURIComponent(msg)}`;

    window.open(`https://wa.me/917016669124?text=${text}`, '_blank');
    closeRequestModal();
  });

  // admin toggle
  const adminToggle = document.getElementById('adminToggle');
  const adminPanel = document.getElementById('adminPanel');
  adminToggle.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
    if (!adminPanel.classList.contains('hidden')) {
      adminPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  document.getElementById('adminUnlock').addEventListener('click', () => {
    const val = document.getElementById('adminPass').value;
    if (val === ADMIN_PASSCODE) {
      document.getElementById('adminLocked').style.display = 'none';
      document.getElementById('adminUnlocked').style.display = 'block';
      renderAdminList();
    } else {
      alert('Incorrect passcode.');
    }
  });

  document.getElementById('adminSave').addEventListener('click', () => {
    const date = document.getElementById('adminDate').value;
    const slot = document.getElementById('adminSlot').value;
    const status = document.getElementById('adminStatus').value;
    if (!date) { alert('Please choose a date.'); return; }

    if (!bookingData[date]) bookingData[date] = { morning: 'available', evening: 'available', fullday: 'available', note: '' };
    bookingData[date][slot] = status;
    saveData();
    renderAdminList();
    renderCalendar();
    if (selectedDate) renderSlotPanel(selectedDate);
  });
});
