/* ============================================================
   PozziTech — Main JS
   Animations, interactions, header scroll
   ============================================================ */

(function () {
  'use strict';

  /* --- Header scroll effect + adaptive logo color --- */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* --- Mobile menu toggle --- */
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', isOpen);
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
      // Garante background visível quando menu está aberto
      if (!isOpen && header) {
        header.classList.add('scrolled');
      } else if (isOpen && header && window.scrollY <= 40) {
        header.classList.remove('scrolled');
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        if (header && window.scrollY <= 40) {
          header.classList.remove('scrolled');
        }
      });
    });
  }

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --- Reveal on scroll (Intersection Observer) --- */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);
      if (!answer) return;

      // Close all others
      document.querySelectorAll('.faq-btn').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherId = otherBtn.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherId);
          if (otherAnswer) otherAnswer.classList.add('hidden');
          const otherIcon = otherBtn.querySelector('.faq-icon');
          if (otherIcon) otherIcon.style.transform = '';
        }
      });

      const opening = !isExpanded;
      btn.setAttribute('aria-expanded', String(opening));
      answer.classList.toggle('hidden', !opening);
      const icon = btn.querySelector('.faq-icon');
      if (icon) icon.style.transform = opening ? 'rotate(180deg)' : '';
    });
  });

  /* --- Counter animation for stats --- */
  function animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    const update = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = target * eased;

      el.textContent = isFloat
        ? current.toFixed(1)
        : Math.floor(current).toLocaleString('pt-BR');

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  /* --- Observe stat numbers and animate on reveal --- */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.dataset.count;
      if (!raw) return;
      const target = parseFloat(raw);
      animateCounter(el, target);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => {
    statObserver.observe(el);
  });

  /* --- Stagger delay for grid items --- */
  document.querySelectorAll('.grid .reveal, .grid-cols-2 .reveal, .grid-cols-3 .reveal').forEach((el, i) => {
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = `${(i % 4) * 100}ms`;
    }
  });

  /* --- Floating WhatsApp button hide on very small screens when keyboard open --- */
  const waBtn = document.getElementById('whatsapp-float');
  if (waBtn) {
    let lastHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      const diff = lastHeight - window.innerHeight;
      waBtn.style.opacity = diff > 150 ? '0' : '1';
      lastHeight = window.innerHeight;
    });
  }

})();
