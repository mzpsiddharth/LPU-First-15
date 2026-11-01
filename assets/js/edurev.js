/* ==========================================================================
   LPU First 15 — EDU-Revolution page interactions
   Expand / collapse the seven-step portal guide (native <details>)
   ========================================================================== */

(function () {
  "use strict";

  function boot() {
    var accordion = document.getElementById("guideAccordion");
    if (!accordion) return;

    var steps = Array.prototype.slice.call(accordion.querySelectorAll("details"));
    var expand = document.getElementById("expandGuide");
    var collapse = document.getElementById("collapseGuide");
    if (!steps.length) return;

    function syncButtons() {
      var openCount = steps.filter(function (step) {
        return step.open;
      }).length;
      if (expand) expand.disabled = openCount === steps.length;
      if (collapse) collapse.disabled = openCount === 0;
    }

    function setAll(open) {
      steps.forEach(function (step) {
        step.open = open;
      });
      syncButtons();
    }

    if (expand) {
      expand.addEventListener("click", function () {
        setAll(true);
      });
    }

    if (collapse) {
      collapse.addEventListener("click", function () {
        setAll(false);
      });
    }

    steps.forEach(function (step) {
      step.addEventListener("toggle", syncButtons);
    });

    syncButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
