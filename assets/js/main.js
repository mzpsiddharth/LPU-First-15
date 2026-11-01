/* ==========================================================================
   LPU First 15 — shared interactions
   Vanilla JS, no dependencies (Feather icons are loaded separately)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Feather icons
     ------------------------------------------------------------------ */
  function initIcons() {
    if (window.feather && typeof window.feather.replace === "function") {
      window.feather.replace({ "stroke-width": 2 });
    }
  }

  /* ------------------------------------------------------------------
     Storage helpers (fail-safe for private mode / file://)
     ------------------------------------------------------------------ */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* storage unavailable — interactions still work for this page view */
      }
    }
  };

  window.LPUFirst15 = window.LPUFirst15 || {};
  window.LPUFirst15.store = store;

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.getElementById("mobileNav");
    if (!toggle || !mobileNav) return;

    function close() {
      mobileNav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      var icon = toggle.querySelector("svg");
      if (icon) icon.outerHTML = '<i data-feather="menu"></i>';
      initIcons();
    }

    function open() {
      mobileNav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      var icon = toggle.querySelector("svg");
      if (icon) icon.outerHTML = '<i data-feather="x"></i>';
      initIcons();
    }

    toggle.addEventListener("click", function () {
      if (mobileNav.hidden) {
        open();
      } else {
        close();
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !mobileNav.hidden) {
        close();
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1080 && !mobileNav.hidden) close();
    });
  }

  /* ------------------------------------------------------------------
     Generic tabs
     Markup: [data-tabs] > [role=tablist] [role=tab] + [data-panel]
     ------------------------------------------------------------------ */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;

      function activate(tab, focus) {
        tabs.forEach(function (item) {
          var selected = item === tab;
          item.setAttribute("aria-selected", selected ? "true" : "false");
          item.setAttribute("tabindex", selected ? "0" : "-1");
          var panel = document.getElementById(item.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
        if (focus) tab.focus();
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
          activate(tab, false);
        });
        tab.addEventListener("keydown", function (event) {
          var next = null;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            next = tabs[(index + 1) % tabs.length];
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            next = tabs[(index - 1 + tabs.length) % tabs.length];
          } else if (event.key === "Home") {
            next = tabs[0];
          } else if (event.key === "End") {
            next = tabs[tabs.length - 1];
          }
          if (next) {
            event.preventDefault();
            activate(next, true);
          }
        });
      });

      var initial = tabs.filter(function (tab) {
        return tab.getAttribute("aria-selected") === "true";
      })[0] || tabs[0];

      function tabForHash() {
        var hash = window.location.hash.replace("#", "");
        if (!hash) return null;
        return tabs.filter(function (tab) {
          return tab.getAttribute("aria-controls") === hash || tab.id === hash;
        })[0] || null;
      }

      function syncFromHash(scroll) {
        var match = tabForHash();
        if (!match) return false;
        activate(match, false);
        if (scroll) {
          var panel = document.getElementById(match.getAttribute("aria-controls"));
          if (panel && panel.scrollIntoView) {
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        return true;
      }

      activate(initial, false);
      syncFromHash(false);

      window.addEventListener("hashchange", function () {
        syncFromHash(true);
      });
    });
  }

  /* ------------------------------------------------------------------
     Persistent checklists
     Markup:
       [data-store="group-name"] containing inputs with data-key
       [data-progress-bar="group-name"] + [data-progress-text="group-name"]
     ------------------------------------------------------------------ */
  function initChecklists() {
    var lists = document.querySelectorAll("[data-store]");
    if (!lists.length) return;

    lists.forEach(function (list) {
      var group = list.getAttribute("data-store");
      var key = "lpuFirst15:checklist:" + group;
      var legacyKey = "skilly:checklist:" + group;
      var boxes = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"][data-key]'));
      var saved = store.get(key, null);
      if (saved === null) {
        saved = store.get(legacyKey, null);
        if (saved) store.set(key, saved);
      }
      saved = saved || {};

      boxes.forEach(function (box) {
        var itemKey = box.getAttribute("data-key");
        if (saved && saved[itemKey]) box.checked = true;
        box.addEventListener("change", function () {
          var current = store.get(key, {});
          current[itemKey] = box.checked;
          store.set(key, current);
          updateProgress(group);
          updateGroupComplete(list, boxes);
        });
      });

      updateProgress(group);
      updateGroupComplete(list, boxes);
    });

    function updateGroupComplete(list, boxes) {
      var done = boxes.filter(function (box) {
        return box.checked;
      }).length;
      var complete = boxes.length > 0 && done === boxes.length;
      list.classList.toggle("is-complete", complete);
      var card = list.closest("[data-checklist-card]");
      if (card) {
        var status = card.querySelector("[data-complete-badge]");
        if (status) status.hidden = !complete;
      }
    }

    function updateProgress(group) {
      var list = document.querySelector('[data-store="' + group + '"]');
      if (!list) return;
      var boxes = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"][data-key]'));
      var done = boxes.filter(function (box) {
        return box.checked;
      }).length;
      var total = boxes.length;
      var pct = total ? Math.round((done / total) * 100) : 0;

      document.querySelectorAll('[data-progress-bar="' + group + '"]').forEach(function (bar) {
        bar.style.width = pct + "%";
      });

      document.querySelectorAll('[data-progress-text="' + group + '"]').forEach(function (text) {
        text.textContent = done + " of " + total + " complete";
        text.classList.toggle("progress-text--done", total > 0 && done === total);
      });

      var label = list.getAttribute("data-progress-label") || "items";
      document.querySelectorAll('[data-progress-label="' + group + '"]').forEach(function (node) {
        node.textContent = total ? done + "/" + total + " " + label : "0 " + label;
      });
    }

    document.querySelectorAll("[data-reset-group]").forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.getAttribute("data-reset-group");
        store.set("lpuFirst15:checklist:" + group, {});
        store.set("skilly:checklist:" + group, {});
        var list = document.querySelector('[data-store="' + group + '"]');
        if (!list) return;
        list.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
          box.checked = false;
        });
        updateProgress(group);
        updateGroupComplete(list, Array.prototype.slice.call(list.querySelectorAll("input")));
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ------------------------------------------------------------------
     Misc: current year, print buttons, external links
     ------------------------------------------------------------------ */
  function initMisc() {
    document.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });

    document.querySelectorAll("[data-print]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.print();
      });
    });

    document.querySelectorAll('a[href^="http"]').forEach(function (link) {
      if (!link.hasAttribute("target")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    initIcons();
    initNav();
    initTabs();
    initChecklists();
    initReveal();
    initMisc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
