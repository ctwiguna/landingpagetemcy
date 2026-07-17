/* ==========================================================================
   Temcy Laundry — script.js (vanilla, ~4 KB, tanpa dependensi)
   Keamanan: tanpa eval/innerHTML dinamis, semua update DOM via textContent,
   input URL divalidasi allowlist sebelum disimpan.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 1. Tracking stub (sambungkan ke GA4 nanti) ---------- */
  window.dataLayer = window.dataLayer || [];
  function trackClick(name) {
    // Hanya string statis dari atribut data-track milik kita sendiri.
    window.dataLayer.push({ event: "cta_click", cta: name, ts: Date.now() });
    if (window.console && console.info) {
      console.info("[Temcy track]", name);
    }
  }
  document.querySelectorAll("[data-track]").forEach(function (el) {
    el.addEventListener("click", function () {
      trackClick(el.getAttribute("data-track"));
    }, { passive: true });
  });

  /* ---------- 2. UTM untuk link keluar yang relevan (IG/TikTok) ---------- */
  /* Link GMaps pendek sengaja TIDAK diubah agar redirect listing tidak rusak. */
  document.querySelectorAll("a[data-utm]").forEach(function (a) {
    try {
      var url = new URL(a.href);
      url.searchParams.set("utm_source", "landing");
      url.searchParams.set("utm_campaign", "maba2026");
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

  /* ---------- 4. Countdown promo -> 31 Agustus 2026 23:59:59 WIB ---------- */
  var PROMO_END = new Date("2026-08-31T23:59:59+07:00").getTime();
  var cd = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins: document.querySelector('[data-cd="mins"]'),
    secs: document.querySelector('[data-cd="secs"]')
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function setNum(el, val) {
    if (el && el.textContent !== val) el.textContent = val;
  }
  function tick() {
    var diff = PROMO_END - Date.now();
    if (diff <= 0) {
      var wrap = document.getElementById("countdown");
      if (wrap) {
        wrap.textContent = ""; // bersihkan lalu isi pesan statis
        var p = document.createElement("p");
        p.className = "cd-fallback";
        p.textContent = "Promo maba sudah berakhir — tapi harga normal tetap ramah kantong. Mampir ya!";
        wrap.appendChild(p);
      }
      window.clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    setNum(cd.days, String(Math.floor(s / 86400)));
    setNum(cd.hours, pad(Math.floor((s % 86400) / 3600)));
    setNum(cd.mins, pad(Math.floor((s % 3600) / 60)));
    setNum(cd.secs, pad(s % 60));
  }
  var timer = null;
  if (cd.days || cd.hours || cd.mins || cd.secs) {
    tick();
    timer = window.setInterval(tick, 1000);
  }

  /* ---------- 5. Reveal saat scroll (Intersection Observer) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. Smooth scroll untuk anchor internal ---------- */
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
})();
