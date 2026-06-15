/* ============================================
   BANDHAN PARTY PLOT - Main JavaScript
   ============================================ */

// ============================================
// GOOGLE APPS SCRIPT URL
// IMPORTANT: Replace this URL after you set up Google Apps Script
// ============================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6zGiScvm6MXITxkHBTtZOadL3FiVFiTqBE7R6RXF2-4LQRpPjgivUbWiBZgzUMzLGIg/exec';

// ============================================
// NAVBAR SCROLL BEHAVIOR
// ============================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ============================================
// HAMBURGER MOBILE MENU
// ============================================
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close on link click
  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ============================================
// FAQ ACCORDION
// ============================================
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(fi => fi.classList.remove('active'));

      // Open clicked if it was closed
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ============================================
// GALLERY FILTER
// ============================================
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Animate these elements on scroll
  const animElements = document.querySelectorAll(
    '.event-card, .why-card, .testimonial-card, .service-card, .gallery-card, .addon-card, .value-card, .stat-card, .spec-card, .contact-card'
  );

  animElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================
// BOOKING FORM SUBMISSION
// ============================================
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit-btn');
    const successMsg = document.getElementById('bookingSuccess');
    const errorMsg = document.getElementById('bookingError');

    // Hide previous messages
    if (successMsg) successMsg.classList.remove('show');
    if (errorMsg) errorMsg.classList.remove('show');

    // Validate
    const name = document.getElementById('customerName').value.trim();
    const mobile = document.getElementById('mobileNumber').value.trim();
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const guests = document.getElementById('numGuests').value;

    if (!name || !mobile || !eventType || !eventDate || !guests) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    // Mobile validation (India 10 digits)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    // Check if date is blocked
    const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
    if (blockedDates.includes(eventDate)) {
      showToast('Sorry! This date is not available. Please choose another date.', 'error');
      if (errorMsg) {
        errorMsg.textContent = '⚠️ This date is blocked. Please select another date.';
        errorMsg.classList.add('show');
      }
      return;
    }

    // Button loading state
    const btnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = {
      type: 'booking',
      customerName: name,
      mobileNumber: mobile,
      eventType: eventType,
      eventDate: eventDate,
      numGuests: guests,
      notes: document.getElementById('notes').value.trim(),
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
      if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        // Demo mode (before Google Sheets is set up)
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (successMsg) {
          successMsg.innerHTML = '🎉 <strong>Booking Request Received!</strong><br>We will contact you within 24 hours to confirm your booking. Thank you!';
          successMsg.classList.add('show');
        }
        form.reset();
        showToast('Booking submitted successfully!', 'success');
      } else {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();

        if (result.success) {
          if (successMsg) {
            successMsg.innerHTML = '🎉 <strong>Booking Request Received!</strong><br>We will contact you within 24 hours to confirm. Reference ID: ' + (result.id || 'BPP-' + Date.now());
            successMsg.classList.add('show');
          }
          form.reset();
          showToast('Booking submitted successfully!', 'success');
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (errorMsg) {
        errorMsg.textContent = 'Something went wrong. Please call us directly at +91 98765 43210.';
        errorMsg.classList.add('show');
      }
      showToast('Submission failed. Please try calling us.', 'error');
    } finally {
      submitBtn.innerHTML = btnText;
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// CONTACT FORM SUBMISSION
// ============================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit-btn');
    const successMsg = document.getElementById('contactSuccess');
    const errorMsg = document.getElementById('contactError');

    if (successMsg) successMsg.classList.remove('show');
    if (errorMsg) errorMsg.classList.remove('show');

    const name = document.getElementById('contactName').value.trim();
    const mobile = document.getElementById('contactMobile').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !mobile || !message) {
      showToast('Please fill all fields.', 'error');
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    const btnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
    submitBtn.disabled = true;

    const formData = {
      type: 'contact',
      contactName: name,
      contactMobile: mobile,
      contactMessage: message,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
      if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        await new Promise(resolve => setTimeout(resolve, 1200));
        if (successMsg) {
          successMsg.innerHTML = '✅ <strong>Message Sent!</strong><br>Thank you for contacting us. We will get back to you soon!';
          successMsg.classList.add('show');
        }
        form.reset();
        showToast('Message sent successfully!', 'success');
      } else {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();

        if (result.success) {
          if (successMsg) {
            successMsg.innerHTML = '✅ <strong>Message Sent Successfully!</strong><br>We will get back to you within 24 hours.';
            successMsg.classList.add('show');
          }
          form.reset();
          showToast('Message sent!', 'success');
        } else {
          throw new Error('Failed');
        }
      }
    } catch (error) {
      console.error('Contact error:', error);
      if (errorMsg) {
        errorMsg.textContent = 'Message failed. Please call +91 98765 43210.';
        errorMsg.classList.add('show');
      }
      showToast('Failed to send. Please call us.', 'error');
    } finally {
      submitBtn.innerHTML = btnText;
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// DATE INPUT MIN DATE (no past dates)
// ============================================
function initDateInput() {
  const dateInput = document.getElementById('eventDate');
  if (!dateInput) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  dateInput.min = minDate;

  // Mark blocked dates
  const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
  dateInput.addEventListener('change', () => {
    if (blockedDates.includes(dateInput.value)) {
      showToast('⚠️ This date is blocked. Please choose another date.', 'error');
      dateInput.value = '';
    }
  });
}

// ============================================
// ADMIN PANEL
// ============================================
function initAdminPanel() {
  const loginForm = document.getElementById('adminLoginForm');
  const adminLogin = document.getElementById('adminLogin');
  const adminLayout = document.getElementById('adminLayout');

  if (!loginForm) return;

  // Check if already logged in
  if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    adminLogin.style.display = 'none';
    adminLayout.style.display = 'flex';
    loadAdminData();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;

    // Default credentials (change these!)
    if (username === 'bandhan' && password === 'admin2024') {
      sessionStorage.setItem('adminLoggedIn', 'true');
      adminLogin.style.display = 'none';
      adminLayout.style.display = 'flex';
      loadAdminData();
      showToast('Welcome back, Admin!', 'success');
    } else {
      showToast('Invalid credentials. Try again.', 'error');
      document.getElementById('adminPass').value = '';
    }
  });

  // Logout
  const logoutBtn = document.getElementById('adminLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('adminLoggedIn');
      adminLogin.style.display = 'flex';
      adminLayout.style.display = 'none';
      showToast('Logged out successfully.', 'info');
    });
  }

  // Nav tabs
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const panel = item.dataset.panel;
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      const targetPanel = document.getElementById('panel-' + panel);
      if (targetPanel) targetPanel.classList.add('active');

      // Update page title
      const pageTitle = document.getElementById('adminPageTitle');
      if (pageTitle) pageTitle.textContent = item.querySelector('.admin-nav-text')?.textContent || 'Dashboard';
    });
  });

  // Blocked dates
  initBlockedDates();

  // Refresh buttons
  document.querySelectorAll('.admin-refresh-btn').forEach(btn => {
    btn.addEventListener('click', loadAdminData);
  });
}

