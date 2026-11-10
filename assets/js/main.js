(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("to-top");
  const yearEl = document.getElementById("year");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Current year ---------- */

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Header state + scrollspy ---------- */

  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  let ticking = false;

  const updateOnScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    header.classList.toggle("is-scrolled", scrollY > 40);
    toTop.classList.toggle("is-visible", scrollY > 600);

    let activeId = "";
    const offset = 150;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        activeId = `#${section.id}`;
      }
    });

    const nearBottom =
      window.innerHeight + scrollY >= document.documentElement.scrollHeight - 80;
    if (nearBottom && sections.length) {
      activeId = `#${sections[sections.length - 1].id}`;
    }

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === activeId);
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateOnScroll();

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Mobile navigation ---------- */

  const closeNav = () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Otwórz menu");
    document.body.classList.remove("is-locked");
  };

  const openNav = () => {
    nav.classList.add("is-open");
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Zamknij menu");
    document.body.classList.add("is-locked");
  };

  burger.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  navLinks.forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      burger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960 && nav.classList.contains("is-open")) {
      closeNav();
    }
  });

  /* ---------- Menu tabs ---------- */

  const tabs = Array.from(document.querySelectorAll(".menu-tab"));
  const panels = Array.from(document.querySelectorAll(".menu-panel"));

  const activateTab = (tab) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        activateTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Opening hours ---------- */

  const schedule = {
    0: { open: 11 * 60, close: 22 * 60 },
    1: { open: 10 * 60, close: 22 * 60 },
    2: { open: 10 * 60, close: 22 * 60 },
    3: { open: 10 * 60, close: 22 * 60 },
    4: { open: 10 * 60, close: 22 * 60 },
    5: { open: 10 * 60, close: 23 * 60 },
    6: { open: 11 * 60, close: 23 * 60 },
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  };

  const statusEl = document.getElementById("open-status");
  const heroTodayEl = document.getElementById("hero-today-hours");
  const hoursList = document.getElementById("hours-list");

  const updateHours = () => {
    const now = new Date();
    const day = now.getDay();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const today = schedule[day];

    if (heroTodayEl) {
      heroTodayEl.textContent = `${formatMinutes(today.open)}-${formatMinutes(today.close)}`;
    }

    if (hoursList) {
      hoursList.querySelectorAll("li[data-day]").forEach((item) => {
        item.classList.toggle("is-today", Number(item.dataset.day) === day);
      });
    }

    if (!statusEl) return;

    statusEl.classList.remove("is-open", "is-closed");

    if (minutesNow >= today.open && minutesNow < today.close) {
      statusEl.textContent = `Otwarte do ${formatMinutes(today.close)}`;
      statusEl.classList.add("is-open");
    } else if (minutesNow < today.open) {
      statusEl.textContent = `Dziś od ${formatMinutes(today.open)}`;
      statusEl.classList.add("is-closed");
    } else {
      const nextDay = schedule[(day + 1) % 7];
      statusEl.textContent = `Zamknięte · jutro od ${formatMinutes(nextDay.open)}`;
      statusEl.classList.add("is-closed");
    }
  };

  updateHours();
  window.setInterval(updateHours, 60000);

  /* ---------- Gallery lightbox ---------- */

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  let lastFocusedElement = null;

  const openLightbox = (figure) => {
    const img = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (!img) return;

    lastFocusedElement = document.activeElement;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : "";
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.classList.remove("is-locked");
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  document.querySelectorAll(".gallery__item").forEach((figure) => {
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `Powiększ zdjęcie: ${figure.querySelector("img")?.alt || ""}`);

    figure.addEventListener("click", () => openLightbox(figure));
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(figure);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
})();
