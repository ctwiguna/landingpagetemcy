/* ==========================================================================
   Temcy Laundry — script.js
   Vanilla JS + GSAP 3.13 (self-hosted, tanpa CDN -> CSP 'self' tetap aman).
   Keamanan: tanpa eval/innerHTML dinamis, DOM update via textContent,
   input URL divalidasi allowlist. Semua animasi hormat pada
   prefers-reduced-motion dan tidak memblokir interaksi.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 0. Siap-siap animasi sebelum render (anti-FOUC) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  if (!reduceMotion) document.documentElement.classList.add("js-anim");
  else document.documentElement.classList.add("no-motion");

  /* ---------- 1. Tracking stub (sambungkan ke GA4 nanti) ---------- */
  window.dataLayer = window.dataLayer || [];
  function trackClick(name) {
    window.dataLayer.push({ event: "cta_click", cta: name, ts: Date.now() });
    if (window.console && console.info) console.info("[Temcy track]", name);
  }
  document.querySelectorAll("[data-track]").forEach(function (el) {
    el.addEventListener("click", function () {
      trackClick(el.getAttribute("data-track"));
    }, { passive: true });
  });

  /* ---------- 2. UTM untuk link keluar yang relevan (IG/TikTok) ---------- */
  document.querySelectorAll("a[data-utm]").forEach(function (a) {
    try {
      var url = new URL(a.href);
      url.searchParams.set("utm_source", "landing");
      url.searchParams.set("utm_campaign", "loyalty2026");
      a.href = url.toString();
    } catch (e) { /* biarkan href asli */ }
  });

  /* ---------- 3. Simpan parameter ?src= dari QR voucher (allowlist) ---------- */
  try {
    var src = new URLSearchParams(window.location.search).get("src");
    if (src && /^[a-z0-9_-]{1,32}$/i.test(src)) {
      window.sessionStorage.setItem("temcy_src", src.toLowerCase());
    }
  } catch (e) { /* storage bisa dimatikan user — abaikan */ }

  /* ---------- 4. (dihapus) Countdown promo MABA ---------- */

  /* ---------- 5. Smooth scroll anchor internal ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- 6. Reveal fallback: Intersection Observer ---------- */
  function initRevealFallback() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.transition = "opacity .55s ease, transform .55s ease";
          entry.target.style.opacity = 1;
          entry.target.style.transform = "none";
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================================
     7. GSAP — animasi cute
     ========================================================================== */
  function initGsap() {
    var g = window.gsap;
    g.registerPlugin(window.ScrollTrigger);

    /* --- 7a. Hero intro: title per kata + elemen lain bertahap --- */
    var title = document.getElementById("hero-title");
    if (title) {
      var words = title.textContent.trim().split(/\s+/);
      title.textContent = "";
      words.forEach(function (w, i) {
        var span = document.createElement("span");
        span.className = "w";
        span.textContent = w;
        span.style.display = "inline-block";
        title.appendChild(span);
        if (i < words.length - 1) title.appendChild(document.createTextNode(" "));
      });
      g.set(title, { opacity: 1, y: 0 });
      g.from(title.querySelectorAll(".w"), {
        y: 26, opacity: 0, rotate: 4,
        duration: 0.55, ease: "back.out(2.2)",
        stagger: 0.055, delay: 0.15
      });
    }
    g.to(".eyebrow", { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
    g.to(".promo-badge", { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.8)", delay: 0.1 });
    g.to(".hero-sub", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.55 });
    g.to(".cta-row", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.7 });
    g.to(".trust-chips", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.85 });
    g.to(".hero-media", {
      opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.35,
      onComplete: startStickerFloat
    });

    /* --- 7b. Sticker hero: pop + melayang tanpa henti --- */
    var s1 = document.querySelector(".sticker-rating");
    var s2 = document.querySelector(".sticker-wifi");
    function startStickerFloat() {
      if (s1) g.to(s1, { y: "-=7", duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      if (s2) g.to(s2, { y: "-=9", duration: 2.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.4 });
    }
    // Sticker punya transform sendiri -> dipisah dari reveal .hero-media,
    // GSAP yang mengatur rotasi dasarnya sepenuhnya.
    if (s1) {
      g.set(s1, { opacity: 0, scale: 0, rotate: -4, transformOrigin: "center" });
      g.to(s1, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2.8)", delay: 1.0, clearProps: "opacity" });
    }
    if (s2) {
      g.set(s2, { opacity: 0, scale: 0, rotate: 2.5, transformOrigin: "center" });
      g.to(s2, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2.8)", delay: 1.15, clearProps: "opacity" });
    }
    // Sticker "lari" lucu saat disentuh (mobile) / hover (desktop)
    [s1, s2].forEach(function (st) {
      if (!st) return;
      var baseRot = st === s1 ? -4 : 2.5;
      st.addEventListener("pointerenter", function () {
        g.to(st, { rotate: baseRot + 14, scale: 1.12, duration: 0.25, ease: "back.out(2.5)" });
      });
      st.addEventListener("pointerleave", function () {
        g.to(st, { rotate: baseRot, scale: 1, duration: 0.45, ease: "elastic.out(1, 0.4)" });
      });
    });

    /* --- 7c. Wobble emoji saat hover/tap --- */
    document.querySelectorAll(".emoji").forEach(function (em) {
      em.addEventListener("pointerenter", function () {
        em.classList.remove("wobble");
        void em.offsetWidth; // restart animasi CSS
        em.classList.add("wobble");
      });
    });

    /* --- 7d. Badge promo: pulse lembut mengundang klik --- */
    g.to(".promo-badge", {
      scale: 1.025, duration: 1.15, ease: "sine.inOut",
      yoyo: true, repeat: -1, delay: 1.4,
      transformOrigin: "center"
    });

    /* --- 7e. Scroll reveal per section (gantikan IO) --- */
    g.utils.toArray(".section .reveal, .marquee").forEach(function (el, i) {
      g.to(el, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* --- 7f. Kartu layanan: stagger naik + emoji bounce --- */
    g.utils.toArray(".card").forEach(function (card, i) {
      g.fromTo(card, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 0.55, delay: i * 0.12, ease: "back.out(1.6)",
        scrollTrigger: { trigger: card, start: "top 90%", once: true },
        onComplete: function () {
          var em = card.querySelector(".card-emoji");
          if (em) g.fromTo(em, { y: -14 }, { y: 0, duration: 0.7, ease: "bounce.out" });
        }
      });
      // tilt lucu saat hover (desktop) / tap
      card.addEventListener("pointerenter", function () {
        g.to(card, { y: -6, rotate: -0.6, duration: 0.25, ease: "power2.out" });
      });
      card.addEventListener("pointerleave", function () {
        g.to(card, { y: 0, rotate: 0, duration: 0.45, ease: "elastic.out(1, 0.5)" });
      });
    });

    /* --- 7h. Grid foto: pop bertahap + parallax ringan --- */
    g.utils.toArray(".photo-grid img").forEach(function (img, i) {
      g.fromTo(img, { opacity: 0, scale: 0.92, y: 26 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "back.out(1.5)",
        scrollTrigger: { trigger: img, start: "top 92%", once: true }
      });
      g.to(img, {
        y: -14, ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 1.2 }
      });
    });

    /* --- 7i. Chips fasilitas: pop kacau yang gemas --- */
    g.from(".facility-chips li", {
      opacity: 0, scale: 0.4, rotate: function () { return g.utils.random(-14, 14); },
      duration: 0.5, ease: "back.out(2.4)", stagger: 0.08,
      scrollTrigger: { trigger: ".facility-chips", start: "top 90%", once: true },
      clearProps: "opacity,scale,rotate"
    });

    /* --- 7j. Kartu rating: bintang berputar saat masuk --- */
    var ratingBig = document.querySelector(".rating-big");
    if (ratingBig) {
      g.fromTo(ratingBig, { opacity: 0, scale: 0.5, rotate: -8 }, {
        opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.45)",
        scrollTrigger: { trigger: ".rating-card", start: "top 88%", once: true }
      });
    }
    g.utils.toArray(".quote").forEach(function (q, i) {
      g.fromTo(q, { opacity: 0, y: 24, rotate: i % 2 ? 1.2 : -1.2 }, {
        opacity: 1, y: 0, rotate: 0, duration: 0.55, delay: i * 0.1, ease: "power2.out",
        scrollTrigger: { trigger: q, start: "top 92%", once: true }
      });
    });

    /* --- 7k. Tombol: squish elastis saat ditekan --- */
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointerdown", function () {
        g.to(btn, { scale: 0.94, duration: 0.08, ease: "power1.out" });
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) {
        btn.addEventListener(ev, function () {
          g.to(btn, { scale: 1, duration: 0.5, ease: "elastic.out(1.1, 0.35)" });
        });
      });
    });

    /* --- 7l. Marquee: sedikit miring mengikuti arah scroll --- */
    var marquee = document.querySelector(".marquee");
    if (marquee) {
      var proxy = { skew: 0 };
      var skewSetter = g.quickSetter(marquee, "skewX", "deg");
      window.ScrollTrigger.create({
        onUpdate: function (self) {
          var skew = g.utils.clamp(-4, 4, self.getVelocity() / -400);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            g.to(proxy, {
              skew: 0, duration: 0.7, ease: "power3",
              overwrite: true,
              onUpdate: function () { skewSetter(proxy.skew); }
            });
          }
        }
      });
    }

    /* --- 7m. Gelembung sabun naik terus-menerus --- */
    var bubbleWrap = document.querySelector(".bubbles");
    if (bubbleWrap) {
      var spawnCount = 0;
      function spawnBubble() {
        if (document.hidden) return;
        spawnCount += 1;
        if (spawnCount > 60) return; // batas hemat baterai
        var b = document.createElement("span");
        b.className = "bubble";
        var size = g.utils.random(10, 30);
        b.style.width = size + "px";
        b.style.height = size + "px";
        b.style.left = g.utils.random(2, 96) + "vw";
        bubbleWrap.appendChild(b);
        g.to(b, {
          y: -(window.innerHeight * 1.25),
          x: "+=" + g.utils.random(-50, 50),
          rotate: g.utils.random(-30, 30),
          duration: g.utils.random(6, 11),
          ease: "sine.in",
          onComplete: function () { b.remove(); }
        });
        g.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.6 });
        g.to(b, { opacity: 0, duration: 0.8, delay: g.utils.random(4.5, 8) });
      }
      window.setInterval(spawnBubble, 1900);
      spawnBubble();
    }

    /* --- 7n. Brand di topbar: bounce saat halaman dimuat --- */
    var brandDot = document.querySelector(".brand-dot");
    if (brandDot) {
      g.from(brandDot, { y: -16, duration: 0.9, ease: "bounce.out", delay: 0.2 });
      window.setInterval(function () {
        if (!document.hidden) g.to(brandDot, { rotate: 18, yoyo: true, repeat: 1, duration: 0.22, ease: "sine.inOut" });
      }, 5000);
    }
  }

  /* ---------- 8. Jalankan sesuai kondisi ---------- */
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
  } else if (hasGsap && typeof window.ScrollTrigger !== "undefined") {
    initGsap();
  } else {
    initRevealFallback();
  }
})();
