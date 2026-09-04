/*
 * SAIER INTERN – Schritt 2: Benutzer auswählen und bearbeiten
 *
 * Die bestehende Benutzerliste bleibt erhalten.
 * Zusätzlich kann ein Administrator einen Benutzer auswählen und bearbeiten.
 * Löschen ist weiterhin bewusst NICHT enthalten.
 */

(function () {
    "use strict";

    function adminBenutzerBereichFinden() {
        return document.getElementById("adminBenutzerBereich");
    }

    function adminBenutzerPopupErstellen() {
        if (document.getElementById("adminBenutzerListeModal")) return;

        const modal = document.createElement("div");
        modal.id = "adminBenutzerListeModal";
        modal.className = "passwort-modal";
        modal.style.display = "none";
        modal.innerHTML = `
            <div
                class="passwort-modal-hintergrund"
                onclick="adminBenutzerListePopupSchliessen()">
            </div>

            <div
                class="passwort-modal-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="adminBenutzerListeModalTitel">

                <div class="passwort-modal-kopf">
                    <div>
                        <h2 id="adminBenutzerListeModalTitel" style="margin:0;">
                            Benutzer verwalten
                        </h2>
                        <p style="margin:5px 0 0;">
                            Vorhandene Benutzer des internen Portals
                        </p>
                    </div>

                    <button
                        type="button"
                        class="passwort-modal-schliessen"
                        onclick="adminBenutzerListePopupSchliessen()"
                        aria-label="Benutzerverwaltung schließen">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="passwort-modal-inhalt">
                    <div
                        id="adminBenutzerListeStatus"
                        style="padding-bottom:12px; color:var(--grau);">
                        Benutzer werden geladen …
                    </div>

                    <div
                        id="adminBenutzerListe"
                        style="display:flex; flex-direction:column; gap:10px; max-height:52vh; overflow-y:auto; padding-right:2px;">
                    </div>

                    <div class="admin-benutzer-footer">
                        <button
                            type="button"
                            class="button button-secondary"
                            id="adminBenutzerListeAktualisieren">
                            <i data-lucide="refresh-cw"></i>
                            Aktualisieren
                        </button>

                        <button
                            type="button"
                            class="button button-primary"
                            onclick="adminBenutzerListePopupSchliessen()">
                            Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("adminBenutzerListeAktualisieren")
            ?.addEventListener("click", adminBenutzerListeLaden);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    function adminBenutzerListePopupOeffnen() {
        adminBenutzerPopupErstellen();
        const modal = document.getElementById("adminBenutzerListeModal");
        if (!modal) return;

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        adminBenutzerListeLaden();
    }

    function adminBenutzerListePopupSchliessen() {
        const modal = document.getElementById("adminBenutzerListeModal");
        if (!modal) return;

        modal.style.display = "none";
        document.body.style.overflow = "";
    }

    function escapeHtml(wert) {
        return String(wert ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function adminBenutzerBearbeitenPopupErstellen() {
        if (document.getElementById("adminBenutzerBearbeitenModal")) return;

        const modal = document.createElement("div");
        modal.id = "adminBenutzerBearbeitenModal";
        modal.className = "passwort-modal";
        modal.style.display = "none";
        modal.innerHTML = `
            <div class="passwort-modal-hintergrund" onclick="adminBenutzerBearbeitenSchliessen()"></div>

            <div class="passwort-modal-box" role="dialog" aria-modal="true" aria-labelledby="adminBenutzerBearbeitenTitel">
                <div class="passwort-modal-kopf">
                    <div>
                        <h2 id="adminBenutzerBearbeitenTitel" style="margin:0;">Benutzer bearbeiten</h2>
                        <p style="margin:5px 0 0;">Benutzerdaten ändern</p>
                    </div>
                    <button type="button" class="passwort-modal-schliessen" onclick="adminBenutzerBearbeitenSchliessen()" aria-label="Bearbeitung schließen">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="passwort-modal-inhalt">
                    <form id="adminBenutzerBearbeitenForm">
                        <input type="hidden" id="adminBearbeitenEmployeeId">

                        <div class="admin-form-feld">
                            <label for="adminBearbeitenVorname">Vorname</label>
                            <input type="text" id="adminBearbeitenVorname" autocomplete="given-name" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="adminBearbeitenNachname">Nachname</label>
                            <input type="text" id="adminBearbeitenNachname" autocomplete="family-name" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="adminBearbeitenEmail">E-Mail-Adresse</label>
                            <input type="email" id="adminBearbeitenEmail" autocomplete="email" required>
                        </div>

                        <div class="admin-form-feld">
                            <label for="adminBearbeitenGeburtstag">Geburtsdatum</label>
                            <input type="date" id="adminBearbeitenGeburtstag">
                        </div>

                        <label class="admin-benutzer-checkbox" style="margin-top:12px;">
                            <input type="checkbox" id="adminBearbeitenGeburtstagSichtbar">
                            <span class="admin-benutzer-checkbox-box"></span>
                            <span class="admin-benutzer-checkbox-text">Geburtstag für Kollegen anzeigen</span>
                        </label>

                        <label class="admin-benutzer-checkbox" style="margin-top:12px;">
                            <input type="checkbox" id="adminBearbeitenIstAdmin">
                            <span class="admin-benutzer-checkbox-box"></span>
                            <span class="admin-benutzer-checkbox-text">Administrator</span>
                        </label>

                        <div id="adminBearbeitenFehler" style="display:none; margin-top:16px;"></div>
                        <div id="adminBearbeitenErfolg" style="display:none; margin-top:16px;"></div>

                        <div class="admin-benutzer-bearbeiten-footer">
                            <button type="button" class="button button-secondary" onclick="adminBenutzerBearbeitenSchliessen()">Abbrechen</button>
                            <button type="submit" class="button button-primary" id="adminBenutzerBearbeitenSpeichern">Speichern</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("adminBenutzerBearbeitenForm")?.addEventListener("submit", adminBenutzerBearbeitenSpeichern);

        if (typeof lucide !== "undefined") lucide.createIcons();
    }

    function adminBenutzerBearbeitenOeffnen(benutzer) {
        adminBenutzerBearbeitenPopupErstellen();

        document.getElementById("adminBearbeitenEmployeeId").value = benutzer.id || "";

        const teile = String(benutzer.name || "").trim().split(/\s+/).filter(Boolean);
        const vorname = teile.shift() || "";
        const nachname = teile.join(" ");

        document.getElementById("adminBearbeitenVorname").value = vorname;
        document.getElementById("adminBearbeitenNachname").value = nachname;
        document.getElementById("adminBearbeitenEmail").value = benutzer.email || "";

        // Vorhandenes Geburtsdatum aus Supabase übernehmen.
        // Wenn noch kein Geburtsdatum hinterlegt wurde, bleibt der bisherige
        // Standard erhalten: im Feld wird der heutige Tag vorgeschlagen.
        const geburtsdatumFeld = document.getElementById("adminBearbeitenGeburtstag");
        if (geburtsdatumFeld) {
            // Das Geburtsdatum kommt aus der Admin-RPC direkt aus employees.birthdate.
            // Falls dort noch kein Datum gespeichert ist, wird bewusst der heutige Tag
            // als Standardwert angezeigt.
            const gespeichertesGeburtsdatum = benutzer.birthdate || null;

            if (gespeichertesGeburtsdatum) {
                geburtsdatumFeld.value = String(gespeichertesGeburtsdatum).slice(0, 10);
            } else {
                const heute = new Date();
                const jahr = heute.getFullYear();
                const monat = String(heute.getMonth() + 1).padStart(2, "0");
                const tag = String(heute.getDate()).padStart(2, "0");
                geburtsdatumFeld.value = `${jahr}-${monat}-${tag}`;
            }
        }

        document.getElementById("adminBearbeitenGeburtstagSichtbar").checked = !!benutzer.birthday_visible;
        document.getElementById("adminBearbeitenIstAdmin").checked = !!benutzer.is_admin;

        document.getElementById("adminBearbeitenFehler").style.display = "none";
        document.getElementById("adminBearbeitenErfolg").style.display = "none";

        const modal = document.getElementById("adminBenutzerBearbeitenModal");
        modal.style.display = "flex";

        if (typeof lucide !== "undefined") lucide.createIcons();
    }

    function adminBenutzerBearbeitenSchliessen() {
        const modal = document.getElementById("adminBenutzerBearbeitenModal");
        if (modal) modal.style.display = "none";
    }

    async function adminBenutzerBearbeitenSpeichern(event) {
        event.preventDefault();

        const fehlerBox = document.getElementById("adminBearbeitenFehler");
        const erfolgBox = document.getElementById("adminBearbeitenErfolg");
        const button = document.getElementById("adminBenutzerBearbeitenSpeichern");

        const employeeId = document.getElementById("adminBearbeitenEmployeeId").value;
        const vorname = document.getElementById("adminBearbeitenVorname").value.trim();
        const nachname = document.getElementById("adminBearbeitenNachname").value.trim();
        const email = document.getElementById("adminBearbeitenEmail").value.trim();
        const birthdate = document.getElementById("adminBearbeitenGeburtstag").value || null;
        const birthdayVisible = document.getElementById("adminBearbeitenGeburtstagSichtbar").checked;
        const isAdmin = document.getElementById("adminBearbeitenIstAdmin").checked;

        fehlerBox.style.display = "none";
        erfolgBox.style.display = "none";

        if (!vorname || !nachname || !email) {
            fehlerBox.textContent = "Bitte Vorname, Nachname und E-Mail-Adresse ausfüllen.";
            fehlerBox.style.display = "block";
            return;
        }

        if (birthdayVisible && !birthdate) {
            fehlerBox.textContent = "Wenn der Geburtstag sichtbar sein soll, muss ein Geburtsdatum angegeben werden.";
            fehlerBox.style.display = "block";
            return;
        }

        button.disabled = true;
        button.textContent = "Wird gespeichert …";

        try {
            const { data: sessionData } = await supabaseClient.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            if (!accessToken) throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");

            const response = await fetch("https://tbcfghiegcmibwlvmfto.supabase.co/functions/v1/admin-manage-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "apikey": typeof SUPABASE_PUBLISHABLE_KEY !== "undefined" ? SUPABASE_PUBLISHABLE_KEY : ""
                },
                body: JSON.stringify({
                    employee_id: employeeId,
                    first_name: vorname,
                    last_name: nachname,
                    email,
                    birthdate,
                    birthday_visible: birthdayVisible,
                    is_admin: isAdmin
                })
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Die Änderungen konnten nicht gespeichert werden.");

            erfolgBox.textContent = "Benutzer erfolgreich geändert.";
            erfolgBox.style.display = "block";

            await adminBenutzerListeLaden();

            setTimeout(() => {
                adminBenutzerBearbeitenSchliessen();
            }, 900);
        } catch (fehler) {
            console.error("Fehler beim Bearbeiten des Benutzers:", fehler);
            fehlerBox.textContent = fehler.message || "Die Änderungen konnten nicht gespeichert werden.";
            fehlerBox.style.display = "block";
        } finally {
            button.disabled = false;
            button.textContent = "Speichern";
        }
    }

    function adminBenutzerLoeschPopupErstellen() {
        if (document.getElementById("adminBenutzerLoeschModal")) return;

        const modal = document.createElement("div");
        modal.id = "adminBenutzerLoeschModal";
        modal.className = "passwort-modal";
        modal.style.display = "none";
        modal.innerHTML = `
            <div class="passwort-modal-hintergrund" onclick="adminBenutzerLoeschPopupSchliessen()"></div>

            <div class="passwort-modal-box" role="dialog" aria-modal="true" aria-labelledby="adminBenutzerLoeschTitel">
                <div class="passwort-modal-kopf">
                    <div>
                        <h2 id="adminBenutzerLoeschTitel" style="margin:0;">Benutzer löschen</h2>
                        <p style="margin:5px 0 0;">Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
                    </div>
                    <button type="button" class="passwort-modal-schliessen" onclick="adminBenutzerLoeschPopupSchliessen()" aria-label="Löschen schließen">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="passwort-modal-inhalt">
                    <input type="hidden" id="adminBenutzerLoeschEmployeeId">
                    <p id="adminBenutzerLoeschText" style="margin:0; font-size:17px; line-height:1.5;"></p>
                    <div id="adminBenutzerLoeschFehler" style="display:none; margin-top:16px;"></div>
                    <div class="admin-benutzer-loesch-footer">
                        <button type="button" class="button button-secondary" onclick="adminBenutzerLoeschPopupSchliessen()">Abbrechen</button>
                        <button type="button" class="button button-primary" id="adminBenutzerLoeschBestaetigen">
                            <i data-lucide="trash-2"></i>
                            Benutzer löschen
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("adminBenutzerLoeschBestaetigen")?.addEventListener("click", adminBenutzerLoeschBestaetigen);

        if (typeof lucide !== "undefined") lucide.createIcons();
    }

    function adminBenutzerLoeschPopupOeffnen(benutzer) {
        adminBenutzerLoeschPopupErstellen();

        document.getElementById("adminBenutzerLoeschEmployeeId").value = benutzer.id || "";
        document.getElementById("adminBenutzerLoeschText").innerHTML =
            `Möchtest du den Benutzer <strong>${escapeHtml(benutzer.name || "Ohne Namen")}</strong> wirklich löschen?`;
        document.getElementById("adminBenutzerLoeschFehler").style.display = "none";

        const button = document.getElementById("adminBenutzerLoeschBestaetigen");
        button.disabled = false;
        button.textContent = "Benutzer löschen";

        const modal = document.getElementById("adminBenutzerLoeschModal");
        modal.style.display = "flex";

        if (typeof lucide !== "undefined") lucide.createIcons();
    }

    function adminBenutzerLoeschPopupSchliessen() {
        const modal = document.getElementById("adminBenutzerLoeschModal");
        if (modal) modal.style.display = "none";
    }

    async function adminBenutzerLoeschBestaetigen() {
        const employeeId = document.getElementById("adminBenutzerLoeschEmployeeId")?.value;
        const button = document.getElementById("adminBenutzerLoeschBestaetigen");
        const fehlerBox = document.getElementById("adminBenutzerLoeschFehler");

        if (!employeeId || !button || !fehlerBox) return;

        fehlerBox.style.display = "none";
        button.disabled = true;
        button.textContent = "Wird gelöscht …";

        try {
            const { data: sessionData } = await supabaseClient.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            if (!accessToken) throw new Error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");

            const response = await fetch("https://tbcfghiegcmibwlvmfto.supabase.co/functions/v1/admin-delete-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "apikey": typeof SUPABASE_PUBLISHABLE_KEY !== "undefined" ? SUPABASE_PUBLISHABLE_KEY : ""
                },
                body: JSON.stringify({ employee_id: employeeId })
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Der Benutzer konnte nicht gelöscht werden.");

            adminBenutzerLoeschPopupSchliessen();
            await adminBenutzerListeLaden();
        } catch (fehler) {
            console.error("Fehler beim Löschen des Benutzers:", fehler);
            fehlerBox.textContent = fehler.message || "Der Benutzer konnte nicht gelöscht werden.";
            fehlerBox.style.display = "block";
            button.disabled = false;
            button.textContent = "Benutzer löschen";
        }
    }

    async function adminBenutzerListeLaden() {
        const status = document.getElementById("adminBenutzerListeStatus");
        const liste = document.getElementById("adminBenutzerListe");
        if (!status || !liste) return;

        status.textContent = "Benutzer werden geladen …";
        liste.innerHTML = "";

        try {
            const { data: userData, error: userError } = await supabaseClient.auth.getUser();
            if (userError || !userData?.user) {
                throw new Error("Du bist nicht angemeldet.");
            }

            const { data, error } = await supabaseClient.rpc("admin_get_users");

            if (error) throw error;

            if (!Array.isArray(data) || data.length === 0) {
                status.textContent = "Keine Benutzer gefunden.";
                return;
            }

            data.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "de"));

            data.forEach((benutzer) => {
                const karte = document.createElement("div");
                karte.className = "admin-benutzer-karte";
                karte.style.cssText = `
                    background:var(--weiss);
                    border:1px solid var(--linie);
                    border-radius:16px;
                    padding:15px 16px;
                    box-sizing:border-box;
                `;

                const rolle = benutzer.is_admin ? "Administrator" : "Mitarbeiter";
                const geburtstag = benutzer.birthday_visible ? "sichtbar" : "nicht sichtbar";

                karte.innerHTML = `
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                        <div style="min-width:0; flex:1;">
                            <strong style="display:block; font-size:16px;">${escapeHtml(benutzer.name || "Ohne Namen")}</strong>
                            <span style="display:block; margin-top:4px; color:var(--grau); font-size:14px; overflow-wrap:anywhere;">${escapeHtml(benutzer.email || "Keine E-Mail-Adresse")}</span>
                        </div>
                        <span style="white-space:nowrap; font-size:13px; color:var(--grau);">${escapeHtml(rolle)}</span>
                    </div>
                    <div style="margin-top:10px; font-size:13px; color:var(--grau);">
                        Geburtstag: ${escapeHtml(geburtstag)}
                    </div>
                    <div class="admin-benutzer-aktionen" style="display:flex; gap:10px; margin-top:12px;">
                        <button type="button" class="button button-secondary" style="flex:1;" data-admin-bearbeiten>
                            <i data-lucide="pencil"></i>
                            Bearbeiten
                        </button>
                        <button type="button" class="button button-secondary" style="flex:1;" data-admin-loeschen>
                            <i data-lucide="trash-2"></i>
                            Löschen
                        </button>
                    </div>
                `;

                karte.querySelector("[data-admin-bearbeiten]")?.addEventListener("click", () => {
                    adminBenutzerBearbeitenOeffnen(benutzer);
                });

                karte.querySelector("[data-admin-loeschen]")?.addEventListener("click", () => {
                    adminBenutzerLoeschPopupOeffnen(benutzer);
                });

                liste.appendChild(karte);
            });

            status.textContent = `${data.length} Benutzer gefunden.`;

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        } catch (fehler) {
            console.error("Fehler beim Laden der Benutzerliste:", fehler);
            status.textContent = "Die Benutzerliste konnte nicht geladen werden.";
        }
    }

    function adminBenutzerListeInitialisieren() {
        adminBenutzerPopupErstellen();
    }

    window.adminBenutzerListeLaden = adminBenutzerListeLaden;
    window.adminBenutzerListePopupOeffnen = adminBenutzerListePopupOeffnen;
    window.adminBenutzerListePopupSchliessen = adminBenutzerListePopupSchliessen;
    window.adminBenutzerBearbeitenOeffnen = adminBenutzerBearbeitenOeffnen;
    window.adminBenutzerBearbeitenSchliessen = adminBenutzerBearbeitenSchliessen;
    window.adminBenutzerLoeschPopupOeffnen = adminBenutzerLoeschPopupOeffnen;
    window.adminBenutzerLoeschPopupSchliessen = adminBenutzerLoeschPopupSchliessen;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", adminBenutzerListeInitialisieren);
    } else {
        adminBenutzerListeInitialisieren();
    }
})();