// ============================================
// ADMIN: LOAD DATA FROM GOOGLE SHEETS
// ============================================
async function loadAdminData() {
  updateDashboardStats();
  await loadBookings();
  await loadContacts();
}

async function loadBookings() {
  const tbody = document.getElementById('bookingsTableBody');
  const countEl = document.getElementById('bookingsCount');
  if (!tbody) return;

  if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    // Demo data
    const demoData = [
      { customerName: 'Rajesh Patel', mobileNumber: '9876543210', eventType: 'Wedding', eventDate: '2024-12-15', numGuests: '500', notes: 'Need decoration', timestamp: '10/12/2024, 10:30 AM' },
      { customerName: 'Priya Shah', mobileNumber: '9765432109', eventType: 'Birthday Party', eventDate: '2024-12-20', numGuests: '150', notes: 'Theme cake needed', timestamp: '10/12/2024, 2:15 PM' },
      { customerName: 'Amit Desai', mobileNumber: '9654321098', eventType: 'Reception', eventDate: '2024-12-28', numGuests: '350', notes: 'DJ and catering required', timestamp: '11/12/2024, 11:00 AM' },
      { customerName: 'Meera Joshi', mobileNumber: '9543210987', eventType: 'Engagement', eventDate: '2025-01-05', numGuests: '200', notes: 'Garden setup preferred', timestamp: '11/12/2024, 4:45 PM' },
    ];
    renderBookingsTable(demoData);
    if (countEl) countEl.textContent = demoData.length;
    return;
  }

  try {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#6B7280;">Loading bookings...</td></tr>';
    const response = await fetch(`${APPS_SCRIPT_URL}?type=bookings`);
    const data = await response.json();
    renderBookingsTable(data.bookings || []);
    if (countEl) countEl.textContent = (data.bookings || []).length;
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#dc2626;">Failed to load. Check your Apps Script URL.</td></tr>';
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#6B7280;">No bookings yet.</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map((b, i) => `
    <tr>
      <td><strong>#${i + 1}</strong></td>
      <td>${b.customerName || '-'}</td>
      <td>${b.mobileNumber || '-'}</td>
      <td>${b.eventType || '-'}</td>
      <td>${b.eventDate || '-'}</td>
      <td>${b.numGuests || '-'}</td>
      <td><span class="status-badge status-new">New</span></td>
    </tr>
  `).join('');
}

async function loadContacts() {
  const tbody = document.getElementById('contactsTableBody');
  const countEl = document.getElementById('contactsCount');
  if (!tbody) return;

  if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    const demoData = [
      { contactName: 'Suresh Mehta', contactMobile: '9432109876', contactMessage: 'Want to know about hall capacity and pricing', timestamp: '10/12/2024, 9:00 AM' },
      { contactName: 'Anita Modi', contactMobile: '9321098765', contactMessage: 'Is parking available for 200 cars?', timestamp: '11/12/2024, 3:30 PM' },
    ];
    renderContactsTable(demoData);
    if (countEl) countEl.textContent = demoData.length;
    return;
  }

  try {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#6B7280;">Loading contacts...</td></tr>';
    const response = await fetch(`${APPS_SCRIPT_URL}?type=contacts`);
    const data = await response.json();
    renderContactsTable(data.contacts || []);
    if (countEl) countEl.textContent = (data.contacts || []).length;
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#dc2626;">Failed to load. Check your Apps Script URL.</td></tr>';
  }
}

function renderContactsTable(contacts) {
  const tbody = document.getElementById('contactsTableBody');
  if (!tbody) return;

  if (contacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#6B7280;">No contact messages yet.</td></tr>';
    return;
  }

  tbody.innerHTML = contacts.map((c, i) => `
    <tr>
      <td><strong>#${i + 1}</strong></td>
      <td>${c.contactName || '-'}</td>
      <td>${c.contactMobile || '-'}</td>
      <td>${c.contactMessage || '-'}</td>
      <td>${c.timestamp || '-'}</td>
    </tr>
  `).join('');
}

// ============================================
// ADMIN: STATS
// ============================================
function updateDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  const blockedDates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
  const blockedCountEl = document.getElementById('blockedDatesCount');
  if (blockedCountEl) blockedCountEl.textContent = blockedDates.length;
}

// ============================================
// ADMIN: BLOCKED DATES
// ============================================
function initBlockedDates() {
  renderBlockedDates();

  const addBtn = document.getElementById('addBlockedDate');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const input = document.getElementById('blockDateInput');
      const reason = document.getElementById('blockReason');
      if (!input || !input.value) {
        showToast('Please select a date to block.', 'error');
        return;
      }
      const dates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
      if (dates.includes(input.value)) {
        showToast('This date is already blocked.', 'info');
        return;
      }
      dates.push(input.value);
      localStorage.setItem('blockedDates', JSON.stringify(dates));
      input.value = '';
      if (reason) reason.value = '';
      renderBlockedDates();
      updateDashboardStats();
      showToast('Date blocked successfully!', 'success');
    });
  }
}

function renderBlockedDates() {
  const container = document.getElementById('blockedDatesList');
  if (!container) return;

  const dates = JSON.parse(localStorage.getItem('blockedDates') || '[]');

  if (dates.length === 0) {
    container.innerHTML = '<p style="color:#6B7280;font-size:0.9rem;">No blocked dates. Add dates above.</p>';
    return;
  }

  container.innerHTML = dates.map(date => `
    <div class="blocked-date-tag">
      📅 ${formatDate(date)}
      <span class="blocked-date-remove" onclick="removeBlockedDate('${date}')" title="Remove">✕</span>
    </div>
  `).join('');
}

function removeBlockedDate(date) {
  const dates = JSON.parse(localStorage.getItem('blockedDates') || '[]');
  const updated = dates.filter(d => d !== date);
  localStorage.setItem('blockedDates', JSON.stringify(updated));
  renderBlockedDates();
  updateDashboardStats();
  showToast('Date unblocked.', 'info');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
    }, 16);
  });
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initFAQ();
  initGalleryFilter();
  initScrollAnimations();
  initBookingForm();
  initContactForm();
  initDateInput();
  initAdminPanel();

  // Counter animation on scroll
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});