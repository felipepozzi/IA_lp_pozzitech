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

  /* --- Chat Widget --- */
  (function () {
    var chatToggle    = document.getElementById('chat-toggle');
    var chatWindow    = document.getElementById('chat-window');
    var chatCloseBtn  = document.getElementById('chat-close-btn');
    var chatInput     = document.getElementById('chat-input');
    var chatSend      = document.getElementById('chat-send');
    var chatInputArea = document.getElementById('chat-input-area');
    var chatMessages  = document.getElementById('chat-messages');
    var chatChips     = document.getElementById('chat-chips');
    var chatIconOpen  = document.getElementById('chat-icon-open');
    var chatIconClose = document.getElementById('chat-icon-close');
    var chatPulse     = document.getElementById('chat-pulse');

    if (!chatToggle || !chatWindow) return;

    var isOpen       = false;
    var isLoading    = false;
    var initialized  = false;

    // sessionId persiste durante a aba (sessionStorage)
    var sessionId = '';
    try {
      sessionId = sessionStorage.getItem('pt_chat_sid') || '';
    } catch (e) {}
    if (!sessionId) {
      sessionId = 'w' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      try { sessionStorage.setItem('pt_chat_sid', sessionId); } catch (e) {}
    }

    // ── Helpers de UI ───────────────────────────────────────

    function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    var BOT_AVATAR = '<div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style="background:rgba(79,70,229,0.4);"><svg class="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></div>';

    function appendBot(text) {
      var div = document.createElement('div');
      div.className = 'flex items-start gap-2';
      var safe = escapeHtml(text).replace(/\n/g, '<br>');
      div.innerHTML = BOT_AVATAR +
        '<div class="rounded-2xl rounded-tl-none px-4 py-2.5 text-sm leading-relaxed" style="background:#e8e9f0;color:#1a1a2e;max-width:240px;">' + safe + '</div>';
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function appendUser(text) {
      var div = document.createElement('div');
      div.className = 'flex justify-end';
      div.innerHTML = '<div class="rounded-2xl rounded-tr-none px-4 py-2.5 text-sm text-white" style="background:linear-gradient(135deg,#4F46E5,#7C3AED);max-width:240px;">' + escapeHtml(text) + '</div>';
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function showTyping() {
      var div = document.createElement('div');
      div.id = 'chat-typing';
      div.className = 'flex items-start gap-2';
      div.innerHTML = BOT_AVATAR +
        '<div class="rounded-2xl rounded-tl-none px-4 py-3" style="background:#e8e9f0;">' +
        '<div class="flex gap-1 items-center">' +
        '<span class="w-2 h-2 rounded-full animate-bounce" style="background:#6b7280;animation-delay:0ms"></span>' +
        '<span class="w-2 h-2 rounded-full animate-bounce" style="background:#6b7280;animation-delay:150ms"></span>' +
        '<span class="w-2 h-2 rounded-full animate-bounce" style="background:#6b7280;animation-delay:300ms"></span>' +
        '</div></div>';
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function hideTyping() {
      var el = document.getElementById('chat-typing');
      if (el) el.remove();
    }

    function setInputMode(disabled) {
      chatInput.disabled = disabled;
      chatSend.disabled = disabled;
      chatInput.placeholder = disabled ? 'Selecione uma opção acima...' : 'Digite sua mensagem...';
      chatInput.style.opacity = disabled ? '0.5' : '1';
    }

    // ── Chips ───────────────────────────────────────────────

    function renderChips(chips) {
      chatChips.innerHTML = '';
      if (!chips || !chips.length) {
        chatChips.classList.add('hidden');
        chatChips.classList.remove('flex');
        return;
      }
      chatChips.classList.remove('hidden');
      chatChips.classList.add('flex');

      chips.forEach(function (chip) {
        var btn = document.createElement('button');
        btn.className = 'px-4 py-2 rounded-full text-sm text-white/80 border border-white/20 ' +
          'hover:border-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 ' +
          'mt-2 leading-snug';
        btn.textContent = chip.label;
        btn.addEventListener('click', function () {
          if (isLoading) return;
          onChipClick(chip.label, chip.value || chip.label);
        });
        chatChips.appendChild(btn);
      });
      scrollToBottom();
    }

    function clearChips() {
      chatChips.innerHTML = '';
      chatChips.classList.add('hidden');
      chatChips.classList.remove('flex');
    }

    function onChipClick(label, value) {
      clearChips();
      setInputMode(false);
      appendUser(label);
      callAPI({ selectedChip: value });
    }

    // ── Abertura / fechamento ────────────────────────────────

    function openChat() {
      isOpen = true;
      chatWindow.classList.remove('hidden');
      chatWindow.style.display = 'flex';
      chatIconOpen.classList.add('hidden');
      chatIconClose.classList.remove('hidden');
      if (chatPulse) chatPulse.style.display = 'none';
      scrollToBottom();

      if (!initialized) {
        initialized = true;
        initChat();
      } else {
        if (!chatInput.disabled) chatInput.focus();
      }
    }

    function closeChat() {
      isOpen = false;
      chatWindow.style.display = 'none';
      chatIconOpen.classList.remove('hidden');
      chatIconClose.classList.add('hidden');
    }

    chatToggle.addEventListener('click', function () { isOpen ? closeChat() : openChat(); });
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', closeChat);

    // ── Inicialização (1ª abertura) ──────────────────────────

    function initChat() {
      setInputMode(true);
      showTyping();

      fetch('/api/chat/init?sessionId=' + encodeURIComponent(sessionId))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();

          if (data.greeting) {
            appendBot(data.greeting);
          }

          if (data.message) {
            showTyping();
            setTimeout(function () {
              hideTyping();
              appendBot(data.message);
              renderChips(data.chips);
              setInputMode(!!data.inputDisabled);
              if (!data.inputDisabled) chatInput.focus();
            }, 700);
          } else {
            setInputMode(false);
            chatInput.focus();
          }
        })
        .catch(function () {
          hideTyping();
          appendBot('Olá! 👋 Como posso te ajudar?');
          setInputMode(false);
          chatInput.focus();
        });
    }

    // ── Chamada à API ────────────────────────────────────────

    function callAPI(payload) {
      if (isLoading) return;
      isLoading = true;
      chatSend.disabled = true;
      clearChips();
      showTyping();

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ sessionId: sessionId }, payload)),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();

          if (data.reply) appendBot(data.reply);

          if (data.nextStep === 'limit_reached') {
            clearChips();
            if (chatInputArea) chatInputArea.style.display = 'none';
            return;
          }

          if (data.followUp) {
            // Mostra mensagem de seguimento (ex: após resposta empática da IA)
            showTyping();
            setTimeout(function () {
              hideTyping();
              if (data.followUp.message) appendBot(data.followUp.message);
              renderChips(data.followUp.chips);
              setInputMode(!!(data.followUp.inputDisabled));
              if (!data.followUp.inputDisabled) chatInput.focus();
            }, 800);
          } else {
            renderChips(data.chips);
            setInputMode(!!(data.inputDisabled));

            if (data.isLeadComplete) {
              // Lead capturado — sugere agendamento
              setTimeout(function () {
                appendBot('Tem alguma dúvida enquanto isso? Fique à vontade para perguntar! 😊');
              }, 1200);
            }

            if (!data.inputDisabled) chatInput.focus();
          }
        })
        .catch(function () {
          hideTyping();
          appendBot('Ops! Algo deu errado. Fale pelo WhatsApp 😊');
          setInputMode(false);
          chatInput.focus();
        })
        .finally(function () {
          isLoading = false;
          chatSend.disabled = false;
        });
    }

    // ── Envio de mensagem de texto ───────────────────────────

    function sendMessage() {
      if (isLoading || chatInput.disabled) return;
      var msg = chatInput.value.trim();
      if (!msg) return;
      chatInput.value = '';
      appendUser(msg);
      callAPI({ message: msg });
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  })();

  /* --- Cookie consent banner --- */
  (function () {
    var COOKIE_KEY = 'pt_cookie_consent';
    var banner = document.getElementById('cookie-banner');
    var btnAccept = document.getElementById('cookie-accept');
    var btnReject = document.getElementById('cookie-reject');

    if (!banner) return;

    function getConsent() {
      try { return localStorage.getItem(COOKIE_KEY); } catch (e) { return null; }
    }

    function setConsent(val) {
      try { localStorage.setItem(COOKIE_KEY, val); } catch (e) {}
    }

    function hideBanner() {
      banner.style.display = 'none';
    }

    // Show banner if no decision stored yet
    if (!getConsent()) {
      banner.style.display = 'block';
    }

    if (btnAccept) {
      btnAccept.addEventListener('click', function () {
        setConsent('accepted');
        hideBanner();
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', function () {
        setConsent('rejected');
        hideBanner();
      });
    }
  })();

})();
