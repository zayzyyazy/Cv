/*
  Contact form → Web3Forms (https://web3forms.com).
  GitHub Pages has no backend, so the form posts straight to Web3Forms with fetch and shows
  the result inline. The access key lives in the form's hidden "access_key" input; it is
  public by design in Web3Forms' model, it only allows sending mail to the owner's inbox.
*/
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var ENDPOINT = "https://api.web3forms.com/submit";
  var TIMEOUT_MS = 15000;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var button = form.querySelector(".cf-submit");
  var status = document.getElementById("cfStatus");
  var sending = false;

  var rules = {
    name: function (v) { return v ? "" : "Please add your name."; },
    email: function (v) {
      if (!v) return "Please add your email so I can reply.";
      return EMAIL_RE.test(v) ? "" : "That doesn't look like a valid email address.";
    },
    message: function (v) { return v ? "" : "Tell me a little about what you're trying to build or fix."; }
  };

  function setError(field, msg) {
    var err = document.getElementById(field.id + "-err");
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    field.closest(".cf-field").classList.toggle("is-invalid", !!msg);
    if (err) { err.textContent = msg; err.hidden = !msg; }
  }

  function validate(field) {
    var rule = rules[field.name];
    if (!rule) return true;
    var msg = rule(field.value.trim());
    setError(field, msg);
    return !msg;
  }

  // Validate a field when the visitor leaves it; once it's flagged, re-check as they type
  Object.keys(rules).forEach(function (name) {
    var field = form.elements[name];
    field.addEventListener("blur", function () { if (field.value.trim()) validate(field); });
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") validate(field);
    });
  });

  function showStatus(kind, html) {
    status.className = "cf-status cf-status--" + kind;
    status.innerHTML = html;
    status.hidden = false;
  }

  function setSending(on) {
    sending = on;
    button.disabled = on;
    form.setAttribute("aria-busy", String(on));
    button.textContent = on ? "Sending…" : "Send message";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return; // no duplicate submissions while a request is in flight

    var invalid = Object.keys(rules)
      .map(function (name) { return form.elements[name]; })
      .filter(function (field) { return !validate(field); });
    if (invalid.length) {
      status.hidden = true;
      invalid[0].focus();
      return;
    }

    // Honeypot ticked: almost certainly a bot. Pretend it worked and send nothing.
    if (form.elements.botcheck.checked) {
      form.reset();
      showStatus("ok", "<p><b>Thanks, I got your message.</b> I'll get back to you.</p>");
      return;
    }

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = typeof value === "string" ? value.trim() : value; });
    if (!data.link) delete data.link;
    data.replyto = data.email;

    setSending(true);
    status.hidden = true;

    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || json.success !== true) throw new Error(json.message || "HTTP " + res.status);
        });
      })
      .then(function () {
        form.reset();
        Object.keys(rules).forEach(function (name) { setError(form.elements[name], ""); });
        showStatus("ok", "<p><b>Thanks, I got your message.</b> I'll get back to you.</p>");
        status.focus();
      })
      .catch(function () {
        showStatus("error",
          "<p><b>Sorry, that didn't go through.</b> Your message is still here, so you can try again, " +
          'or email me directly at <a href="mailto:zaraselim04@gmail.com">zaraselim04@gmail.com</a>.</p>');
        status.focus();
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        setSending(false);
      });
  });
})();
