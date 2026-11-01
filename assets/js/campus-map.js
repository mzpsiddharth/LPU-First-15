/* LPU First 15 — classroom number decoder for the Google My Maps embed. */
(function () {
  "use strict";
  var form = document.getElementById("finderForm");
  var input = document.getElementById("roomInput");
  var result = document.getElementById("finderResult");
  if (!form || !input || !result) return;

  function ordinal(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + "th";
    switch (n % 10) {
      case 1: return n + "st";
      case 2: return n + "nd";
      case 3: return n + "rd";
      default: return n + "th";
    }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function decode(raw) {
    var cleaned = String(raw || "").toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/\\bblock\\b/g, " ")
      .replace(/\\broom\\b/g, " ")
      .trim();
    if (!cleaned) return { error: "Enter a room number such as 34-501." };
    var tokens = cleaned.split(/[^0-9]+/).filter(Boolean);
    var block, room;
    if (tokens.length >= 2) {
      block = parseInt(tokens[0], 10);
      room = parseInt(tokens[1], 10);
    } else if (tokens.length === 1 && (tokens[0].length === 5 || tokens[0].length === 6)) {
      var digits = tokens[0];
      var blockDigits = digits.length === 5 ? 2 : 3;
      block = parseInt(digits.slice(0, blockDigits), 10);
      room = parseInt(digits.slice(blockDigits), 10);
    } else {
      return { error: "Use the format block-room, for example 34-501." };
    }
    if (!Number.isFinite(block) || block < 1 || block > 99) return { error: "The block number should be between 1 and 99." };
    if (!Number.isFinite(room) || room < 1 || room > 9999) return { error: "The room number should be between 1 and 9999." };
    return { block: block, room: room, floor: Math.floor(room / 100), classroom: ((room - 1) % 100) + 1 };
  }
  function run(raw) {
    var parsed = decode(raw);
    input.setAttribute("aria-invalid", parsed.error ? "true" : "false");
    if (parsed.error) {
      result.innerHTML = '<div class="result-card result-card--error"><p class="small"><strong>Check the room number.</strong> ' + escapeHtml(parsed.error) + '</p></div>';
      return;
    }
    var floor = parsed.floor === 0 ? "Ground Floor" : ordinal(parsed.floor) + " floor";
    result.innerHTML =
      '<div class="result-card">' +
      '<div class="result-line" aria-live="polite">' +
      '<span>📍 Block: <strong>Block ' + parsed.block + '</strong></span>' +
      '<span class="result-sep">|</span>' +
      '<span>🏢 Floor: <strong>' + floor + '</strong></span>' +
      '<span class="result-sep">|</span>' +
      '<span>🚪 Room: <strong>' + parsed.room + '</strong> <span class="tiny">(Classroom ' + parsed.classroom + ')</span></span>' +
      '</div>' +
      '<p class="tiny mt-2">In the map above, search for <strong>Block ' + parsed.block + '</strong> to locate the building. Confirm the exact room and floor against your timetable or induction sheet.</p>' +
      '</div>';
  }
  form.addEventListener("submit", function (event) { event.preventDefault(); run(input.value); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-example]"), function (button) {
    button.addEventListener("click", function () { input.value = button.getAttribute("data-example"); run(input.value); });
  });
  var params = new URLSearchParams(window.location.search);
  if (params.get("room")) { input.value = params.get("room"); run(input.value); }
})();
