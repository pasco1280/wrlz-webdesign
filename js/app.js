/* ============================================================
   WRLZ WEBDESIGN — Main App
   Lenis smooth scroll + GSAP ScrollTrigger choreography
   ============================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     GSAP PLUGIN REGISTRATION
  ───────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ─────────────────────────────────────────────
     LENIS SMOOTH SCROLL
  ───────────────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  /* Scroll velocity → chromatic aberration intensity */
  lenis.on('scroll', ({ velocity }) => {
    if (window.WRLZ_HERO && typeof window.WRLZ_HERO.setChromaticIntensity === 'function') {
      window.WRLZ_HERO.setChromaticIntensity(Math.min(Math.abs(velocity) * 0.003, 0.015));
    }
  });

  /* ─────────────────────────────────────────────
     LOADER
  ───────────────────────────────────────────── */
  (function initLoader() {
    const loaderEl   = document.getElementById('loader');
    const fillEl     = document.getElementById('loader-fill');
    const percentEl  = document.getElementById('loader-percent');

    if (!loaderEl) {
      // No loader in DOM — just boot immediately on window load
      window.addEventListener('load', bootSite);
      return;
    }

    let displayProgress = 0;
    let rafId = null;
    let loadDone = false;

    function getProgress() {
      if (typeof window.WRLZ_LOAD_PROGRESS === 'number') {
        return window.WRLZ_LOAD_PROGRESS;
      }
      return loadDone ? 1 : 0;
    }

    function updateLoader() {
      const target   = getProgress();
      displayProgress += (target - displayProgress) * 0.08;
      if (displayProgress > 0.999) displayProgress = 1;

      const pct = Math.round(displayProgress * 100);

      if (fillEl)    fillEl.style.width = pct + '%';
      if (percentEl) percentEl.textContent = pct + '%';

      if (displayProgress >= 1) {
        cancelAnimationFrame(rafId);
        finishLoader();
        return;
      }
      rafId = requestAnimationFrame(updateLoader);
    }

    function finishLoader() {
      gsap.to(loaderEl, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          loaderEl.style.display = 'none';
          bootSite();
        },
      });
    }

    window.addEventListener('load', () => {
      loadDone = true;

      // If no external progress tracker, drive a synthetic 2s fill
      if (typeof window.WRLZ_LOAD_PROGRESS !== 'number') {
        gsap.to({ p: 0 }, {
          p: 1,
          duration: 2,
          ease: 'power1.inOut',
          onUpdate: function () {
            window.WRLZ_LOAD_PROGRESS = this.targets()[0].p;
          },
        });
      }
    });

    // Start polling
    rafId = requestAnimationFrame(updateLoader);
  })();

  /* ─────────────────────────────────────────────
     BOOT SITE — called after loader fades
  ───────────────────────────────────────────── */
  function bootSite() {
    if (window.WRLZ_HERO && typeof window.WRLZ_HERO.triggerEntrance === 'function') {
      window.WRLZ_HERO.triggerEntrance();
    }
    initHeroAnimations();
    initHeroScrollProgress();
    initNav();
    initPhilosophy();
    initPortfolioGrid();
    initBentoCards();
    initStats();
    initDirectContact();
    initKiEdge();
    initFooter();
    initChatForm();
    // initCustomCursor(); // disabled — too distracting
    initHeroGradientOrb();
  }

  /* ─────────────────────────────────────────────
     HERO ENTRANCE ANIMATIONS
  ───────────────────────────────────────────── */
  function initHeroAnimations() {
    // Force initial states before animating
    gsap.set('.line-inner', { yPercent: 110 });
    gsap.set('.hero-label', { clipPath: 'inset(0 100% 0 0)' });
    gsap.set('.hero-sub', { opacity: 0, y: 30 });
    gsap.set('.hero-cta-group', { opacity: 0, y: 30 });
    gsap.set('.hero-scroll-hint', { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.3 });

    // Clip-reveal hero label
    tl.to('.hero-label', { clipPath: 'inset(0 0% 0 0)', duration: 0.8 });

    // Line-by-line headline reveal
    tl.to('.line-inner', { yPercent: 0, duration: 1, stagger: 0.1 }, '-=0.5');

    // Sub-headline
    tl.to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');

    // CTA group
    tl.to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');

    // Scroll hint
    tl.to('.hero-scroll-hint', { opacity: 1, duration: 0.6 }, '-=0.3'
    );
  }

  /* ─────────────────────────────────────────────
     HERO SCROLL PROGRESS → 3D canvas
  ───────────────────────────────────────────── */
  function initHeroScrollProgress() {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        if (window.WRLZ_HERO && typeof window.WRLZ_HERO.updateScrollProgress === 'function') {
          window.WRLZ_HERO.updateScrollProgress(self.progress);
        }
      },
    });
  }

  /* ─────────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────────── */
  function initNav() {
    const nav      = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks  = document.querySelector('.nav-links');

    // Scrolled class
    ScrollTrigger.create({
      start: 'top -80px',
      end: '99999',
      onUpdate: (self) => {
        if (nav) nav.classList.toggle('scrolled', self.progress > 0);
      },
    });

    // Hamburger toggle
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        const spans  = navToggle.querySelectorAll('span');

        if (isOpen) {
          gsap.to(spans[0], { rotate: 45, y: 6,  duration: 0.3, ease: 'power2.inOut' });
          gsap.to(spans[1], { opacity: 0, x: -8,  duration: 0.2 });
          gsap.to(spans[2], { rotate: -45, y: -6, duration: 0.3, ease: 'power2.inOut' });
        } else {
          gsap.to(spans[0], { rotate: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });
          gsap.to(spans[1], { opacity: 1, x: 0,  duration: 0.2 });
          gsap.to(spans[2], { rotate: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });
        }
      });

      // Close on link click
      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          const spans = navToggle.querySelectorAll('span');
          gsap.to(spans[0], { rotate: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });
          gsap.to(spans[1], { opacity: 1, x: 0,  duration: 0.2 });
          gsap.to(spans[2], { rotate: 0, y: 0, duration: 0.3, ease: 'power2.inOut' });
        });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href   = link.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     PHILOSOPHY SECTION
  ───────────────────────────────────────────── */
  function initPhilosophy() {
    // Heading clip reveal
    const philoHeading = document.querySelector('.philosophy-left h2');
    if (philoHeading) {
      gsap.fromTo(
        philoHeading,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: philoHeading,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Paragraph
    const philoPara = document.querySelector('.philosophy-left p');
    if (philoPara) {
      gsap.fromTo(
        philoPara,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: philoPara,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Philosophy cards — 3D flip-in
    gsap.utils.toArray('.philo-card.reveal-item').forEach((card) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 50,
          rotateX: 10,
          transformPerspective: 800,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ─────────────────────────────────────────────
     PORTFOLIO — HORIZONTAL SCROLL
  ───────────────────────────────────────────── */
  function initPortfolioGrid() {
    const items = gsap.utils.toArray('.pf-item');
    if (!items.length) return;

    items.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ─────────────────────────────────────────────
     BENTO CARDS
  ───────────────────────────────────────────── */
  function initBentoCards() {
    gsap.utils.toArray('.bento-card').forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, rotateX: 5, transformPerspective: 800 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Mouse glow + magnetic hover
    document.querySelectorAll('[data-magnetic]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width)  * 100;
        const yPct = ((e.clientY - rect.top)  / rect.height) * 100;

        card.style.setProperty('--mouse-x', xPct + '%');
        card.style.setProperty('--mouse-y', yPct + '%');

        const dx = e.clientX - rect.left - rect.width  / 2;
        const dy = e.clientY - rect.top  - rect.height / 2;

        gsap.to(card, {
          x: dx * 0.04,
          y: dy * 0.04,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ─────────────────────────────────────────────
     STATS COUNTER
  ───────────────────────────────────────────── */
  function initStats() {
    gsap.utils.toArray('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';

      if (isNaN(target)) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
          });
        },
      });
    });
  }

  /* ─────────────────────────────────────────────
     DIRECT CONTACT SECTION
  ───────────────────────────────────────────── */
  function initDirectContact() {
    const section = document.querySelector('.direct-contact');
    if (!section) return;

    const portrait = section.querySelector('.contact-portrait-wrapper');
    const content = section.querySelector('.contact-card-content');

    if (portrait) {
      gsap.fromTo(portrait,
        { opacity: 0, x: -60, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' }
        }
      );
    }

    if (content) {
      gsap.fromTo(content.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none none' }
        }
      );
    }
  }

  /* ─────────────────────────────────────────────
     KI-EDGE CODE LINES
  ───────────────────────────────────────────── */
  function initKiEdge() {
    const codeLines = gsap.utils.toArray('.code-line');
    if (!codeLines.length) return;

    // Populate text content from data-text attribute
    codeLines.forEach((line) => {
      if (line.dataset.text) {
        line.textContent = line.dataset.text;
      }
    });

    gsap.fromTo(
      codeLines,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: codeLines[0].closest('.ki-edge-visual') || codeLines[0],
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* ─────────────────────────────────────────────
     FOOTER
  ───────────────────────────────────────────── */
  function initFooter() {
    // Footer big text lines
    const fbtLines = gsap.utils.toArray('.fbt-line');
    if (fbtLines.length) {
      gsap.fromTo(
        fbtLines,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: fbtLines[0].closest('section') || fbtLines[0],
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Contact chat section entrance
    const contactChat = document.querySelector('.contact-chat');
    if (contactChat) {
      gsap.fromTo(
        contactChat,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactChat,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }

  /* ─────────────────────────────────────────────
     CHAT-STYLE CONTACT FORM
  ───────────────────────────────────────────── */
  function initChatForm() {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // ── EmailJS config — fill in your IDs from emailjs.com ──
    const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

    // ── Calendly booking link ──
    const CALENDLY_URL = 'https://calendly.com/pasco1280/30min';

    const steps = [
      {
        question:    'Hey! Wie heisst du?',
        field:       'name',
        placeholder: 'Dein Name...',
        type:        'text',
      },
      {
        question:    'Nice, {name}! Was ist deine Website-URL, falls du schon eine hast? (oder einfach "keine")',
        field:       'website',
        placeholder: 'z.B. meinefirma.de oder "keine"',
        type:        'text',
      },
      {
        question:    'Was brauchst du? Landingpage, komplette Website, Online-Shop oder etwas anderes?',
        field:       'project_type',
        placeholder: 'Landingpage / Website / Shop / ...',
        type:        'text',
      },
      {
        question:    'Was ist das Ziel des Projekts? Mehr Leads, mehr Verkäufe, besserer Markenauftritt?',
        field:       'goal',
        placeholder: 'z.B. mehr Anfragen generieren...',
        type:        'text',
      },
      {
        question:    'Wann soll es live gehen? Hast du einen Zeitrahmen?',
        field:       'timeline',
        placeholder: 'z.B. in 4 Wochen, asap, Q2...',
        type:        'text',
      },
      {
        question:    'Und was ist dein Budget-Rahmen?',
        field:       'budget',
        placeholder: 'z.B. 2.000–5.000 EUR',
        type:        'text',
      },
      {
        question:    'Super! Unter welcher E-Mail erreichst du mich?',
        field:       'email',
        placeholder: 'deine@email.com',
        type:        'email',
      },
    ];

    let currentStep = 0;
    const formData  = {};

    // Init EmailJS
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    function interpolate(str) {
      return str.replace(/\{(\w+)\}/g, (_, key) => formData[key] || '');
    }

    function addBubble(text, className) {
      const el = document.createElement('div');
      el.className = className || 'chat-bubble';
      el.innerHTML = text;
      chatContainer.appendChild(el);
      gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return el;
    }

    function renderStep() {
      if (currentStep >= steps.length) {
        showComplete();
        return;
      }

      const step = steps[currentStep];
      addBubble(`<span class="bot-name">WRLZ:</span> ${interpolate(step.question)}`);

      const inputRow = document.createElement('div');
      inputRow.className = 'chat-input-row';
      inputRow.innerHTML = `
        <input
          class="chat-input"
          type="${step.type || 'text'}"
          placeholder="${step.placeholder}"
          autocomplete="off"
        >
        <button class="chat-send" aria-label="Senden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      `;

      chatContainer.appendChild(inputRow);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      const input   = inputRow.querySelector('input');
      const sendBtn = inputRow.querySelector('.chat-send');

      input.addEventListener('focus', () => { if (window.innerWidth < 768) lenis.stop(); });
      input.addEventListener('blur',  () => { lenis.start(); });

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          input.focus({ preventScroll: true });
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      observer.observe(chatContainer);

      function submit() {
        const val = input.value.trim();
        if (!val) return;
        formData[step.field] = val;
        inputRow.remove();
        addBubble(val, 'chat-response-bubble');
        currentStep++;
        setTimeout(renderStep, 500);
      }

      sendBtn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    }

    function showComplete() {
      addBubble(
        `<span class="bot-name">WRLZ:</span> Perfekt, ${formData.name}! Ich hab alles. Buche dir direkt einen kurzen Call oder schick die Anfrage per Mail raus.`
      );

      // Send via EmailJS if configured
      if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name:    formData.name,
          from_email:   formData.email,
          website:      formData.website,
          project_type: formData.project_type,
          goal:         formData.goal,
          timeline:     formData.timeline,
          budget:       formData.budget,
        }).catch(() => {}); // silent fail
      }

      // Fallback mailto
      const mailBody = [
        `Name: ${formData.name}`,
        `E-Mail: ${formData.email}`,
        `Website: ${formData.website}`,
        `Projekt: ${formData.project_type}`,
        `Ziel: ${formData.goal}`,
        `Timeline: ${formData.timeline}`,
        `Budget: ${formData.budget}`,
      ].join('%0A');

      // Action buttons
      const btnWrap = document.createElement('div');
      btnWrap.className = 'chat-final-actions';

      btnWrap.innerHTML = `
        <a href="${CALENDLY_URL}" target="_blank" rel="noopener" class="btn-primary chat-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Termin buchen
        </a>
        <a href="mailto:pascal@wrlz.ai?subject=Anfrage von ${encodeURIComponent(formData.name)}&body=${mailBody}" class="btn-outline chat-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Per Mail senden
        </a>
      `;

      chatContainer.appendChild(btnWrap);
      gsap.fromTo(btnWrap, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: 'power2.out' });
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    renderStep();
  }

  /* ─────────────────────────────────────────────
     CUSTOM CURSOR (desktop only)
  ───────────────────────────────────────────── */
  function initCustomCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursorDot  = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (!cursorDot || !cursorRing) return;

    // Show cursors
    gsap.set([cursorDot, cursorRing], { opacity: 1 });

    const moveDot  = gsap.quickTo(cursorDot,  'x', { duration: 0.1, ease: 'power3.out' });
    const moveDotY = gsap.quickTo(cursorDot,  'y', { duration: 0.1, ease: 'power3.out' });

    const moveRing  = gsap.quickTo(cursorRing, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(cursorRing, 'y', { duration: 0.4, ease: 'power3.out' });

    document.addEventListener('mousemove', (e) => {
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRing(e.clientX);
      moveRingY(e.clientY);
    });

    // Hover states
    const hoverTargets = 'a, button, .bento-card, .portfolio-panel';

    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(cursorRing, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorDot,  { scale: 0.5, duration: 0.3, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(cursorRing, { scale: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorDot,  { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

    // Hide native cursor
    document.documentElement.style.cursor = 'none';
  }

  /* ─────────────────────────────────────────────
     HERO GRADIENT ORB — mouse parallax
  ───────────────────────────────────────────── */
  function initHeroGradientOrb() {
    const orb = document.querySelector('.hero-gradient-orb');
    if (!orb) return;

    document.addEventListener('mousemove', (e) => {
      const xPct = (e.clientX / window.innerWidth  - 0.5) * 60;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 40;

      gsap.to(orb, {
        x: xPct,
        y: yPct,
        duration: 1.5,
        ease: 'power1.out',
      });
    });
  }

})();
