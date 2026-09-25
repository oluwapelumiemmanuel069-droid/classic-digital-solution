/* ============================================================
   EDITABLE SITE CONFIG — change these, the site updates.
   ============================================================ */
const SITE_CONFIG = {
  status: "Available for select projects", // e.g. "Booked until Nov — waitlist open"
  location: "Remote · working worldwide",
  availability: "Booking 1–2 projects for next quarter",
  // Messages are delivered here via FormSubmit (free, no backend).
  // After deploying, submit the form once yourself to activate it (check inbox + spam).
  email: "oluwapelumiemmanuel069@gmail.com",
  whatsapp: "2348140142437", // your WhatsApp number, no "+" — used for the chat button
};

/* Apply config */
document.getElementById("status-text").textContent = SITE_CONFIG.status;
document.getElementById("meta-location").textContent = SITE_CONFIG.location;
document.getElementById("meta-availability").textContent = SITE_CONFIG.availability;
const emailLink = document.getElementById("contact-email");
const emailConfigured = SITE_CONFIG.email && !SITE_CONFIG.email.includes("YOUR_GMAIL_HERE");
emailLink.textContent = emailConfigured ? SITE_CONFIG.email : "Add your Gmail in script.js";
emailLink.href = emailConfigured ? `mailto:${SITE_CONFIG.email}` : "#contact-form";
const waLink = document.getElementById("contact-whatsapp");
if (waLink && SITE_CONFIG.whatsapp) {
  waLink.href = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent("Hi Emmanuel, I found Classic Digital Solution online and have a problem to solve.")}`;
  waLink.textContent = "+234 814 014 2437";
}
document.getElementById("year").textContent = new Date().getFullYear();

/* Mobile nav */
const toggle = document.querySelector(".nav-toggle");
const navList = document.getElementById("nav-list");
toggle.addEventListener("click", () => {
  const open = navList.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
navList.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navList.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

/* Subtle scroll reveal — fast, IntersectionObserver, once */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* Contact form — sends to Gmail via FormSubmit (free, no backend) + WhatsApp fallback */
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
const submitBtn = document.getElementById("form-submit");
const waFallback = document.getElementById("wa-fallback");

function setError(id, msg) {
  const field = document.getElementById(id).closest(".field");
  const err = document.querySelector(`[data-error-for="${id}"]`);
  if (err) err.textContent = msg || "";
  field.classList.toggle("field-invalid", Boolean(msg));
  document.getElementById(id).setAttribute("aria-invalid", msg ? "true" : "false");
}

function updateWaFallback() {
  if (!waFallback) return;
  const name = document.getElementById("f-name").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const type = document.getElementById("f-type").value;
  const message = document.getElementById("f-msg").value.trim();
  const text = `Hi Emmanuel (Classic Digital Solution), I'm ${name || "[my name]"} (${email || "[my email]"}). I need: ${type}. Details: ${message || "[describe here]"}`;
  waFallback.href = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}
["f-name", "f-email", "f-type", "f-msg"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateWaFallback);
});
updateWaFallback();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("f-name").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const type = document.getElementById("f-type").value;
  const message = document.getElementById("f-msg").value.trim();
  let ok = true;

  setError("f-name", name ? "" : "Please add your name.");
  if (!name) ok = false;
  setError("f-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please add a valid email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;
  setError("f-msg", message.length >= 10 ? "" : "A sentence or two helps me reply well (10+ characters).");
  if (message.length < 10) ok = false;
  if (!ok) {
    note.textContent = "Please fix the highlighted fields.";
    note.className = "form-note error";
    return;
  }

  // If Gmail not configured yet, guide via WhatsApp instead of failing silently
  const gmailReady = SITE_CONFIG.email && !SITE_CONFIG.email.includes("YOUR_GMAIL_HERE");
  if (!gmailReady) {
    note.textContent = "Heads up: add your Gmail in script.js (SITE_CONFIG.email) to enable direct delivery. Meanwhile, use WhatsApp below — your message is pre-filled.";
    note.className = "form-note error";
    updateWaFallback();
    waFallback.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  note.textContent = "Sending your message…";
  note.className = "form-note";

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(SITE_CONFIG.email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        need: type,
        message,
        _subject: `New enquiry — ${type} — ${name} (Classic Digital Solution)`,
        _template: "table",
        _captcha: "false",
      }),
    });
    if (!res.ok) throw new Error("send failed");
    note.textContent = "Message sent — thanks, Emmanuel will reply within 1–2 business days. Prefer faster? Use WhatsApp below.";
    note.className = "form-note success";
    form.reset();
    updateWaFallback();
  } catch (err) {
    // Graceful fallback: open WhatsApp with the message pre-filled
    updateWaFallback();
    note.textContent = "Couldn't send automatically — tap 'Send via WhatsApp' below, your message is ready to go.";
    note.className = "form-note error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Let's talk";
  }
});
