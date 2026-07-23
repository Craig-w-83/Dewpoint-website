(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initReveal();
    initParallax();
    initMobileMenu();
    initQuoteModal();
    initSampleReportPrefill();
    initForms();
  });

  function initIcons() {
    const tryIcons = (n) => {
      if (window.lucide) {
        window.lucide.createIcons();
      } else if (n < 120) {
        setTimeout(() => tryIcons(n + 1), 50);
      }
    };
    tryIcons(0);
  }

  function initReveal() {
    const revealEls = document.querySelectorAll('[data-reveal="true"]');
    const reveal = (el) => el.classList.add("dp-visible");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
    // Safety net: never leave content permanently hidden if the observer doesn't fire.
    setTimeout(() => revealEls.forEach(reveal), 2500);
  }

  function initParallax() {
    const graphicEl = document.getElementById("hero-graphic");
    const graphicBase = graphicEl ? graphicEl.getBoundingClientRect().top + window.scrollY : null;
    const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]")).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        el,
        baseTop: rect.top + window.scrollY,
        height: rect.height,
        speed: parseFloat(el.dataset.parallax) || 0.1,
        max: parseFloat(el.dataset.parallaxMax) || 100,
      };
    });

    const update = () => {
      const vh = window.innerHeight || 800;
      if (graphicEl && graphicBase != null) {
        const top = graphicBase - window.scrollY;
        const shift = Math.max(0, -top * 0.45 + window.scrollY * 0.14);
        graphicEl.style.transform = `translateY(${Math.min(shift, 220)}px)`;
      }
      parallaxEls.forEach(({ el, baseTop, height, speed, max }) => {
        const top = baseTop - window.scrollY;
        const centerOffset = top + height / 2 - vh / 2;
        const shift = Math.max(-max, Math.min(max, -centerOffset * speed));
        el.style.transform = `translateY(${shift}px)`;
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initMobileMenu() {
    const hamburger = document.querySelector(".dp-hamburger");
    const nav = document.querySelector(".mobile-nav");
    if (!hamburger || !nav) return;

    const close = () => {
      hamburger.classList.remove("is-open");
      nav.classList.remove("is-open");
    };
    const toggle = () => {
      hamburger.classList.toggle("is-open");
      nav.classList.toggle("is-open");
    };
    hamburger.addEventListener("click", toggle);
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  function initQuoteModal() {
    const modal = document.getElementById("quote-modal");
    const panel = modal ? modal.querySelector(".dp-modal-card") : null;
    const openBtns = document.querySelectorAll("[data-open-quote]");
    const closeBtns = document.querySelectorAll("[data-close-quote]");
    if (!modal) return;

    const open = () => modal.classList.add("is-open");
    const close = () => modal.classList.remove("is-open");

    openBtns.forEach((b) => b.addEventListener("click", open));
    closeBtns.forEach((b) => b.addEventListener("click", close));
    modal.addEventListener("click", close);
    if (panel) panel.addEventListener("click", (e) => e.stopPropagation());
  }

  function initSampleReportPrefill() {
    const triggers = document.querySelectorAll("[data-sample-report]");
    const subject = document.getElementById("contact-subject");
    const message = document.getElementById("contact-message");
    const target = document.getElementById("contact");

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (subject) subject.value = "Sample report request";
        if (message) {
          message.value =
            "Hi, I'd like to request a copy of a sample survey report to see what Dewpoint provides.";
        }
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });
  }

  // Submits a form via fetch (works with Netlify Forms out of the box).
  // Falls back to a normal browser submit (to thank-you.html) if fetch fails
  // or JavaScript is unavailable.
  function initForms() {
    document.querySelectorAll("form[data-ajax-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(form);
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data).toString(),
        })
          .then(() => {
            const wrap = form.closest("[data-form-wrap]");
            if (wrap) wrap.classList.add("form-sent");
            form.reset();
          })
          .catch(() => {
            form.submit();
          });
      });
    });
  }
})();
