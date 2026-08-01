// =========================================================
// BANDHAN PARTY PLOT — shared site behaviour
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // header scroll state
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // mobile drawer
  const burger = document.getElementById('burgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = drawer.style.display === 'flex';
      drawer.style.display = open ? 'none' : 'flex';
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.style.display = 'none'));
  }

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  }

  // homepage enquiry form -> WhatsApp
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('fname').value.trim();
      const phone = document.getElementById('fphone').value.trim();
      const date = document.getElementById('fdate').value;
      const type = document.getElementById('ftype').value;
      const msg = document.getElementById('fmsg').value.trim();

      // save to the shared data layer so staff can see it later on the
      // booking.html admin panel, even if the customer never gets a reply
      if (typeof addEnquiry === 'function') {
        addEnquiry({ name, phone, eventType: type, eventDate: date, message: msg, source: 'homepage' });
      }

      let text = `Hi, I'd like to enquire about booking Bandhan Party Plot.%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AEvent Type: ${encodeURIComponent(type)}`;
      if (date) text += `%0AEvent Date: ${encodeURIComponent(date)}`;
      if (msg) text += `%0AMessage: ${encodeURIComponent(msg)}`;

      const successBox = document.getElementById('enquirySuccess');
      if (successBox) successBox.classList.add('show');

      window.open(`https://wa.me/917016669124?text=${text}`, '_blank');
      enquiryForm.reset();
    });
  }
});
