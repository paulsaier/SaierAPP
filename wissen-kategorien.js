/* SAIERAPP – Wissen Admin-Buttons */
(() => {
  "use strict";

  function applyButtonStyle() {
    document.querySelectorAll(
      '#wissen button[data-admin-action], #wissen .wissen-admin-button, #wissen button'
    ).forEach(btn => {
      const text = (btn.textContent || "").trim().toLowerCase();
      if (text.includes("hochladen") || text.includes("kategor")) {
        btn.classList.add("wissen-admin-button");
      }
    });
  }

  applyButtonStyle();

  const observer = new MutationObserver(applyButtonStyle);
  observer.observe(document.body, { childList: true, subtree: true });
})();
