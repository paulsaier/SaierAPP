/* SAIER INTERN – Kalender Admin */
(function() {
    "use strict";

    async function istAdmin() {
        if (typeof supabaseClient === "undefined") return false;
        const { data: s } = await supabaseClient.auth.getSession();
        const u = s?.session?.user;
        if (!u) return false;

        const { data, error } = await supabaseClient
            .from("employees")
            .select("is_admin")
            .eq("user_id", u.id)
            .maybeSingle();

        return !error && data?.is_admin === true;
    }

    function plus() {
        if (document.getElementById("kalenderAdminPlusButton")) return;

        const k = document.querySelector("#kalender .seiten-kopf");
        if (!k) return;

        k.style.position = "relative";

        const b = document.createElement("button");
        b.id = "kalenderAdminPlusButton";
        b.type = "button";
        b.className = "button button-secondary";
        b.setAttribute("aria-label", "Neues Ereignis erstellen");
        b.title = "Neues Ereignis erstellen";
        b.style.cssText =
            "position:absolute;right:0;top:0;width:42px;height:42px;padding:0;border:1px solid var(--saier-gruen);border-radius:12px;background:var(--weiss);color:var(--saier-gruen);display:flex;align-items:center;justify-content:center;cursor:pointer";
        b.innerHTML = '<i data-lucide="plus"></i>';
        b.onclick = open;

        k.appendChild(b);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    function modal() {
        if (document.getElementById("kalenderAdminEreignisModal")) return;

        const m = document.createElement("div");
        m.id = "kalenderAdminEreignisModal";
        m.className = "passwort-modal";
        m.style.display = "none";

        m.innerHTML = `
            <div class="passwort-modal-hintergrund" onclick="kalenderAdminPopupSchliessen()"></div>
            <div class="passwort-modal-box" role="dialog" aria-modal="true">
                <div class="passwort-modal-kopf">
                    <div>
                        <h2 style="margin:0;">Neues Ereignis</h2>
                        <p style="margin:5px 0 0;">Ereignis für alle Mitarbeiter erstellen</p>
                    </div>
                    <button type="button" class="passwort-modal-schliessen" onclick="kalenderAdminPopupSchliessen()" aria-label="Fenster schließen">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="passwort-modal-inhalt">
                    <form id="kalenderAdminEreignisForm">
                        <div class="admin-form-feld">
                            <label for="kalenderAdminTitel">Titel</label>
                            <input type="text" id="kalenderAdminTitel" maxlength="150" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="kalenderAdminDatum">Datum</label>
                            <input type="date" id="kalenderAdminDatum" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="kalenderAdminBeschreibung">Beschreibung</label>
                            <textarea id="kalenderAdminBeschreibung" rows="4" maxlength="2000" placeholder="Optional"></textarea>
                        </div>

                        <label class="admin-benutzer-checkbox" style="margin-top:12px;">
                            <input type="checkbox" id="kalenderAdminAnmeldungErlaubt">
                            <span class="admin-benutzer-checkbox-box"></span>
                            <span class="admin-benutzer-checkbox-text">Anmeldung für Mitarbeiter erlauben</span>
                        </label>

                        <div id="kalenderAdminFehler" style="display:none;margin-top:16px;"></div>
                        <div id="kalenderAdminErfolg" style="display:none;margin-top:16px;"></div>

                        <div class="kalender-admin-footer">
                            <button type="button" class="button button-secondary" onclick="kalenderAdminPopupSchliessen()">Abbrechen</button>
                            <button type="submit" class="button button-primary" id="kalenderAdminSpeichern">Ereignis erstellen</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(m);

        document
            .getElementById("kalenderAdminEreignisForm")
            .addEventListener("submit", save);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    function editModal() {
        if (document.getElementById("kalenderAdminBearbeitenModal")) return;

        const m = document.createElement("div");
        m.id = "kalenderAdminBearbeitenModal";
        m.className = "passwort-modal";
        m.style.display = "none";

        m.innerHTML = `
            <div class="passwort-modal-hintergrund" onclick="kalenderAdminBearbeitenSchliessen()"></div>
            <div class="passwort-modal-box" role="dialog" aria-modal="true">
                <div class="passwort-modal-kopf">
                    <div>
                        <h2 style="margin:0;">Ereignis bearbeiten</h2>
                        <p style="margin:5px 0 0;">Änderungen werden für alle Mitarbeiter übernommen</p>
                    </div>
                    <button type="button" class="passwort-modal-schliessen" onclick="kalenderAdminBearbeitenSchliessen()" aria-label="Fenster schließen">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="passwort-modal-inhalt">
                    <form id="kalenderAdminBearbeitenForm">
                        <input type="hidden" id="kalenderAdminBearbeitenId">

                        <div class="admin-form-feld">
                            <label for="kalenderAdminBearbeitenTitel">Titel</label>
                            <input type="text" id="kalenderAdminBearbeitenTitel" maxlength="150" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="kalenderAdminBearbeitenDatum">Datum</label>
                            <input type="date" id="kalenderAdminBearbeitenDatum" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="kalenderAdminBearbeitenBeschreibung">Beschreibung</label>
                            <textarea id="kalenderAdminBearbeitenBeschreibung" rows="4" maxlength="2000" placeholder="Optional"></textarea>
                        </div>

                        <label class="admin-benutzer-checkbox" style="margin-top:12px;">
                            <input type="checkbox" id="kalenderAdminBearbeitenAnmeldungErlaubt">
                            <span class="admin-benutzer-checkbox-box"></span>
                            <span class="admin-benutzer-checkbox-text">Anmeldung für Mitarbeiter erlauben</span>
                        </label>

                        <div id="kalenderAdminBearbeitenFehler" style="display:none;margin-top:16px;"></div>
                        <div id="kalenderAdminBearbeitenErfolg" style="display:none;margin-top:16px;"></div>

                        <div class="kalender-admin-footer">
                            <button type="button" class="button button-secondary" onclick="kalenderAdminBearbeitenSchliessen()">Abbrechen</button>
                            <button type="submit" class="button button-primary" id="kalenderAdminBearbeitenSpeichern">Änderungen speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(m);

        document
            .getElementById("kalenderAdminBearbeitenForm")
            .addEventListener("submit", bearbeitenSpeichern);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    function today() {
        const d = new Date();
        return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
    }

    function open() {
        modal();

        const m = document.getElementById("kalenderAdminEreignisModal");
        document.getElementById("kalenderAdminEreignisForm").reset();
        document.getElementById("kalenderAdminDatum").value = today();

        m.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function close() {
        const m = document.getElementById("kalenderAdminEreignisModal");
        if (m) m.style.display = "none";
        document.body.style.overflow = "";
    }

    function bearbeitenOeffnen(termin) {
        if (!termin || !termin.id) return;

        editModal();

        document.getElementById("kalenderAdminBearbeitenId").value = termin.id;
        document.getElementById("kalenderAdminBearbeitenTitel").value = termin.title || "";
        document.getElementById("kalenderAdminBearbeitenDatum").value = termin.event_date || "";
        document.getElementById("kalenderAdminBearbeitenBeschreibung").value = termin.description || "";
        document.getElementById("kalenderAdminBearbeitenAnmeldungErlaubt").checked =
            termin.signup_allowed === true;

        document.getElementById("kalenderAdminBearbeitenFehler").style.display = "none";
        document.getElementById("kalenderAdminBearbeitenErfolg").style.display = "none";

        document.getElementById("kalenderAdminBearbeitenModal").style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function bearbeitenSchliessen() {
        const m = document.getElementById("kalenderAdminBearbeitenModal");
        if (m) m.style.display = "none";
        document.body.style.overflow = "";
    }

    async function save(e) {
        e.preventDefault();

        const err = document.getElementById("kalenderAdminFehler");
        const ok = document.getElementById("kalenderAdminErfolg");
        const b = document.getElementById("kalenderAdminSpeichern");

        err.style.display = "none";
        ok.style.display = "none";

        const title = document.getElementById("kalenderAdminTitel").value.trim();
        const date = document.getElementById("kalenderAdminDatum").value;
        const desc = document.getElementById("kalenderAdminBeschreibung").value.trim() || null;
        const signup = document.getElementById("kalenderAdminAnmeldungErlaubt").checked;

        if (!title || !date) {
            err.textContent = "Bitte Titel und Datum ausfüllen.";
            err.style.display = "block";
            return;
        }

        b.disabled = true;
        b.textContent = "Wird erstellt …";

        try {
            if (!(await istAdmin())) {
                throw new Error("Nur Administratoren dürfen Ereignisse erstellen.");
            }

            const { data: s } = await supabaseClient.auth.getSession();
            const u = s?.session?.user;

            if (!u) {
                throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
            }

            const { error } = await supabaseClient
                .from("calendar_events")
                .insert({
                    title,
                    event_date: date,
                    description: desc,
                    event_type: "event",
                    created_by: u.id,
                    signup_allowed: signup
                });

            if (error) throw error;

            ok.textContent = "Ereignis erfolgreich erstellt.";
            ok.style.display = "block";

            if (typeof window.kalenderTermineLaden === "function") {
                await window.kalenderTermineLaden();
            } else {
                window.location.reload();
            }

            setTimeout(close, 900);
        } catch (x) {
            console.error(x);
            err.textContent = x.message || "Das Ereignis konnte nicht erstellt werden.";
            err.style.display = "block";
        } finally {
            b.disabled = false;
            b.textContent = "Ereignis erstellen";
        }
    }

    async function bearbeitenSpeichern(e) {
        e.preventDefault();

        const err = document.getElementById("kalenderAdminBearbeitenFehler");
        const ok = document.getElementById("kalenderAdminBearbeitenErfolg");
        const b = document.getElementById("kalenderAdminBearbeitenSpeichern");

        err.style.display = "none";
        ok.style.display = "none";

        const id = document.getElementById("kalenderAdminBearbeitenId").value;
        const title = document.getElementById("kalenderAdminBearbeitenTitel").value.trim();
        const date = document.getElementById("kalenderAdminBearbeitenDatum").value;
        const desc = document.getElementById("kalenderAdminBearbeitenBeschreibung").value.trim() || null;
        const signup = document.getElementById("kalenderAdminBearbeitenAnmeldungErlaubt").checked;

        if (!id || !title || !date) {
            err.textContent = "Bitte Titel und Datum ausfüllen.";
            err.style.display = "block";
            return;
        }

        b.disabled = true;
        b.textContent = "Wird gespeichert …";

        try {
            if (!(await istAdmin())) {
                throw new Error("Nur Administratoren dürfen Ereignisse bearbeiten.");
            }

            const { error } = await supabaseClient
                .from("calendar_events")
                .update({
                    title,
                    event_date: date,
                    description: desc,
                    signup_allowed: signup
                })
                .eq("id", id);

            if (error) throw error;

            ok.textContent = "Änderungen erfolgreich gespeichert.";
            ok.style.display = "block";

            if (typeof window.kalenderTermineLaden === "function") {
                await window.kalenderTermineLaden();
            } else {
                window.location.reload();
            }

            setTimeout(bearbeitenSchliessen, 900);
        } catch (x) {
            console.error(x);
            err.textContent = x.message || "Die Änderungen konnten nicht gespeichert werden.";
            err.style.display = "block";
        } finally {
            b.disabled = false;
            b.textContent = "Änderungen speichern";
        }
    }

    async function adminEreignisLoeschen(id) {
        if (!id) return;
        if (!window.confirm("Möchtest du dieses Ereignis wirklich löschen?")) return;

        try {
            if (!(await istAdmin())) {
                throw new Error("Nur Administratoren dürfen Ereignisse löschen.");
            }

            const { error } = await supabaseClient
                .from("calendar_events")
                .delete()
                .eq("id", id);

            if (error) throw error;

            if (typeof kalenderTermine !== "undefined") {
                kalenderTermine = kalenderTermine.filter(function(termin) {
                    return termin.id !== id;
                });
            }

            if (typeof kalenderAnzeigen === "function") {
                kalenderAnzeigen();
            }

            if (typeof kalenderPopupSchliessen === "function") {
                kalenderPopupSchliessen();
            }
        } catch (x) {
            console.error(x);
            window.alert(x.message || "Das Ereignis konnte nicht gelöscht werden.");
        }
    }

    function adminButtonsEinfuegen(termine) {
        const popup = document.getElementById("kalenderPopup");
        if (!popup || !Array.isArray(termine)) return;

        const artikel = popup.querySelectorAll(".kalender-popup-termin");

        artikel.forEach(function(element, index) {
            const termin = termine[index];
            if (!termin || !termin.id) return;

            if (!element.querySelector(".kalender-admin-aktionen")) {
                const aktionen = document.createElement("div");
                aktionen.className = "kalender-admin-aktionen";
                aktionen.style.cssText =
                    "display:flex;gap:10px;margin-top:14px;";

                const bearbeiten = document.createElement("button");
                bearbeiten.type = "button";
                bearbeiten.className = "kalender-admin-bearbeiten";
                bearbeiten.textContent = "Ereignis bearbeiten";
                bearbeiten.style.cssText =
                    "flex:1;min-height:40px;padding:8px 14px;border:1px solid var(--saier-gruen);border-radius:10px;background:var(--weiss);color:var(--text);font-family:Fira Sans,sans-serif;font-size:14px;font-weight:500;cursor:pointer;";

                bearbeiten.addEventListener("click", function() {
                    if (typeof kalenderPopupSchliessen === "function") {
                        kalenderPopupSchliessen();
                    }
                    bearbeitenOeffnen(termin);
                });

                const loeschen = document.createElement("button");
                loeschen.type = "button";
                loeschen.className = "kalender-admin-loeschen";
                loeschen.textContent = "Ereignis löschen";
                loeschen.style.cssText =
                    "flex:1;min-height:40px;padding:8px 14px;border:1px solid #c9c9c9;border-radius:10px;background:#fff;color:#333;font-family:Fira Sans,sans-serif;font-size:14px;font-weight:500;cursor:pointer;";

                loeschen.addEventListener("click", function() {
                    adminEreignisLoeschen(termin.id);
                });

                aktionen.appendChild(bearbeiten);
                aktionen.appendChild(loeschen);
                element.appendChild(aktionen);
            }
        });
    }

function kalenderPopupMitAdminAktionenErweitern() {
    if (
        typeof window.kalenderPopupOeffnen !== "function" ||
        window.kalenderPopupOeffnen.__saierAdminWrapped
    ) {
        return;
    }

    const original =
        window.kalenderPopupOeffnen;

    const wrapped = async function(
        jahr,
        monat,
        tag,
        termine
    ) {
        await original(
            jahr,
            monat,
            tag,
            termine
        );

        adminButtonsEinfuegen(termine);
    };

    wrapped.__saierAdminWrapped = true;

    window.kalenderPopupOeffnen =
        wrapped;
}

    async function init() {
        if (await istAdmin()) {
            modal();
            editModal();
            plus();
            kalenderPopupMitAdminAktionenErweitern();
        }
    }

    window.kalenderAdminPopupOeffnen = open;
    window.kalenderAdminPopupSchliessen = close;
    window.kalenderAdminBearbeitenSchliessen = bearbeitenSchliessen;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
