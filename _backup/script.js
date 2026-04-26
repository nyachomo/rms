// ===== COOKIE BANNER =====
if (localStorage.getItem('cookies')) document.getElementById('cookie-banner').classList.add('hidden');

// ===== HERO BACKGROUND CAROUSEL =====
const slides = document.querySelectorAll('.slide');
const navEl = document.getElementById('slide-nav');
let current = 0, autoSlide;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
  dot.onclick = () => goSlide(i);
  navEl.appendChild(dot);
});

function goSlide(n) {
  slides[current].classList.remove('active');
  navEl.children[current].classList.remove('active');
  current = (n + slides.length) % slides.length;
  slides[current].classList.add('active');
  navEl.children[current].classList.add('active');
}

function moveSlide(dir) { clearInterval(autoSlide); goSlide(current + dir); startAuto(); }
function startAuto() { autoSlide = setInterval(() => goSlide(current + 1), 6000); }
startAuto();

// ===== RIGHT-SIDE HERO CAROUSEL =====
(function () {
  const track = document.getElementById('heroRTrack');
  const dotsWrap = document.getElementById('heroRDots');
  if (!track) return;
  const slides = track.querySelectorAll('.rcarousel-slide');
  let cur = 0, timer;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'rcarousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => { clearInterval(timer); go(i); startR(); });
    dotsWrap.appendChild(d);
  });

  function go(n) {
    cur = (n + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + cur + '00%)';
    dotsWrap.querySelectorAll('.rcarousel-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function startR() { timer = setInterval(() => go(cur + 1), 3500); }
  startR();
})();

// ===== CORE VALUES CAROUSEL =====
(function () {
  const track = document.getElementById('valuesTrack');
  const dotsWrap = document.getElementById('valuesDots');
  const prevBtn = document.getElementById('valuesPrev');
  const nextBtn = document.getElementById('valuesNext');
  if (!track) return;

  const cards = track.querySelectorAll('.value-card');
  let visibleCount = 4;
  let cur = 0;
  let autoTimer;

  function getVisible() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 4;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    visibleCount = getVisible();
    const total = cards.length - visibleCount + 1;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'values-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => { clearInterval(autoTimer); go(i); startAuto(); });
      dotsWrap.appendChild(d);
    }
  }

  function go(n) {
    visibleCount = getVisible();
    const max = cards.length - visibleCount;
    cur = Math.max(0, Math.min(n, max));
    const cardWidth = cards[0].offsetWidth + 20;
    track.style.transform = 'translateX(-' + (cur * cardWidth) + 'px)';
    dotsWrap.querySelectorAll('.values-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function startAuto() { autoTimer = setInterval(() => { const max = cards.length - getVisible(); go(cur >= max ? 0 : cur + 1); }, 3000); }

  prevBtn.addEventListener('click', () => { clearInterval(autoTimer); go(cur - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { clearInterval(autoTimer); go(cur + 1); startAuto(); });

  window.addEventListener('resize', () => { buildDots(); go(0); });
  buildDots();
  startAuto();
})();

// ===== MOBILE MENU =====
function toggleMenu() { document.getElementById('mobile-menu').classList.toggle('open'); }
function closeMenu() { document.getElementById('mobile-menu').classList.remove('open'); }

// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let pos = window.scrollY + 120;
  sections.forEach(s => {
    if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight)
      navLinks.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + s.id) a.classList.add('active');
      });
  });
  document.getElementById('back-top').classList.toggle('visible', window.scrollY > 400);
});

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('.counter');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target, target = +el.dataset.target;
      let count = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count;
        if (count >= target) clearInterval(timer);
      }, 25);
    }
  });
}, { threshold: 0.5 }).observe(document.querySelector('.stats-bar'));

counters.forEach(c => new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    const target = +c.dataset.target;
    let count = 0;
    const timer = setInterval(() => {
      count = Math.min(count + Math.ceil(target / 60), target);
      c.textContent = count;
      if (count >= target) clearInterval(timer);
    }, 25);
  }
}, { threshold: 0.5 }).observe(c));

// ===== MODALS =====
function openModal(id) { document.getElementById('modal-' + id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById('modal-' + id).classList.remove('open'); document.body.style.overflow = ''; }
document.querySelectorAll('.modal-overlay').forEach(m =>
  m.addEventListener('click', e => {
    if (e.target === m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  })
);

// ===== TESTIMONIALS SLIDER =====
const testiTrack = document.getElementById('testi-track');
const dotsEl = document.getElementById('testi-dots');
const cards = testiTrack.querySelectorAll('.testi-card');
let tcur = 0;

cards.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'testi-dot' + (i === 0 ? ' active' : '');
  d.onclick = () => goTesti(i);
  dotsEl.appendChild(d);
});

function goTesti(n) {
  tcur = n;
  testiTrack.style.transform = `translateX(-${n * 100}%)`;
  dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === n));
}

setInterval(() => goTesti((tcur + 1) % cards.length), 5000);

// ===== CONTACT FORM =====
function submitForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
    document.getElementById('form-success').style.display = 'block';
    e.target.reset();
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled = false;
      document.getElementById('form-success').style.display = 'none';
    }, 4000);
  }, 1800);
}

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .value-card, .step-card, .blog-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  revealObs.observe(el);
});
