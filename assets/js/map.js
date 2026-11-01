/* ==========================================================================
   LPU First 15 — interactive campus map + classroom finder
   No libraries. SVG + vanilla JS.
   ========================================================================== */

(function () {
  "use strict";

  var svg = document.getElementById("campusMap");
  if (!svg) return;

  var shell = document.getElementById("mapShell");
  var canvasWrap = document.getElementById("mapCanvasWrap");
  var tooltip = document.getElementById("mapTooltip");
  var selectedCard = document.getElementById("selectedCard");
  var searchInput = document.getElementById("mapSearch");
  var searchResults = document.getElementById("mapSearchResults");
  var searchClear = document.getElementById("mapSearchClear");
  var finderForm = document.getElementById("finderForm");
  var roomInput = document.getElementById("roomInput");
  var finderResult = document.getElementById("finderResult");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

  var catLabels = { academic: "Academic block", central: "Central venue", amenity: "Amenity" };
  var catPills = { academic: "pill", central: "pill pill--violet", amenity: "pill pill--teal" };
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var buildings = Array.prototype.slice.call(svg.querySelectorAll(".map-building")).map(function (group) {
    return {
      id: group.getAttribute("data-id"),
      name: group.getAttribute("data-name") || "",
      facility: group.getAttribute("data-facility") || "",
      cat: group.getAttribute("data-cat") || "academic",
      el: group
    };
  });

  var state = {
    activeId: null,
    filter: "all",
    results: [],
    resultIndex: -1
  };

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function buildingById(id) {
    return buildings.filter(function (item) {
      return item.id === id;
    })[0];
  }

  function feather() {
    if (window.feather && typeof window.feather.replace === "function") {
      window.feather.replace({ "stroke-width": 2 });
    }
  }

  function scrollToMap() {
    if (!shell) return;
    shell.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }

  /* ------------------------------------------------------------------
     Tooltip
     ------------------------------------------------------------------ */
  function showTooltip(building, clientX, clientY) {
    if (!tooltip) return;
    var name = tooltip.querySelector(".tt-name");
    var facility = tooltip.querySelector(".tt-facility");
    var cat = tooltip.querySelector(".tt-cat");
    if (name) name.textContent = building.name;
    if (facility) facility.textContent = building.facility;
    if (cat) cat.textContent = catLabels[building.cat] || "";

    positionTooltip(clientX, clientY);
    tooltip.hidden = false;
    tooltip.classList.add("is-visible");
  }

  function positionTooltip(clientX, clientY) {
    if (!tooltip || !shell) return;
    var shellRect = shell.getBoundingClientRect();
    var width = tooltip.offsetWidth || 230;
    var height = tooltip.offsetHeight || 64;
    var x = clientX - shellRect.left;
    var y = clientY - shellRect.top;

    var half = width / 2 + 10;
    x = Math.min(Math.max(x, half), shellRect.width - half);
    if (y - height - 22 < 4) {
      y = y + 26;
      tooltip.classList.add("is-below");
    } else {
      tooltip.classList.remove("is-below");
    }

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove("is-visible");
    tooltip.hidden = true;
  }

  function anchorTooltip(building) {
    var pin = building.el.querySelector(".pin-outer");
    if (!pin) return;
    var rect = pin.getBoundingClientRect();
    showTooltip(building, rect.left + rect.width / 2, rect.top + rect.height / 4);
  }

  /* ------------------------------------------------------------------
     Selection + detail card
     ------------------------------------------------------------------ */
  function emptyDetail() {
    selectedCard.innerHTML = "";
    var wrap = el("div", "sc-empty");
    wrap.innerHTML =
      '<i data-feather="map-pin"></i>' +
      '<strong class="text-navy">No building selected</strong>' +
      '<span>Hover a pin to preview its name and facility. Click to keep it highlighted and see quick details.</span>';
    selectedCard.appendChild(wrap);
    feather();
  }

  function renderDetail(building) {
    selectedCard.innerHTML = "";

    var head = el("div", "sc-head");
    var icon = el("span", "sc-icon" + (building.cat === "amenity" ? " sc-icon--amenity" : building.cat === "central" ? " sc-icon--central" : ""));
    icon.innerHTML = '<i data-feather="map-pin"></i>';
    var body = el("div");
    var name = el("p", "sc-name", building.name);
    var facility = el("p", "sc-facility", building.facility);
    var pill = el("span", catPills[building.cat] || "pill", catLabels[building.cat] || "Campus");
    pill.style.marginTop = "0.4rem";
    body.appendChild(name);
    body.appendChild(facility);
    body.appendChild(pill);
    head.appendChild(icon);
    head.appendChild(body);

    var actions = el("div", "sc-actions");
    var scheduleLink = el("a", "btn btn-soft btn-sm", "Induction venues");
    scheduleLink.href = "schedule.html";
    var clearBtn = el("button", "btn btn-outline btn-sm", "Clear highlight");
    clearBtn.type = "button";
    clearBtn.addEventListener("click", clearSelection);
    actions.appendChild(scheduleLink);
    actions.appendChild(clearBtn);

    selectedCard.appendChild(head);
    selectedCard.appendChild(actions);
    feather();
  }

  function highlight(id, options) {
    var building = buildingById(id);
    if (!building) return false;

    if (state.filter !== "all" && building.cat !== state.filter) {
      setFilter("all");
    }

    buildings.forEach(function (item) {
      item.el.classList.toggle("is-active", item.id === id);
    });

    svg.classList.add("has-active");
    state.activeId = id;
    renderDetail(building);
    hideTooltip();
    updateUrl(id);

    if (options && options.scroll) scrollToMap();
    return true;
  }

  function clearSelection() {
    state.activeId = null;
    buildings.forEach(function (item) {
      item.el.classList.remove("is-active");
    });
    svg.classList.remove("has-active");
    emptyDetail();
    updateUrl(null);
  }

  function updateUrl(id) {
    if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return;
    try {
      var url = new URL(window.location.href);
      if (id) {
        url.searchParams.set("building", id);
        url.hash = "";
      } else {
        url.searchParams.delete("building");
      }
      window.history.replaceState({}, "", url);
    } catch (err) {
      /* no-op */
    }
  }

  /* ------------------------------------------------------------------
     Building hover / click / keyboard
     ------------------------------------------------------------------ */
  buildings.forEach(function (building) {
    building.el.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "touch") return;
      showTooltip(building, event.clientX, event.clientY);
    });

    building.el.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      positionTooltip(event.clientX, event.clientY);
    });

    building.el.addEventListener("pointerleave", hideTooltip);

    building.el.addEventListener("click", function () {
      highlight(building.id, { scroll: false });
    });

    building.el.addEventListener("focus", function () {
      anchorTooltip(building);
    });

    building.el.addEventListener("blur", hideTooltip);

    building.el.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        highlight(building.id, { scroll: false });
      }
      if (event.key === "Escape") {
        clearSelection();
      }
    });
  });

  if (canvasWrap) {
    canvasWrap.addEventListener("scroll", hideTooltip, { passive: true });
  }

  /* ------------------------------------------------------------------
     Category filters
     ------------------------------------------------------------------ */
  function setFilter(cat) {
    state.filter = cat;
    filterButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-filter") === cat ? "true" : "false");
    });

    buildings.forEach(function (building) {
      building.el.style.display = cat === "all" || building.cat === cat ? "" : "none";
    });

    if (state.activeId) {
      var active = buildingById(state.activeId);
      if (active && cat !== "all" && active.cat !== cat) clearSelection();
    }
    hideTooltip();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setFilter(button.getAttribute("data-filter"));
    });
  });

  /* ------------------------------------------------------------------
     Search
     ------------------------------------------------------------------ */
  function searchBuildings(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    return buildings
      .filter(function (building) {
        return (building.name + " " + building.facility + " " + catLabels[building.cat]).toLowerCase().indexOf(q) !== -1;
      })
      .slice(0, 8);
  }

  function renderResults(results) {
    state.results = results;
    state.resultIndex = results.length ? 0 : -1;
    searchResults.innerHTML = "";

    if (!results.length) {
      var empty = el("div", "search-empty", "No building matches that. Try “Block 34”, “Unipolis” or “Mess”.");
      searchResults.appendChild(empty);
      openResults();
      return;
    }

    results.forEach(function (building, index) {
      var button = el("button", "search-result");
      button.type = "button";
      button.setAttribute("role", "option");
      button.id = "map-result-" + index;
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      if (index === 0) button.classList.add("is-focused");

      var icon = el("span", "sr-pin");
      icon.innerHTML = '<i data-feather="map-pin"></i>';
      var text = el("span");
      text.appendChild(el("strong", null, building.name));
      text.appendChild(el("small", null, building.facility));

      button.appendChild(icon);
      button.appendChild(text);

      button.addEventListener("click", function () {
        chooseResult(building);
      });
      button.addEventListener("pointermove", function () {
        setResultFocus(index);
      });

      searchResults.appendChild(button);
    });

    openResults();
    feather();
  }

  function setResultFocus(index) {
    if (index < 0 || index >= state.results.length) return;
    if (index === state.resultIndex) return;
    state.resultIndex = index;
    Array.prototype.slice.call(searchResults.querySelectorAll(".search-result")).forEach(function (button, i) {
      button.classList.toggle("is-focused", i === index);
      button.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    searchInput.setAttribute("aria-activedescendant", "map-result-" + index);
    var focused = searchResults.querySelector(".search-result.is-focused");
    if (focused && focused.scrollIntoView) focused.scrollIntoView({ block: "nearest" });
  }

  function openResults() {
    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function closeResults() {
    searchResults.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
    state.resultIndex = -1;
  }

  function chooseResult(building) {
    searchInput.value = building.name;
    searchClear.hidden = false;
    closeResults();
    highlight(building.id, { scroll: false });
  }

  function runSearch() {
    var query = searchInput.value;
    searchClear.hidden = query.length === 0;
    if (!query.trim()) {
      closeResults();
      searchResults.innerHTML = "";
      return;
    }
    renderResults(searchBuildings(query));
  }

  searchInput.addEventListener("input", runSearch);
  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim()) runSearch();
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (searchResults.hidden) runSearch();
      if (state.results.length) setResultFocus(Math.min(state.resultIndex + 1, state.results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (state.results.length) setResultFocus(Math.max(state.resultIndex - 1, 0));
    } else if (event.key === "Enter") {
      if (!searchResults.hidden && state.results.length) {
        event.preventDefault();
        chooseResult(state.results[Math.max(state.resultIndex, 0)]);
      }
    } else if (event.key === "Escape") {
      closeResults();
      searchInput.blur();
    }
  });

  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    searchClear.hidden = true;
    closeResults();
    clearSelection();
    searchInput.focus();
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".map-search")) closeResults();
  });

  /* ------------------------------------------------------------------
     Classroom finder
     ------------------------------------------------------------------ */
  function ordinal(number) {
    var suffixes = ["th", "st", "nd", "rd"];
    var value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  function parseRoom(raw) {
    var cleaned = String(raw)
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/\bblock\b/g, " ")
      .replace(/\broom\b/g, " ")
      .trim();

    if (!cleaned) {
      return { error: "Enter a room number such as 34-501." };
    }

    var tokens = cleaned.split(/[^0-9]+/).filter(Boolean);

    if (tokens.length >= 2) {
      var block = parseInt(tokens[0], 10);
      var room = parseInt(tokens[1], 10);
      if (!isNaN(block) && !isNaN(room)) return { block: block, room: room };
    }

    if (tokens.length === 1) {
      var digits = tokens[0];
      if (digits.length === 5) {
        return { block: parseInt(digits.slice(0, 2), 10), room: parseInt(digits.slice(2), 10) };
      }
      if (digits.length === 6) {
        return { block: parseInt(digits.slice(0, 3), 10), room: parseInt(digits.slice(3), 10) };
      }
      return { error: "Add the room number too — for example 34-501." };
    }

    return { error: "Use the format block-room, for example 34-501." };
  }

  function floorLabel(floor) {
    return floor === 0 ? "Ground Floor" : ordinal(floor) + " Floor";
  }

  function showFinderError(message) {
    roomInput.setAttribute("aria-invalid", "true");
    finderResult.innerHTML =
      '<div class="result-card result-card--error">' +
      '<p class="small" style="color:#8a3b32"><strong>Could not read that room.</strong> ' +
      escapeHtml(message) +
      "</p>" +
      '<p class="tiny mt-1">Example: <strong>34-501</strong> → Block 34, 5th floor, Room 501 (Classroom 1).</p>' +
      "</div>";
  }

  function runFinder(event) {
    if (event) event.preventDefault();
    var raw = roomInput.value;
    var parsed = parseRoom(raw);

    if (parsed.error) {
      showFinderError(parsed.error);
      return;
    }

    var block = parsed.block;
    var room = parsed.room;

    if (block < 1 || block > 99) {
      showFinderError("The block number should be between 1 and 99.");
      return;
    }
    if (room < 1 || room > 9999) {
      showFinderError("The room number should be between 1 and 9999.");
      return;
    }

    roomInput.removeAttribute("aria-invalid");

    var floor = Math.floor(room / 100);
    var classroom = ((room - 1) % 100) + 1;
    var blockId = "block" + block;
    var building = buildingById(blockId);
    var blockName = building ? building.name : "Block " + block;

    var strip = "";
    if (floor <= 6) {
      var cells = "";
      for (var i = 0; i <= 6; i++) {
        cells += '<span class="floor-cell' + (i === floor ? " is-on" : "") + '"></span>';
      }
      strip =
        '<div class="floor-strip" aria-hidden="true">' + cells + "</div>" +
        '<div class="floor-labels" aria-hidden="true"><span>G</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>';
    }

    var note = building
      ? "Facility: <strong>" + escapeHtml(building.facility) + "</strong>. " + escapeHtml(building.name) + " is highlighted on the map above."
      : "Block " + block + " is not pinned on this simplified map. Ask the helpdesk or check your Induction Sheet for the exact venue.";

    finderResult.innerHTML =
      '<div class="result-card">' +
      '<div class="result-line" aria-live="polite">' +
      '<span>📍 Location: <strong>' + escapeHtml(blockName) + "</strong></span>" +
      '<span class="result-sep">|</span>' +
      "<span>🏢 Floor: <strong>" + floorLabel(floor) + "</strong></span>" +
      '<span class="result-sep">|</span>' +
      "<span>🚪 Room: <strong>Room " + room + "</strong> <span class=\"tiny\">(Classroom " + classroom + ")</span></span>" +
      "</div>" +
      strip +
      '<p class="tiny mt-2">' + note + "</p>" +
      '<p class="tiny mt-1">Read room numbers as <strong>[block]-[level][room]</strong>: the first digit of the room is the floor, the last two identify the classroom.</p>' +
      "</div>";

    if (building) {
      /* Keep the map and result visible together on desktop; avoid a jump on mobile. */
      highlight(building.id, { scroll: window.innerWidth >= 900 });
    }
  }

  if (finderForm) finderForm.addEventListener("submit", runFinder);

  document.querySelectorAll("[data-example]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      roomInput.value = chip.getAttribute("data-example");
      runFinder();
    });
  });

  /* ------------------------------------------------------------------
     Deep links: ?building=block35 or ?q=block
     ------------------------------------------------------------------ */
  function initFromUrl() {
    var params = new URLSearchParams(window.location.search);

    var query = params.get("q");
    if (query) {
      searchInput.value = query;
      searchClear.hidden = false;
      renderResults(searchBuildings(query));
    }

    var requested = params.get("building");
    if (requested) {
      var match = buildingById(requested.toLowerCase());
      if (!match) {
        var lower = requested.toLowerCase();
        match = buildings.filter(function (building) {
          return building.name.toLowerCase() === lower || building.name.toLowerCase().indexOf(lower) !== -1;
        })[0];
      }
      if (match) highlight(match.id, { scroll: true });
    }

    if (window.location.hash === "#finder" && roomInput) {
      window.setTimeout(function () {
        roomInput.focus({ preventScroll: true });
      }, 350);
    }
  }

  emptyDetail();
  initFromUrl();
})();
