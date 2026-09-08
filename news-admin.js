/* ========================================
   SAIER INTERN
   NEWS – ADMINISTRATION
   ======================================== */
(function () {
    "use strict";

    let newsAdminModal = null;

    function lucideAktualisieren() {
        if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
            lucide.createIcons();
        }
    }

    function newsAdminModalErstellen() {
        if (newsAdminModal) return newsAdminModal;

        newsAdminModal = document.createElement("div");
        newsAdminModal.id = "newsAdminModal";
        newsAdminModal.className = "passwort-modal";
        newsAdminModal.style.display = "none";

        newsAdminModal.innerHTML = `
            <div class="passwort-modal-hintergrund" id="newsAdminHintergrund"></div>
            <div class="passwort-modal-box" role="dialog" aria-modal="true" aria-labelledby="newsAdminModalTitel">
                <div class="passwort-modal-kopf">
                    <div class="passwort-modal-icon">
                        <i data-lucide="newspaper"></i>
                    </div>
                    <button type="button" class="passwort-modal-schliessen" id="newsAdminSchliessen" aria-label="Fenster schließen">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="passwort-modal-inhalt">
                    <span class="kleine-ueberschrift">ADMINISTRATION</span>
                    <h2 id="newsAdminModalTitel">News verwalten</h2>
                    <div id="newsAdminInhalt"></div>
                </div>
            </div>
        `;

        document.body.appendChild(newsAdminModal);

        document.getElementById("newsAdminHintergrund")?.addEventListener("click", window.adminNewsVerwaltenSchliessen);
        document.getElementById("newsAdminSchliessen")?.addEventListener("click", window.adminNewsVerwaltenSchliessen);

        lucideAktualisieren();
        return newsAdminModal;
    }

    function formularFeld(label, id, placeholder) {
        return `
            <label for="${id}" style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;">${label}</label>
            <input id="${id}" type="text" placeholder="${placeholder}" style="width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid var(--line);border-radius:10px;font:inherit;background:white;margin-bottom:16px;">
        `;
    }

    function newsVerwaltungAnzeigen() {
        const inhalt = document.getElementById("newsAdminInhalt");
        const titel = document.getElementById("newsAdminModalTitel");
        if (!inhalt) return;

        if (titel) titel.textContent = "News verwalten";

        inhalt.innerHTML = `
            <button type="button" id="newsNeueNewsButton" style="width:100%;display:flex;align-items:center;gap:12px;padding:15px;border:1px solid rgba(149,193,31,.25);border-radius:12px;background:var(--hellgruen);color:inherit;cursor:pointer;text-align:left;font:inherit;">
                <span style="width:40px;height:40px;border-radius:11px;background:white;color:var(--saier-gruen);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i data-lucide="plus"></i>
                </span>
                <span>
                    <strong style="display:block;font-size:15px;margin-bottom:3px;">Neue News erstellen</strong>
                    <small style="color:var(--grau);">Eine neue Mitteilung für SAIER INTERN anlegen.</small>
                </span>
                <i data-lucide="chevron-right" style="margin-left:auto;"></i>
            </button>
        `;

        document.getElementById("newsNeueNewsButton")?.addEventListener("click", newsNeueNewsOeffnen);
        lucideAktualisieren();
    }

    function newsNeueNewsOeffnen() {
        const inhalt = document.getElementById("newsAdminInhalt");
        const titel = document.getElementById("newsAdminModalTitel");
        if (!inhalt) return;

        if (titel) titel.textContent = "Neue News erstellen";

        const heute = new Date();
        const jahr = heute.getFullYear();
        const monat = String(heute.getMonth() + 1).padStart(2, "0");
        const tag = String(heute.getDate()).padStart(2, "0");

        inhalt.innerHTML = `
            <form id="newsNeueNewsForm">
                ${formularFeld("Titel", "newsTitel", "z. B. Sommerfest 2026")}

                <label for="newsTeaser" style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;">Kurzbeschreibung</label>
                <textarea id="newsTeaser" rows="3" placeholder="Kurzer Text, der auf der News-Übersicht angezeigt wird." style="width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid var(--line);border-radius:10px;font:inherit;resize:vertical;background:white;margin-bottom:16px;"></textarea>

                <label for="newsInhalt" style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;">Inhalt</label>
                <textarea id="newsInhalt" rows="8" placeholder="Hier kommt der vollständige Inhalt der News hinein." style="width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid var(--line);border-radius:10px;font:inherit;resize:vertical;background:white;margin-bottom:16px;"></textarea>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label for="newsDatum" style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;">Datum</label>
                        <input id="newsDatum" type="date" value="${jahr}-${monat}-${tag}" style="width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid var(--line);border-radius:10px;font:inherit;background:white;margin-bottom:16px;">
                    </div>
                    <label style="display:flex;align-items:center;gap:9px;font-size:14px;cursor:pointer;padding-top:22px;">
                        <input id="newsVeroeffentlicht" type="checkbox" style="width:18px;height:18px;">
                        Sofort veröffentlichen
                    </label>
                </div>

                <div style="display:flex;gap:10px;margin-top:4px;">
                    <button type="button" id="newsFormZurueck" style="flex:1;padding:12px;border:1px solid var(--line);border-radius:10px;background:white;font:inherit;font-weight:600;cursor:pointer;">Zurück</button>
                    <button type="submit" style="flex:1;padding:12px;border:1px solid var(--saier-gruen);border-radius:10px;background:var(--saier-gruen);color:white;font:inherit;font-weight:600;cursor:pointer;">Speichern</button>
                </div>

                <p id="newsSpeicherHinweis" style="margin:12px 0 0;color:var(--grau);font-size:12px;text-align:center;">Die Datenbank-Anbindung kommt im nächsten Schritt.</p>
            </form>
        `;

        document.getElementById("newsNeueNewsForm")?.addEventListener("submit", newsNeueNewsSpeichern);
        document.getElementById("newsFormZurueck")?.addEventListener("click", newsVerwaltungAnzeigen);
        lucideAktualisieren();
    }

    function newsNeueNewsSpeichern(event) {
        event.preventDefault();

        const titel = document.getElementById("newsTitel");
        const hinweis = document.getElementById("newsSpeicherHinweis");

        if (!titel || !titel.value.trim()) {
            titel?.focus();
            if (hinweis) hinweis.textContent = "Bitte zuerst einen Titel eingeben.";
            return;
        }

        if (hinweis) {
            hinweis.textContent = "Eingaben wurden übernommen. Die Supabase-Speicherung bauen wir als Nächstes ein.";
            hinweis.style.color = "var(--saier-gruen)";
        }
    }

    window.adminNewsVerwaltenOeffnen = function () {
        // Die eigentliche Admin-Prüfung übernimmt bereits app.js.
        const modal = newsAdminModalErstellen();
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        newsVerwaltungAnzeigen();
    };

    window.adminNewsVerwaltenSchliessen = function () {
        if (!newsAdminModal) newsAdminModal = document.getElementById("newsAdminModal");
        if (!newsAdminModal) return;
        newsAdminModal.style.display = "none";
        document.body.style.overflow = "";
    };

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && newsAdminModal && newsAdminModal.style.display !== "none") {
            window.adminNewsVerwaltenSchliessen();
        }
    });
})();
