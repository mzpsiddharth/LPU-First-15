/* ==========================================================================
   LPU First 15 — support directory filter + feedback form
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Contact directory filtering
     ------------------------------------------------------------------ */
  var contactGrid = document.getElementById("contactGrid");
  var contactSearch = document.getElementById("contactSearch");
  var contactCount = document.getElementById("contactCount");
  var contactEmpty = document.getElementById("contactEmpty");

  if (contactGrid && contactSearch) {
    var contacts = Array.prototype.slice.call(contactGrid.querySelectorAll("[data-contact]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-contact-filter]"));
    var activeCategory = "all";

    function applyContacts() {
      var query = contactSearch.value.trim().toLowerCase();
      var visible = 0;

      contacts.forEach(function (card) {
        var categoryMatch = activeCategory === "all" || card.getAttribute("data-cat") === activeCategory;
        var haystack = ((card.getAttribute("data-search") || "") + " " + card.textContent).toLowerCase();
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var show = categoryMatch && queryMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (contactCount) {
        contactCount.textContent = query || activeCategory !== "all"
          ? "Showing " + visible + " of " + contacts.length
          : contacts.length + " contacts";
      }
      if (contactEmpty) contactEmpty.hidden = visible !== 0;
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-contact-filter") || "all";
        filterButtons.forEach(function (item) {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
        applyContacts();
      });
    });

    contactSearch.addEventListener("input", applyContacts);
    applyContacts();
  }

  /* ------------------------------------------------------------------
     Feedback form
     ------------------------------------------------------------------ */
  var form = document.getElementById("feedbackForm");
  if (!form) return;

  var successPanel = document.getElementById("feedbackSuccess");
  var successRef = document.getElementById("feedbackRef");
  var copyButton = document.getElementById("feedbackCopy");
  var copyStatus = document.getElementById("feedbackCopyStatus");
  var newButton = document.getElementById("feedbackNew");
  var clearButton = document.getElementById("fbReset");
  var lastPayload = null;

  var fields = {
    name: {
      input: document.getElementById("fbName"),
      error: document.getElementById("fbNameError"),
      validate: function (value) {
        return value.trim().length >= 2 ? "" : "Please enter your name.";
      }
    },
    email: {
      input: document.getElementById("fbEmail"),
      error: document.getElementById("fbEmailError"),
      validate: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email address.";
      }
    },
    category: {
      input: document.getElementById("fbCategory"),
      error: document.getElementById("fbCategoryError"),
      validate: function (value) {
        return value ? "" : "Please choose a category.";
      }
    },
    message: {
      input: document.getElementById("fbMessage"),
      error: document.getElementById("fbMessageError"),
      validate: function (value) {
        return value.trim().length >= 10 ? "" : "Please add at least 10 characters so we can help.";
      }
    },
    consent: {
      input: document.getElementById("fbConsent"),
      error: document.getElementById("fbConsentError"),
      validate: function (_, input) {
        return input.checked ? "" : "Please tick the consent box.";
      }
    }
  };

  function setError(field, message) {
    if (!field.input) return;
    field.input.setAttribute("aria-invalid", "true");
    if (field.error) {
      field.error.textContent = message;
      field.error.classList.add("is-visible");
    }
  }

  function clearError(field) {
    if (!field.input) return;
    field.input.removeAttribute("aria-invalid");
    if (field.error) {
      field.error.textContent = "";
      field.error.classList.remove("is-visible");
    }
  }

  function validateField(key) {
    var field = fields[key];
    if (!field || !field.input) return true;
    var message = field.validate(field.input.value, field.input);
    if (message) {
      setError(field, message);
      return false;
    }
    clearError(field);
    return true;
  }

  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    if (!field.input) return;
    var eventName = field.input.tagName === "SELECT" || field.input.type === "checkbox" ? "change" : "input";
    field.input.addEventListener(eventName, function () {
      if (field.input.getAttribute("aria-invalid") === "true") validateField(key);
    });
    field.input.addEventListener("blur", function () {
      if (field.input.value || field.input.type === "checkbox") validateField(key);
    });
  });

  function buildReference() {
    var stamp = Date.now().toString(36).toUpperCase();
    return "L15-" + stamp.slice(-6);
  }

  function saveFeedback(payload) {
    try {
      var key = "lpuFirst15:feedback";
      var legacyKey = "skilly:feedback";
      var existing = JSON.parse(window.localStorage.getItem(key) || window.localStorage.getItem(legacyKey) || "[]");
      if (!Array.isArray(existing)) existing = [];
      existing.unshift(payload);
      window.localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
    } catch (err) {
      /* storage may be unavailable; the success state still works */
    }
  }

  function showSuccess(payload) {
    lastPayload = payload;
    if (successRef) successRef.textContent = payload.ref;
    form.hidden = true;
    if (successPanel) successPanel.hidden = false;
    if (copyStatus) copyStatus.textContent = "";
    if (successPanel) {
      successPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var valid = true;
    var firstInvalid = null;

    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) {
        valid = false;
        if (!firstInvalid && fields[key].input) firstInvalid = fields[key].input;
      }
    });

    if (!valid) {
      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    var payload = {
      ref: buildReference(),
      name: fields.name.input.value.trim(),
      registration: (document.getElementById("fbReg").value || "").trim(),
      email: fields.email.input.value.trim(),
      category: fields.category.input.value,
      message: fields.message.input.value.trim(),
      createdAt: new Date().toISOString()
    };

    saveFeedback(payload);
    showSuccess(payload);
  });

  form.addEventListener("reset", function () {
    window.setTimeout(function () {
      Object.keys(fields).forEach(function (key) {
        clearError(fields[key]);
      });
    }, 0);
  });

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      Object.keys(fields).forEach(function (key) {
        clearError(fields[key]);
      });
    });
  }

  if (newButton) {
    newButton.addEventListener("click", function () {
      form.reset();
      Object.keys(fields).forEach(function (key) {
        clearError(fields[key]);
      });
      if (successPanel) successPanel.hidden = true;
      form.hidden = false;
      if (copyStatus) copyStatus.textContent = "";
      if (fields.name.input) fields.name.input.focus();
    });
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      if (!lastPayload) return;
      var text =
        "Reference: " + lastPayload.ref + "\n" +
        "Name: " + lastPayload.name + "\n" +
        "Registration: " + (lastPayload.registration || "—") + "\n" +
        "Email: " + lastPayload.email + "\n" +
        "Category: " + lastPayload.category + "\n\n" +
        lastPayload.message;

      function done(ok) {
        if (copyStatus) {
          copyStatus.textContent = ok
            ? "Message copied. Paste it into an email or share it with the helpdesk."
            : "Copy failed. Select the message text manually and copy it.";
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          done(true);
        }).catch(function () {
          done(fallbackCopy(text));
        });
      } else {
        done(fallbackCopy(text));
      }
    });
  }
})();
