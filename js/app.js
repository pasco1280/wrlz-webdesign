/* ============================================================
   WRLZ WEBDESIGN — Main App (GSAP + Interactions)
   ============================================================ */

(function () {
  'use strict';

  // --- LOADER ---
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelector('.loader')?.classList.add('hidden');
      initHeroAnimations();
    }, 2200);
  });

  // --- REGISTER GSAP PLUGINS ---
  gsap.registerPlugin(ScrollTrigger);

  // --- NAV SCROLL STATE ---
  const nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start: 'top -80px',
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.progress > 0);
    },
  });

  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile menu on link click
  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // --- HERO ANIMATIONS ---
  function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero h1', { opacity: 1, y: 0, duration: 1 })
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .to('.hero-scroll-hint', { opacity: 1, duration: 0.6 }, '-=0.3');
  }

  // --- PHILOSOPHY CARDS SCROLL ANIMATION ---
  gsap.utils.toArray('.philo-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Philosophy heading
  gsap.from('.philosophy-left h2', {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: '.philosophy-left',
      start: 'top 80%',
    },
  });

  gsap.from('.philosophy-left p', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.2,
    scrollTrigger: {
      trigger: '.philosophy-left',
      start: 'top 80%',
    },
  });

  // --- BENTO CARDS SCROLL ANIMATION ---
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- KI EDGE CODE LINES ---
  gsap.utils.toArray('.code-line').forEach((line, i) => {
    gsap.to(line, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.ki-edge-visual',
        start: 'top 75%',
      },
    });
  });

  // --- STATS COUNTER ---
  gsap.utils.toArray('.stat-number').forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          innerText: target,
          duration: 2,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            el.textContent = Math.round(parseFloat(el.textContent)) + suffix;
          },
        });
      },
    });
  });

  // --- FOOTER CTA ANIMATION ---
  gsap.to('.footer-big-text', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.footer-curtain',
      start: 'top 60%',
    },
  });

  gsap.to('.contact-chat', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.3,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.footer-curtain',
      start: 'top 50%',
    },
  });

  // --- CURSOR GLOW (desktop only) ---
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.classList.add('cursor-glow');
    document.body.appendChild(glow);

    let glowX = 0, glowY = 0;
    document.addEventListener('mousemove', (e) => {
      glowX = e.clientX;
      glowY = e.clientY;
    });

    function updateGlow() {
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(updateGlow);
    }
    updateGlow();
  }

  // --- MAGNETIC HOVER for bento cards ---
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.bento-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(card, {
          x: x * 0.04,
          y: y * 0.04,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // --- SMOOTH SCROLL for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 80 },
          duration: 1,
          ease: 'power3.inOut',
        });
      }
    });
  });

  // --- CHAT-STYLE CONTACT FORM ---
  const chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    const steps = [
      { question: 'Hi! Wie heisst du?', field: 'name', placeholder: 'Dein Name...' },
      { question: 'Nice, {name}! Was ist deine E-Mail?', field: 'email', placeholder: 'deine@email.com', type: 'email' },
      { question: 'Was schwebt dir vor? Landingpage, Shop, Full Website?', field: 'project', placeholder: 'Erzaehl kurz...' },
      { question: 'Gibt es ein Budget?', field: 'budget', placeholder: 'z.B. 3.000-5.000 EUR' },
    ];

    let currentStep = 0;
    const formData = {};

    function renderStep() {
      if (currentStep >= steps.length) {
        showComplete();
        return;
      }

      const step = steps[currentStep];
      let q = step.question;
      Object.keys(formData).forEach((key) => {
        q = q.replace(`{${key}}`, formData[key]);
      });

      // Add bot bubble
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = `<span class="bot-name">WRLZ</span>${q}`;

      const inputRow = document.createElement('div');
      inputRow.className = 'chat-input-row';
      inputRow.innerHTML = `
        <input class="chat-input" type="${step.type || 'text'}" placeholder="${step.placeholder}" autocomplete="off">
        <button class="chat-send" aria-label="Senden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      `;

      chatContainer.innerHTML = '';
      chatContainer.appendChild(bubble);

      // Show previous answers
      Object.entries(formData).forEach(([, val]) => {
        const resp = document.createElement('div');
        resp.className = 'chat-response-bubble';
        resp.textContent = val;
        chatContainer.insertBefore(resp, bubble);
      });

      chatContainer.appendChild(inputRow);

      const input = inputRow.querySelector('input');
      const sendBtn = inputRow.querySelector('.chat-send');

      input.focus();

      function submit() {
        const val = input.value.trim();
        if (!val) return;
        formData[step.field] = val;
        currentStep++;
        renderStep();
      }

      sendBtn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
    }

    function showComplete() {
      chatContainer.innerHTML = '';

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = `<span class="bot-name">WRLZ</span>Perfekt, ${formData.name}! Wir melden uns innerhalb von 24h bei dir. Bis bald! 🚀`;
      chatContainer.appendChild(bubble);

      // Send via email (mailto fallback)
      const mailBody = Object.entries(formData).map(([k, v]) => `${k}: ${v}`).join('%0A');
      const mailLink = document.createElement('a');
      mailLink.href = `mailto:pascal@wrlz.ai?subject=Neues Webdesign Projekt von ${formData.name}&body=${mailBody}`;
      mailLink.className = 'btn-primary';
      mailLink.style.marginTop = '20px';
      mailLink.style.display = 'inline-flex';
      mailLink.textContent = 'Direkt per E-Mail senden';
      chatContainer.appendChild(mailLink);
    }

    renderStep();
  }
})();
