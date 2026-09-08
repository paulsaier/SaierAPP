// ========================================
// SAIER INTERN
// Haupt-JavaScript
// ========================================

let kalenderDatum = new Date();

let sichtbareGeburtstage = [];

let kalenderTermine = [];

let aktuellerBenutzerIstAdmin = false;
let aktuellerMitarbeiterId = null;


// ========================================
// SEITEN-NAVIGATION
// ========================================

function zeigeSeite(seitenId, button) {

    const seiten =
        document.querySelectorAll(".seite");

    seiten.forEach(function(seite) {
        seite.classList.remove("aktiv");
    });


    const gewaehlteSeite =
        document.getElementById(seitenId);

    if (gewaehlteSeite) {
        gewaehlteSeite.classList.add("aktiv");
    }


    const buttons =
        document.querySelectorAll(".nav-button");

    buttons.forEach(function(buttonElement) {
        buttonElement.classList.remove("aktiv");
    });


    if (button) {
        button.classList.add("aktiv");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (seitenId === "kalender") {

        kalenderAnzeigen();

        kalenderDatenLaden();

    }

}


// ========================================
// DATUM
// ========================================

function heutigesDatumAnzeigen() {

    const element =
        document.getElementById("heutigesDatum");

    if (!element) {
        return;
    }


    const datum = new Date();


    element.textContent =
        datum.toLocaleDateString(
            "de-DE",
            {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


// ========================================
// KALENDER
// ========================================

function kalenderAnzeigen() {

    const jahr = kalenderDatum.getFullYear();
    const monat = kalenderDatum.getMonth();

    const monate = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    const monatElement = document.getElementById("kalenderMonat");
    if (monatElement) {
        monatElement.textContent = monate[monat] + " " + jahr;
    }

    const ersterTag = new Date(jahr, monat, 1);
    const letzterTag = new Date(jahr, monat + 1, 0);

    let startTag = ersterTag.getDay();
    if (startTag === 0) { startTag = 6; } else { startTag--; }

    const container = document.getElementById("kalenderTage");
    if (!container) { return; }

    container.innerHTML = "";

    for (let i = 0; i < startTag; i++) {
        const leer = document.createElement("div");
        leer.className = "kalender-tag leer";
        container.appendChild(leer);
    }

    const heute = new Date();

    for (let tag = 1; tag <= letzterTag.getDate(); tag++) {

        const element = document.createElement("div");
        element.className = "kalender-tag";

        const nummer = document.createElement("span");
        nummer.textContent = tag;
        element.appendChild(nummer);

        const datumString = kalenderDatumAlsString(jahr, monat, tag);

        if (kalenderTagHatInhalt(datumString)) {
            const punkt = document.createElement("span");
            punkt.className = "kalender-punkt";
            punkt.setAttribute("aria-hidden", "true");
            element.appendChild(punkt);
        }

        element.addEventListener("click", function() {
            kalenderTagAngeklickt(jahr, monat, tag);
        });

        if (
            tag === heute.getDate() &&
            monat === heute.getMonth() &&
            jahr === heute.getFullYear()
        ) {
            element.classList.add("heute");
        }

        container.appendChild(element);
    }

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

function kalenderDatumAlsString(jahr, monat, tag) {
    return String(jahr) + "-" +
        String(monat + 1).padStart(2, "0") + "-" +
        String(tag).padStart(2, "0");
}

function kalenderTagHatInhalt(datumString) {

    const hatTermin = kalenderTermine.some(function(termin) {
        return termin.event_date === datumString;
    });

    const datum = new Date(datumString + "T00:00:00");

    const hatGeburtstag = sichtbareGeburtstage.some(function(geburtstag) {
        return (
            geburtstag.birthday_month === datum.getMonth() + 1 &&
            geburtstag.birthday_day === datum.getDate()
        );
    });

    return hatTermin || hatGeburtstag;
}


// ========================================
// VORHERIGER MONAT
// ========================================

function vorherigerMonat() {

    kalenderDatum.setMonth(
        kalenderDatum.getMonth() - 1
    );

    kalenderAnzeigen();

}


// ========================================
// NÄCHSTER MONAT
// ========================================

function naechsterMonat() {

    kalenderDatum.setMonth(
        kalenderDatum.getMonth() + 1
    );

    kalenderAnzeigen();

}


// ========================================
// KALENDERTERMINE AUS SUPABASE
// ========================================

async function kalenderTermineLaden() {

    if (typeof supabaseClient === "undefined") {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("calendar_events")
            .select("id, title, event_date, description, event_type, signup_allowed")
            .order("event_date", { ascending: true });

    if (error) {
        console.error("Kalenderfehler:", error);
        return;
    }

    kalenderTermine = data || [];

    const liste = document.getElementById("termineListe");

    if (liste) {

        liste.innerHTML = "";

        const bereich = liste.closest(".kalender-termine");

        if (bereich) {
            bereich.style.display = "block";

            const ueberschrift =
                bereich.querySelector(".kalender-bereich-kopf h2");

            if (ueberschrift) {
                ueberschrift.textContent = "Termine in Kürze";
            }
        }

        const heute = new Date();
        heute.setHours(0, 0, 0, 0);

        const morgen = new Date(heute);
        morgen.setDate(heute.getDate() + 1);

        const heuteString =
            kalenderDatumAlsString(
                heute.getFullYear(),
                heute.getMonth(),
                heute.getDate()
            );

        const morgenString =
            kalenderDatumAlsString(
                morgen.getFullYear(),
                morgen.getMonth(),
                morgen.getDate()
            );

        const kommendeTermine =
            kalenderTermine.filter(function(termin) {
                return (
                    termin.event_date === heuteString ||
                    termin.event_date === morgenString
                );
            });

        if (kommendeTermine.length === 0) {

            liste.innerHTML = `
                <div class="kalender-leer">
                    <i data-lucide="calendar-x"></i>
                    <p>Heute und morgen sind keine Termine eingetragen.</p>
                </div>
            `;

        } else {

            kommendeTermine.forEach(function(termin) {

                const datum =
                    new Date(
                        termin.event_date + "T00:00:00"
                    );

                const istHeute =
                    termin.event_date === heuteString;

                const artikel =
                    document.createElement("article");

                artikel.className =
                    "kalender-termin";

                artikel.innerHTML = `
                    <div class="kalender-termin-datum" data-event-date="${termin.event_date}">
                        <strong>${datum.getDate()}</strong>
                        <span>
                            ${datum.toLocaleDateString(
                                "de-DE",
                                { month: "short" }
                            )}
                        </span>
                    </div>

                    <div>
                        <small>
                            ${istHeute ? "HEUTE" : "MORGEN"}
                        </small>

                        <h3>
                            ${escapeHtml(
                                termin.title || "Termin"
                            )}
                        </h3>

                        ${
                            termin.description
                                ? `<p>${escapeHtml(termin.description)}</p>`
                                : ""
                        }
                    </div>
                `;

                const datumKaestchen =
                    artikel.querySelector(".kalender-termin-datum");

                if (datumKaestchen) {
                    datumKaestchen.style.cursor = "pointer";

                    datumKaestchen.addEventListener("click", function() {
                        kalenderTagAngeklickt(
                            datum.getFullYear(),
                            datum.getMonth(),
                            datum.getDate()
                        );
                    });
                }

                liste.appendChild(artikel);
            });
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    kalenderAnzeigen();
}


// ========================================
// GEBURTSTAGE AUS SUPABASE
// ========================================

async function geburtstageLaden() {

    if (typeof supabaseClient === "undefined") {
        return;
    }

    const { data, error } =
        await supabaseClient.rpc("get_visible_birthdays");

    if (error) {
        console.error("Geburtstagsfehler:", error);
        return;
    }

    sichtbareGeburtstage = (data || []).map(function(geburtstag) {

        if (
            Number.isInteger(geburtstag.birth_year)
        ) {

            return {
                ...geburtstag,
                age:
                    new Date().getFullYear() -
                    geburtstag.birth_year
            };

        }

        return geburtstag;

    });

    geburtstageNaechsteSiebenTageAnzeigen();
    kalenderAnzeigen();
}


// ========================================
// GEBURTSTAGE – NÄCHSTE 7 TAGE
// ========================================

function geburtstageNaechsteSiebenTageAnzeigen() {

    const liste =
        document.getElementById(
            "geburtstageListe"
        );


    if (!liste) {
        return;
    }


    const heute =
        new Date();

    heute.setHours(
        0,
        0,
        0,
        0
    );


    const inSiebenTagen =
        new Date(heute);

    inSiebenTagen.setDate(
        heute.getDate() + 7
    );


    const kommendeGeburtstage =
        [];


    sichtbareGeburtstage.forEach(
        function(geburtstag) {

            let geburtstagDatum =
                new Date(
                    heute.getFullYear(),
                    geburtstag.birthday_month - 1,
                    geburtstag.birthday_day
                );


            geburtstagDatum.setHours(
                0,
                0,
                0,
                0
            );


            // Wenn der Geburtstag dieses Jahr
            // bereits vorbei ist, nächstes Jahr nehmen.

            if (
                geburtstagDatum < heute
            ) {

                geburtstagDatum =
                    new Date(
                        heute.getFullYear() + 1,
                        geburtstag.birthday_month - 1,
                        geburtstag.birthday_day
                    );

            }


            if (
                geburtstagDatum <=
                inSiebenTagen
            ) {

                kommendeGeburtstage.push({

                    ...geburtstag,

                    datum:
                        geburtstagDatum

                });

            }

        }
    );


    kommendeGeburtstage.sort(
        function(a, b) {

            return (
                a.datum -
                b.datum
            );

        }
    );


    liste.innerHTML = "";


    if (
        kommendeGeburtstage.length === 0
    ) {

        liste.innerHTML = `

            <div class="keine-daten">

                Keine Geburtstage
                in den nächsten 7 Tagen.

            </div>

        `;

        return;

    }


    kommendeGeburtstage.forEach(
        function(geburtstag) {

            const datum =
                geburtstag.datum;


            const datumText =
                datum.toLocaleDateString(
                    "de-DE",
                    {
                        day: "2-digit",
                        month: "long"
                    }
                );


            const artikel =
                document.createElement(
                    "article"
                );


            artikel.className =
                "kalender-geburtstag";


            artikel.innerHTML = `

                <div class="kalender-geburtstag-icon">

                    <i data-lucide="cake"></i>

                </div>


                <div>

                    <h3>
                        ${escapeHtml(
                            geburtstag.employee_name
                        )}
                    </h3>

                    <p>
                        ${datumText}
                        ·
                        ${geburtstag.age}
                        Jahre
                    </p>

                </div>

            `;


            liste.appendChild(
                artikel
            );

        }
    );


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// ========================================
// KALENDERTAG ANGEKLICKT
// ========================================

async function kalenderTagAngeklickt(jahr, monat, tag) {

    const datumString = kalenderDatumAlsString(jahr, monat, tag);

    const termineAnDiesemTag = kalenderTermine.filter(function(termin) {
        return termin.event_date === datumString;
    });

    await kalenderPopupOeffnen(jahr, monat, tag, termineAnDiesemTag);
}


// ========================================
// KALENDER-POPUP
// ========================================

async function kalenderAnmeldungenDesBenutzersLaden(termine) {

    const anmeldbareTermine = (termine || []).filter(function(termin) {
        return termin.signup_allowed === true;
    });

    if (anmeldbareTermine.length === 0) {
        return {
            employeeId: null,
            angemeldeteEventIds: new Set(),
            fehler: null
        };
    }

    if (typeof supabaseClient === "undefined") {
        return {
            employeeId: null,
            angemeldeteEventIds: new Set(),
            fehler: "Die Verbindung zur Anmeldung ist nicht verfügbar."
        };
    }

    if (!aktuellerMitarbeiterId) {
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData || !userData.user) {
            console.error("Benutzer konnte nicht ermittelt werden:", userError);
            return {
                employeeId: null,
                angemeldeteEventIds: new Set(),
                fehler: "Dein Benutzerkonto konnte nicht ermittelt werden."
            };
        }

        const { data: mitarbeiter, error: mitarbeiterFehler } =
            await supabaseClient
                .from("employees")
                .select("id")
                .eq("user_id", userData.user.id)
                .maybeSingle();

        if (mitarbeiterFehler || !mitarbeiter) {
            console.error("Mitarbeiterprofil konnte nicht ermittelt werden:", mitarbeiterFehler);
            return {
                employeeId: null,
                angemeldeteEventIds: new Set(),
                fehler: "Dein Mitarbeiterprofil konnte nicht ermittelt werden."
            };
        }

        aktuellerMitarbeiterId = mitarbeiter.id;
    }

    const eventIds = anmeldbareTermine.map(function(termin) {
        return termin.id;
    });

    const { data, error } =
        await supabaseClient
            .from("calendar_event_signups")
            .select("event_id")
            .eq("employee_id", aktuellerMitarbeiterId)
            .in("event_id", eventIds);

    if (error) {
        console.error("Anmeldungen konnten nicht geladen werden:", error);
        return {
            employeeId: aktuellerMitarbeiterId,
            angemeldeteEventIds: new Set(),
            fehler: "Der Anmeldestatus konnte nicht geladen werden."
        };
    }

    return {
        employeeId: aktuellerMitarbeiterId,
        angemeldeteEventIds: new Set(
            (data || []).map(function(eintrag) {
                return eintrag.event_id;
            })
        ),
        fehler: null
    };
}

async function kalenderTeilnehmerDesAdminsLaden(termine) {
    if (!aktuellerBenutzerIstAdmin) {
        return {};
    }

    if (typeof supabaseClient === "undefined") {
        return {};
    }

    const ergebnis = {};

    for (const termin of (termine || [])) {
        if (!termin || !termin.id) {
            continue;
        }

        const { data, error } =
            await supabaseClient.rpc(
                "get_calendar_event_signups",
                {
                    p_event_id: termin.id
                }
            );

        if (error) {
            console.error(
                "Teilnehmer konnten nicht geladen werden:",
                error
            );

            ergebnis[termin.id] = `
                <div class="kalender-admin-teilnehmer">
                    <p class="kalender-admin-teilnehmer-fehler">
                        Die Teilnehmer konnten nicht geladen werden.
                    </p>
                </div>
            `;

            continue;
        }

        const teilnehmer = data || [];

        ergebnis[termin.id] = `
            <div class="kalender-admin-teilnehmer">

                <div class="kalender-admin-teilnehmer-kopf">
                    <div>
                        <span class="kalender-admin-teilnehmer-label">
                            TEILNEHMER
                        </span>

                        <strong>
                            ${teilnehmer.length}
                        </strong>
                    </div>

                    <i data-lucide="users"></i>
                </div>

                ${
                    teilnehmer.length > 0
                        ? `
                            <ul class="kalender-admin-teilnehmer-liste">
                                ${teilnehmer.map(function(teilnehmer) {
                                    return `
                                        <li>
                                            <i data-lucide="user"></i>
                                            <span>
                                                ${escapeHtml(
                                                    teilnehmer.employee_name || "Mitarbeiter"
                                                )}
                                            </span>
                                        </li>
                                    `;
                                }).join("")}
                            </ul>
                        `
                        : `
                            <p class="kalender-admin-teilnehmer-leer">
                                Noch keine Mitarbeiter angemeldet.
                            </p>
                        `
                }

            </div>
        `;
    }

    return ergebnis;
}

async function kalenderTerminAnmelden(eventId) {

    if (typeof supabaseClient === "undefined") {
        return;
    }

    const button = document.querySelector(
        '[data-kalender-anmeldung="' + eventId + '"]'
    );

    if (button) {
        button.disabled = true;
        button.textContent = "Wird gespeichert …";
    }

    if (!aktuellerMitarbeiterId) {
        const status = await kalenderAnmeldungenDesBenutzersLaden(
            [{ id: eventId, signup_allowed: true }]
        );

        if (status.fehler || !status.employeeId) {
            if (button) {
                button.disabled = false;
                button.textContent = "Für diesen Termin anmelden";
            }

            alert(status.fehler || "Dein Mitarbeiterprofil konnte nicht ermittelt werden.");
            return;
        }
    }

    const { error } =
        await supabaseClient
            .from("calendar_event_signups")
            .insert({
                event_id: eventId,
                employee_id: aktuellerMitarbeiterId
            });

    if (error) {
        console.error("Anmeldung fehlgeschlagen:", error);

        if (button) {
            button.disabled = false;
            button.textContent = "Für diesen Termin anmelden";
        }

        if (error.code === "23505") {
            alert("Du bist bereits für diesen Termin angemeldet.");
        } else {
            alert("Die Anmeldung konnte nicht gespeichert werden.");
        }

        return;
    }

    const termin = kalenderTermine.find(function(eintrag) {
        return eintrag.id === eventId;
    });

    if (termin) {
        const datum = new Date(termin.event_date + "T00:00:00");
        await kalenderPopupOeffnen(
            datum.getFullYear(),
            datum.getMonth(),
            datum.getDate(),
            [termin]
        );
    }
}


async function kalenderTerminAbmelden(eventId) {

    if (typeof supabaseClient === "undefined" || !aktuellerMitarbeiterId) {
        return;
    }

    const button = document.querySelector(
        '[data-kalender-anmeldung="' + eventId + '"]'
    );

    if (button) {
        button.disabled = true;
        button.textContent = "Wird gespeichert …";
    }

    const { error } =
        await supabaseClient
            .from("calendar_event_signups")
            .delete()
            .eq("event_id", eventId)
            .eq("employee_id", aktuellerMitarbeiterId);

    if (error) {
        console.error("Abmeldung fehlgeschlagen:", error);

        if (button) {
            button.disabled = false;
            button.textContent = "Von diesem Termin abmelden";
        }

        alert("Die Abmeldung konnte nicht gespeichert werden.");
        return;
    }

    const termin = kalenderTermine.find(function(eintrag) {
        return eintrag.id === eventId;
    });

    if (termin) {
        const datum = new Date(termin.event_date + "T00:00:00");
        await kalenderPopupOeffnen(
            datum.getFullYear(),
            datum.getMonth(),
            datum.getDate(),
            [termin]
        );
    }
}


async function kalenderPopupOeffnen(jahr, monat, tag, termine) {

    let popup = document.getElementById("kalenderPopup");

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "kalenderPopup";
        popup.className = "kalender-popup";
        document.body.appendChild(popup);
    }

    const datum = new Date(jahr, monat, tag);

    const datumText = datum.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    const geburtstageAnDiesemTag = sichtbareGeburtstage.filter(function(geburtstag) {
        return (
            geburtstag.birthday_month === monat + 1 &&
            geburtstag.birthday_day === tag
        );
    });

    const anmeldungStatus =
        await kalenderAnmeldungenDesBenutzersLaden(termine);

        const adminTeilnehmer =
        await kalenderTeilnehmerDesAdminsLaden(termine);

    let inhalt = "";

    // Geburtstage werden separat von den normalen Terminen angezeigt.
    if (geburtstageAnDiesemTag.length > 0) {
        inhalt += `
            <section class="kalender-popup-geburtstage">
                <h3>Geburtstage</h3>
                ${geburtstageAnDiesemTag.map(function(geburtstag) {
                    const alter =
                        Number.isInteger(geburtstag.birth_year)
                            ? jahr - geburtstag.birth_year
                            : geburtstag.age;

                    const alterText =
                        Number.isInteger(alter) && alter >= 0
                            ? ` wird ${alter} Jahre alt`
                            : "";

                    return `
                        <div class="kalender-popup-geburtstag">
                            <span class="kalender-popup-geburtstag-name">
                                ${escapeHtml(geburtstag.employee_name || "Geburtstag")}
                            </span>
                            ${alterText ? `<span class="kalender-popup-geburtstag-alter">${alterText}</span>` : ""}
                        </div>
                    `;
                }).join("")}
            </section>
        `;
    }

    // Normale Termine bleiben getrennt von Geburtstagen.
    if (termine && termine.length > 0) {
        inhalt += termine.map(function(termin) {
            const anmeldungMoeglich = termin.signup_allowed === true;
            const istAngemeldet = anmeldungStatus.angemeldeteEventIds.has(termin.id);

            let anmeldungHtml = "";

            if (anmeldungMoeglich) {
                if (anmeldungStatus.fehler) {
                    anmeldungHtml = `
                        <div class="kalender-anmeldung-fehler">
                            ${escapeHtml(anmeldungStatus.fehler)}
                        </div>
                    `;
                } else if (istAngemeldet) {
                    anmeldungHtml = `
                        <div class="kalender-anmeldung">
                            <div class="kalender-anmeldung-status">
                                <i data-lucide="circle-check"></i>
                                <span>Du bist für diesen Termin angemeldet.</span>
                            </div>
                            <button
                                type="button"
                                class="kalender-anmeldung-button kalender-anmeldung-abmelden"
                                data-kalender-anmeldung="${escapeHtml(termin.id)}"
                                onclick="kalenderTerminAbmelden('${escapeHtml(termin.id)}')">
                                Von diesem Termin abmelden
                            </button>
                        </div>
                    `;
                } else {
                    anmeldungHtml = `
                        <div class="kalender-anmeldung">
                            <button
                                type="button"
                                class="kalender-anmeldung-button"
                                data-kalender-anmeldung="${escapeHtml(termin.id)}"
                                onclick="kalenderTerminAnmelden('${escapeHtml(termin.id)}')">
                                Für diesen Termin anmelden
                            </button>
                        </div>
                    `;
                }
            }

            return `
    <article class="kalender-popup-termin">
        <h3>${escapeHtml(termin.title || "Termin")}</h3>

        ${termin.description ? `<p>${escapeHtml(termin.description)}</p>` : ""}

        ${anmeldungHtml}

        ${adminTeilnehmer[termin.id] || ""}
    </article>
`;
        }).join("");
    }

    if (!inhalt) {
        inhalt = `
            <div class="kalender-popup-leer">
                Heute keine Termine.
            </div>
        `;
    }

    popup.innerHTML = `
        <div
            class="kalender-popup-hintergrund"
            onclick="kalenderPopupSchliessen()">
        </div>

        <div
            class="kalender-popup-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kalenderPopupTitel">

            <div class="kalender-popup-kopf">
                <h2 id="kalenderPopupTitel">
                    ${datumText}
                </h2>

                <button
                    type="button"
                    class="kalender-popup-schliessen"
                    aria-label="Schließen"
                    onclick="kalenderPopupSchliessen()">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div class="kalender-popup-inhalt">
                ${inhalt}
            </div>

        </div>
    `;

    popup.style.display = "flex";
    document.body.classList.add("kalender-popup-offen");

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

function kalenderPopupSchliessen() {
    const popup = document.getElementById("kalenderPopup");
    if (!popup) {
        return;
    }
    popup.style.display = "none";
    document.body.classList.remove("kalender-popup-offen");
}

function kalenderPopupEscape(event) {
    if (event.key === "Escape") {
        kalenderPopupSchliessen();
    }
}


// ========================================
// KALENDERDATEN
// ========================================

async function kalenderDatenLaden() {

    await Promise.all([
        kalenderTermineLaden(),
        geburtstageLaden()
    ]);

}


// ========================================
// HTML SICHERN
// ========================================

function escapeHtml(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ========================================
// LOGIN
// ========================================

async function loginDurchfuehren(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const passwort =
        document.getElementById(
            "loginPasswort"
        ).value;


    const fehler =
        document.getElementById(
            "loginFehler"
        );


    fehler.textContent = "";


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        fehler.textContent =
            "Die Verbindung zur Anmeldung ist nicht verfügbar.";

        return;

    }


    const {
        error
    } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: passwort
        });


    if (error) {

        console.error(
            "Login fehlgeschlagen:",
            error
        );


        fehler.textContent =
            "E-Mail oder Passwort ist nicht korrekt.";

        return;

    }


    await appAnzeigen();

}


// ========================================
// APP ANZEIGEN
// ========================================

async function appAnzeigen() {

    document.getElementById(
        "loginBereich"
    ).style.display = "none";


    document.getElementById(
        "app"
    ).style.display = "block";


    document.getElementById(
        "hauptNavigation"
    ).style.display = "grid";


    heutigesDatumAnzeigen();

    kalenderAnzeigen();

    kalenderDatenLaden();

    benutzerDatenLaden();


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }


    // ----------------------------------------
    // Geburtstag beim ersten Login prüfen
    // ----------------------------------------

    await geburtstagErstloginPruefen();

}


// ========================================
// PASSWORT ÄNDERN
// ========================================

async function passwortAltesPruefen() {

    const altesPasswort =
        document.getElementById(
            "altesPasswort"
        )?.value || "";

    const fehler =
        document.getElementById(
            "passwortFehler"
        );

    const pruefenButton =
        document.getElementById(
            "passwortPruefenButton"
        );

    if (fehler) {
        fehler.textContent = "";
    }

    if (!altesPasswort) {

        if (fehler) {
            fehler.textContent =
                "Bitte gib dein aktuelles Passwort ein.";
        }

        return;

    }

    if (typeof supabaseClient === "undefined") {

        if (fehler) {
            fehler.textContent =
                "Die Verbindung zu deinem Konto ist nicht verfügbar.";
        }

        return;

    }

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData ||
        !userData.user ||
        !userData.user.email
    ) {

        if (fehler) {
            fehler.textContent =
                "Dein Benutzerkonto konnte nicht ermittelt werden.";
        }

        return;

    }


    if (pruefenButton) {
        pruefenButton.disabled = true;
        const span = pruefenButton.querySelector("span");
        if (span) {
            span.textContent = "Wird geprüft …";
        }
    }


    const {
        error: aktuellesPasswortFehler
    } =
        await supabaseClient.auth.signInWithPassword({
            email: userData.user.email,
            password: altesPasswort
        });


    if (aktuellesPasswortFehler) {

        console.error(
            "Aktuelles Passwort ist nicht korrekt:",
            aktuellesPasswortFehler
        );

        if (fehler) {
            fehler.textContent =
                "Das aktuelle Passwort ist nicht korrekt.";
        }

        if (pruefenButton) {
            pruefenButton.disabled = false;
            const span = pruefenButton.querySelector("span");
            if (span) {
                span.textContent = "Überprüfen";
            }
        }

        return;

    }


    const stufeAltes =
        document.getElementById(
            "passwortStufeAltes"
        );

    const stufeNeu =
        document.getElementById(
            "passwortStufeNeu"
        );

    if (stufeAltes) {
        stufeAltes.style.display = "none";
    }

    if (stufeNeu) {
        stufeNeu.style.display = "block";
    }

    const fehlerNeu =
        document.getElementById(
            "passwortFehlerNeu"
        );

    if (fehlerNeu) {
        fehlerNeu.textContent = "";
    }

    const neuesPasswort =
        document.getElementById(
            "neuesPasswort"
        );

    if (neuesPasswort) {
        setTimeout(function() {
            neuesPasswort.focus();
        }, 100);
    }

}


// ========================================
// NEUES PASSWORT SPEICHERN
// ========================================

async function passwortAendern(event) {

    event.preventDefault();


    const altesPasswort =
        document.getElementById(
            "altesPasswort"
        )?.value || "";


    const neuesPasswort =
        document.getElementById(
            "neuesPasswort"
        )?.value || "";


    const bestaetigung =
        document.getElementById(
            "neuesPasswortBestaetigung"
        )?.value || "";


    const fehler =
        document.getElementById(
            "passwortFehlerNeu"
        ) ||
        document.getElementById(
            "passwortFehler"
        );


    const erfolgBox =
        document.getElementById(
            "passwortErfolgBox"
        );


    if (fehler) {
        fehler.textContent = "";
    }


    if (!altesPasswort) {

        if (fehler) {
            fehler.textContent =
                "Bitte prüfe zuerst dein aktuelles Passwort.";
        }

        return;

    }


    if (!neuesPasswort) {

        if (fehler) {
            fehler.textContent =
                "Bitte gib ein neues Passwort ein.";
        }

        return;

    }


    if (!bestaetigung) {

        if (fehler) {
            fehler.textContent =
                "Bitte wiederhole dein neues Passwort.";
        }

        return;

    }


    if (neuesPasswort !== bestaetigung) {

        if (fehler) {
            fehler.textContent =
                "Die neuen Passwörter stimmen nicht überein.";
        }

        return;

    }


    if (neuesPasswort.length < 8) {

        if (fehler) {
            fehler.textContent =
                "Das neue Passwort muss mindestens 8 Zeichen lang sein.";
        }

        return;

    }


    if (neuesPasswort === altesPasswort) {

        if (fehler) {
            fehler.textContent =
                "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.";
        }

        return;

    }


    if (typeof supabaseClient === "undefined") {

        if (fehler) {
            fehler.textContent =
                "Die Verbindung zu deinem Konto ist nicht verfügbar.";
        }

        return;

    }


    const speichernButton =
        document.getElementById(
            "passwortSpeichernButton"
        );

    if (speichernButton) {
        speichernButton.disabled = true;
        const span = speichernButton.querySelector("span");
        if (span) {
            span.textContent = "Wird gespeichert …";
        }
    }


    const {
        error: neuesPasswortFehler
    } =
        await supabaseClient.auth.updateUser({
            password: neuesPasswort
        });


    if (neuesPasswortFehler) {

        console.error(
            "Passwortänderung fehlgeschlagen:",
            neuesPasswortFehler
        );

        if (fehler) {
            fehler.textContent =
                "Das neue Passwort konnte nicht gespeichert werden.";
        }

        if (speichernButton) {
            speichernButton.disabled = false;
            const span = speichernButton.querySelector("span");
            if (span) {
                span.textContent = "Passwort ändern";
            }
        }

        return;

    }


    const stufeNeu =
        document.getElementById(
            "passwortStufeNeu"
        );

    if (stufeNeu) {
        stufeNeu.style.display = "none";
    }

    if (erfolgBox) {
        erfolgBox.style.display = "flex";
    }


    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }


    setTimeout(function() {

        passwortAendernSchliessen();

    }, 1800);

}


// ========================================
// PASSWORT MODAL SCHLIESSEN
// ========================================

function passwortAendernSchliessen() {

    const modal =
        document.getElementById(
            "passwortModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";


    const stufeAltes =
        document.getElementById(
            "passwortStufeAltes"
        );

    const stufeNeu =
        document.getElementById(
            "passwortStufeNeu"
        );

    const erfolgBox =
        document.getElementById(
            "passwortErfolgBox"
        );

    const fehler =
        document.getElementById(
            "passwortFehler"
        );

    const fehlerNeu =
        document.getElementById(
            "passwortFehlerNeu"
        );

    if (stufeAltes) {
        stufeAltes.style.display = "block";
    }

    if (stufeNeu) {
        stufeNeu.style.display = "none";
    }

    if (erfolgBox) {
        erfolgBox.style.display = "none";
    }

    if (fehler) {
        fehler.textContent = "";
    }

    if (fehlerNeu) {
        fehlerNeu.textContent = "";
    }

    const pruefenButton =
        document.getElementById(
            "passwortPruefenButton"
        );

    if (pruefenButton) {
        pruefenButton.disabled = false;
        const span = pruefenButton.querySelector("span");
        if (span) {
            span.textContent = "Überprüfen";
        }
    }

    const speichernButton =
        document.getElementById(
            "passwortSpeichernButton"
        );

    if (speichernButton) {
        speichernButton.disabled = false;
        const span = speichernButton.querySelector("span");
        if (span) {
            span.textContent = "Passwort ändern";
        }
    }

    const form =
        document.getElementById(
            "passwortForm"
        );

    if (form) {
        form.reset();
    }

}


// ========================================
// PASSWORT MODAL ÖFFNEN
// ========================================

function passwortAendernOeffnen() {

    const modal =
        document.getElementById(
            "passwortModal"
        );


    if (!modal) {
        return;
    }


    passwortAendernSchliessen();

    modal.style.display =
        "flex";


    const feld =
        document.getElementById(
            "altesPasswort"
        );


    if (feld) {

        setTimeout(function() {

            feld.focus();

        }, 100);

    }


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// ========================================
// GEBURTSTAGE – ERSTLOGIN
// ========================================

async function geburtstagErstloginPruefen() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        return;

    }


    const user =
        userData.user;


    const {
        data: mitarbeiter,
        error: mitarbeiterError
    } =
        await supabaseClient
            .from("employees")
            .select(
                "id, birthdate, birthday_visible, birthday_consent_at"
            )
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    if (mitarbeiterError) {

        console.error(
            "Geburtstagsdaten konnten nicht geladen werden:",
            mitarbeiterError
        );

        return;

    }


    if (!mitarbeiter) {

        return;

    }


    // ----------------------------------------
    // Bereits entschieden?
    // ----------------------------------------

    if (
        mitarbeiter.birthday_consent_at
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "geburtstagErstloginModal"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// ========================================
// GEBURTSTAG NICHT ANZEIGEN
// ========================================

async function geburtstagNichtAnzeigen() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        return;

    }


    const user =
        userData.user;


    const {
        error
    } =
        await supabaseClient
            .from("employees")
            .update({
                birthday_visible: false,
                birthday_consent_at:
                    new Date().toISOString()
            })
            .eq(
                "user_id",
                user.id
            );


    if (error) {

        console.error(
            "Geburtstagsentscheidung konnte nicht gespeichert werden:",
            error
        );

        return;

    }


    geburtstagErstloginSchliessen();

}


// ========================================
// GEBURTSTAG ANZEIGEN
// ========================================

function geburtstagAnzeigen() {

    const auswahl =
        document.getElementById(
            "geburtstagErstloginAuswahl"
        );


    const formular =
        document.getElementById(
            "geburtstagErstloginFormular"
        );


    if (auswahl) {

        auswahl.style.display =
            "none";

    }


    if (formular) {

        formular.style.display =
            "block";

    }


    const feld =
        document.getElementById(
            "geburtstagDatum"
        );


    if (feld) {

        setTimeout(function() {

            feld.focus();

        }, 100);

    }


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


// ========================================
// GEBURTSTAG FORMULAR – ZURÜCK
// ========================================

function geburtstagFormularZurueck() {

    const auswahl =
        document.getElementById(
            "geburtstagErstloginAuswahl"
        );


    const formular =
        document.getElementById(
            "geburtstagErstloginFormular"
        );


    const fehler =
        document.getElementById(
            "geburtstagFehler"
        );


    if (auswahl) {

        auswahl.style.display =
            "flex";

    }


    if (formular) {

        formular.style.display =
            "none";

    }


    if (fehler) {

        fehler.textContent =
            "";

    }

}


// ========================================
// GEBURTSTAG SPEICHERN
// ========================================

async function geburtstagSpeichern() {

    const feld =
        document.getElementById(
            "geburtstagDatum"
        );


    const fehler =
        document.getElementById(
            "geburtstagFehler"
        );


    if (!feld) {
        return;
    }


    const geburtstag =
        feld.value;


    if (!geburtstag) {

        fehler.textContent =
            "Bitte gib dein Geburtsdatum ein.";

        return;

    }


    const datum =
        new Date(
            geburtstag +
            "T00:00:00"
        );


    const heute =
        new Date();


    if (
        datum > heute
    ) {

        fehler.textContent =
            "Das Geburtsdatum darf nicht in der Zukunft liegen.";

        return;

    }


    if (
        datum.getFullYear() <
        1900
    ) {

        fehler.textContent =
            "Bitte gib ein gültiges Geburtsdatum ein.";

        return;

    }


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        fehler.textContent =
            "Die Verbindung zu deinem Konto ist nicht verfügbar.";

        return;

    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        fehler.textContent =
            "Dein Benutzerkonto konnte nicht ermittelt werden.";

        return;

    }


    const user =
        userData.user;


    const {
        error
    } =
        await supabaseClient
            .from("employees")
            .update({
                birthdate:
                    geburtstag,

                birthday_visible:
                    true,

                birthday_consent_at:
                    new Date().toISOString()
            })
            .eq(
                "user_id",
                user.id
            );


    if (error) {

        console.error(
            "Geburtstag konnte nicht gespeichert werden:",
            error
        );


        fehler.textContent =
            "Dein Geburtstag konnte nicht gespeichert werden.";

        return;

    }


    // Benutzerprofil aktualisieren

    await benutzerDatenLaden();


    // Geburtstagsliste aktualisieren

    await geburtstageLaden();


    geburtstagErstloginSchliessen();

}


// ========================================
// GEBURTSTAG – MODAL SCHLIESSEN
// ========================================

function geburtstagErstloginSchliessen() {

    const modal =
        document.getElementById(
            "geburtstagErstloginModal"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "none";

}


// ========================================
// GEBURTSTAG IM BENUTZERBEREICH ÄNDERN
// ========================================

function geburtstagBearbeitenOeffnen() {

    const modal =
        document.getElementById(
            "geburtstagBearbeitenModal"
        );

    if (!modal) {
        return;
    }

    const feld =
        document.getElementById(
            "geburtstagBearbeitenDatum"
        );

    const aktuellerWert =
        document.getElementById(
            "benutzerGeburtstag"
        )?.textContent || "";

    // Das Feld wird in benutzerDatenLaden direkt aus
    // Supabase befüllt. Hier nur öffnen und fokussieren.
    modal.style.display = "flex";

    if (feld) {
        setTimeout(function() {
            feld.focus();
        }, 100);
    }

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

}


function geburtstagBearbeitenSchliessen() {

    const modal =
        document.getElementById(
            "geburtstagBearbeitenModal"
        );

    if (modal) {
        modal.style.display = "none";
    }

    const fehler =
        document.getElementById(
            "geburtstagBearbeitenFehler"
        );

    if (fehler) {
        fehler.textContent = "";
    }

}


async function geburtstagBearbeitenSpeichern() {

    const feld =
        document.getElementById(
            "geburtstagBearbeitenDatum"
        );

    const fehler =
        document.getElementById(
            "geburtstagBearbeitenFehler"
        );

    if (!feld || !feld.value) {

        if (fehler) {
            fehler.textContent =
                "Bitte gib dein Geburtsdatum ein.";
        }

        return;

    }

    const datum =
        new Date(
            feld.value +
            "T00:00:00"
        );

    const heute =
        new Date();

    if (datum > heute) {

        if (fehler) {
            fehler.textContent =
                "Das Geburtsdatum darf nicht in der Zukunft liegen.";
        }

        return;

    }

    if (datum.getFullYear() < 1900) {

        if (fehler) {
            fehler.textContent =
                "Bitte gib ein gültiges Geburtsdatum ein.";
        }

        return;

    }

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();

    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        if (fehler) {
            fehler.textContent =
                "Dein Benutzerkonto konnte nicht ermittelt werden.";
        }

        return;

    }

    const {
        error
    } =
        await supabaseClient
            .from("employees")
            .update({
                birthdate: feld.value
            })
            .eq(
                "user_id",
                userData.user.id
            );

    if (error) {

        console.error(
            "Geburtstag konnte nicht geändert werden:",
            error
        );

        if (fehler) {
            fehler.textContent =
                "Dein Geburtstag konnte nicht gespeichert werden.";
        }

        return;

    }

    geburtstagBearbeitenSchliessen();

    await benutzerDatenLaden();
    await geburtstageLaden();

}


async function geburtstagSichtbarkeitAendern() {

    const schalter =
        document.getElementById(
            "geburtstagSichtbar"
        );

    if (!schalter) {
        return;
    }

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();

    if (
        userError ||
        !userData ||
        !userData.user
    ) {
        schalter.checked = !schalter.checked;
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("employees")
            .update({
                birthday_visible:
                    schalter.checked
            })
            .eq(
                "user_id",
                userData.user.id
            );

    if (error) {

        console.error(
            "Geburtstagssichtbarkeit konnte nicht geändert werden:",
            error
        );

        schalter.checked = !schalter.checked;
        return;

    }

    await geburtstageLaden();

}


// ========================================
// BENUTZERDATEN
// ========================================

async function benutzerDatenLaden() {

    const nameElement =
        document.getElementById(
            "benutzerName"
        );


    const emailElement =
        document.getElementById(
            "benutzerEmail"
        );


    const geburtstagElement =
        document.getElementById(
            "benutzerGeburtstag"
        );


    const geburtstagSichtbarElement =
        document.getElementById(
            "geburtstagSichtbar"
        );


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    // ----------------------------------------
    // Angemeldeten Benutzer laden
    // ----------------------------------------

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        console.error(
            "Benutzerdaten konnten nicht geladen werden:",
            userError
        );

        return;

    }


    const user =
        userData.user;


    // ----------------------------------------
    // E-Mail-Adresse
    // ----------------------------------------

    if (emailElement) {

        emailElement.textContent =
            user.email || "-";

    }


    // ----------------------------------------
    // Mitarbeiterdaten laden
    // ----------------------------------------

    const {
        data: mitarbeiter,
        error: mitarbeiterError
    } =
        await supabaseClient
            .from("employees")
            .select(
                "name, birthdate, birthday_visible, is_admin"
            )
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    if (mitarbeiterError) {

        console.error(
            "Mitarbeiterdaten konnten nicht geladen werden:",
            mitarbeiterError
        );

        return;

    }


    // ----------------------------------------
    // Admin-Status
    // ----------------------------------------

    aktuellerBenutzerIstAdmin =
        mitarbeiter?.is_admin === true;

    const rolleElement =
        document.getElementById("benutzerRolle");

    if (rolleElement) {
        rolleElement.textContent =
            aktuellerBenutzerIstAdmin
                ? "Administrator"
                : "Mitarbeiter";
    }

    const adminBereich =
        document.getElementById("adminBenutzerBereich");

    if (adminBereich) {
        adminBereich.style.display =
            aktuellerBenutzerIstAdmin
                ? "block"
                : "none";
    }

    const newsVerwaltenButton =
    document.getElementById("newsVerwaltenButton");

if (newsVerwaltenButton) {
    newsVerwaltenButton.style.display =
        aktuellerBenutzerIstAdmin
            ? "flex"
            : "none";
}


    // ----------------------------------------
    // Name
    // ----------------------------------------

    if (nameElement) {

        nameElement.textContent =
            mitarbeiter?.name ||
            "Mitarbeiter";

    }


    // ----------------------------------------
    // Geburtstag
    // ----------------------------------------

    if (geburtstagElement) {

        if (
            mitarbeiter?.birthdate
        ) {

            const datum =
                new Date(
                    mitarbeiter.birthdate +
                    "T00:00:00"
                );


            geburtstagElement.textContent =
                datum.toLocaleDateString(
                    "de-DE",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }
                );

        } else {

            geburtstagElement.textContent =
                "Noch nicht hinterlegt";

        }

    }

    const geburtstagBearbeitenFeld =
        document.getElementById(
            "geburtstagBearbeitenDatum"
        );

    if (geburtstagBearbeitenFeld) {
        geburtstagBearbeitenFeld.value =
            mitarbeiter?.birthdate || "";
    }


    // ----------------------------------------
    // Geburtstag sichtbar
    // ----------------------------------------

    if (
        geburtstagSichtbarElement
    ) {

        geburtstagSichtbarElement.checked =
            mitarbeiter?.birthday_visible ===
            true;

    }

}


// ========================================
// ADMIN – MITARBEITER ANLEGEN
// ========================================

function adminBenutzerModalOeffnen() {

    if (!aktuellerBenutzerIstAdmin) {
        return;
    }

    const modal = document.getElementById("adminBenutzerModal");

    if (!modal) {
        return;
    }

    adminBenutzerFormularZuruecksetzen();

    modal.style.display = "flex";
    document.body.classList.add("admin-benutzer-modal-offen");

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    window.setTimeout(function() {
        document.getElementById("adminBenutzerName")?.focus();
    }, 50);
}


function adminBenutzerModalSchliessen() {

    const modal = document.getElementById("adminBenutzerModal");

    if (!modal) {
        return;
    }

    modal.style.display = "none";
    document.body.classList.remove("admin-benutzer-modal-offen");
}


function adminBenutzerModalEscape(event) {

    if (event.key !== "Escape") {
        return;
    }

    const modal = document.getElementById("adminBenutzerModal");

    if (modal && modal.style.display !== "none") {
        adminBenutzerModalSchliessen();
    }
}


function adminBenutzerFormularZuruecksetzen() {

    const form = document.getElementById("adminBenutzerForm");
    const fehler = document.getElementById("adminBenutzerFehler");
    const erfolg = document.getElementById("adminBenutzerErfolg");

    if (form) {
        form.reset();
    }

    if (fehler) {
        fehler.textContent = "";
    }

    if (erfolg) {
        erfolg.textContent = "";
    }
}


async function adminBenutzerAnlegen(event) {

    event.preventDefault();

    if (!aktuellerBenutzerIstAdmin) {
        return;
    }

    const vorname =
        document.getElementById("adminBenutzerVorname")?.value.trim() || "";

    const nachname =
        document.getElementById("adminBenutzerNachname")?.value.trim() || "";

    const email =
        document.getElementById("adminBenutzerEmail")?.value.trim().toLowerCase() || "";

    const passwort =
        document.getElementById("adminBenutzerPasswort")?.value || "";

    const passwortWiederholen =
        document.getElementById("adminBenutzerPasswortWiederholen")?.value || "";

    const istAdmin =
        document.getElementById("adminBenutzerIstAdmin")?.checked === true;

    const fehler =
        document.getElementById("adminBenutzerFehler");

    const erfolg =
        document.getElementById("adminBenutzerErfolg");

    const button =
        document.getElementById("adminBenutzerAnlegenButton");

    if (fehler) fehler.textContent = "";
    if (erfolg) erfolg.textContent = "";

    if (!vorname || !nachname || !email || !passwort || !passwortWiederholen) {
        if (fehler) {
            fehler.textContent =
                "Bitte alle Felder ausfüllen.";
        }
        return;
    }

    if (passwort.length < 8) {
        if (fehler) {
            fehler.textContent =
                "Das Passwort muss mindestens 8 Zeichen lang sein.";
        }
        return;
    }

    if (passwort !== passwortWiederholen) {
        if (fehler) {
            fehler.textContent =
                "Die Passwörter stimmen nicht überein.";
        }
        return;
    }

    const name = `${vorname} ${nachname}`;

    if (button) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = "Benutzer wird angelegt …";
    }

    try {

        const {
    data: { session }
} = await supabaseClient.auth.getSession();

if (!session?.access_token) {
    throw new Error("Deine Anmeldung ist abgelaufen. Bitte neu anmelden.");
}

const response = await fetch(
    `${SUPABASE_URL}/functions/v1/admin-create-user`,
    {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            first_name: vorname,
            last_name: nachname,
            name: name,
            email: email,
            password: passwort,
            is_admin: istAdmin
        })
    }
);

const responseText = await response.text();

let responseData = {};

try {
    responseData = responseText
        ? JSON.parse(responseText)
        : {};
} catch {
    responseData = {
        error: responseText
    };
}

if (!response.ok) {
    throw new Error(
        responseData.error ||
        responseData.message ||
        responseData.detail ||
        `Fehler ${response.status}`
    );
}

if (responseData.error) {
    throw new Error(responseData.error);
}

        if (erfolg) {
            erfolg.textContent =
                `Benutzer „${name}“ wurde erfolgreich angelegt.`;
        }

        const form =
            document.getElementById("adminBenutzerForm");

        if (form) {
            form.reset();
        }

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

    } catch (error) {

        console.error(
            "Fehler beim Anlegen des Benutzers:",
            error
        );

        if (fehler) {
            fehler.textContent =
                error.message ||
                "Der Benutzer konnte nicht angelegt werden.";
        }

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent =
                button.dataset.originalText ||
                "Mitarbeiter anlegen";
        }

    }
}



// ========================================
// AUSLOGGEN
// ========================================

async function ausloggen() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    await supabaseClient.auth.signOut();

    location.reload();

}


// ========================================
// LOGINSTATUS PRÜFEN
// ========================================

async function loginStatusPruefen() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    const {
        data
    } =
        await supabaseClient
            .auth
            .getSession();


    if (
        data &&
        data.session
    ) {

        await appAnzeigen();

    }

}


// ========================================
// GLOBALE FUNKTIONEN
// ========================================

window.passwortAendernOeffnen =
    passwortAendernOeffnen;

window.passwortAendernSchliessen =
    passwortAendernSchliessen;

window.passwortAltesPruefen =
    passwortAltesPruefen;

window.geburtstagBearbeitenOeffnen =
    geburtstagBearbeitenOeffnen;

window.geburtstagBearbeitenSchliessen =
    geburtstagBearbeitenSchliessen;

window.geburtstagBearbeitenSpeichern =
    geburtstagBearbeitenSpeichern;

window.geburtstagSichtbarkeitAendern =
    geburtstagSichtbarkeitAendern;

window.geburtstagNichtAnzeigen =
    geburtstagNichtAnzeigen;

window.geburtstagAnzeigen =
    geburtstagAnzeigen;

window.geburtstagFormularZurueck =
    geburtstagFormularZurueck;

window.geburtstagSpeichern =
    geburtstagSpeichern;

window.geburtstagErstloginSchliessen =
    geburtstagErstloginSchliessen;

window.geburtstageNaechsteSiebenTageAnzeigen =
    geburtstageNaechsteSiebenTageAnzeigen;

window.kalenderTagAngeklickt =
    kalenderTagAngeklickt;

window.kalenderTerminAnmelden =
    kalenderTerminAnmelden;

window.kalenderTerminAbmelden =
    kalenderTerminAbmelden;

window.vorherigerMonat =
    vorherigerMonat;

window.naechsterMonat =
    naechsterMonat;

window.zeigeSeite =
    zeigeSeite;

window.ausloggen =
    ausloggen;

window.adminBenutzerModalOeffnen =
    adminBenutzerModalOeffnen;

window.adminBenutzerModalSchliessen =
    adminBenutzerModalSchliessen;

window.adminBenutzerFormularZuruecksetzen =
    adminBenutzerFormularZuruecksetzen;


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        document.addEventListener("keydown", kalenderPopupEscape);
        document.addEventListener("keydown", adminBenutzerModalEscape);

        const loginForm =
            document.getElementById(
                "loginForm"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginDurchfuehren
            );

        }


        heutigesDatumAnzeigen();

        kalenderAnzeigen();


        if (
            typeof lucide !== "undefined"
        ) {

            lucide.createIcons();

        }


        loginStatusPruefen();


        const passwortForm =
            document.getElementById(
                "passwortForm"
            );


        if (passwortForm) {

            passwortForm.addEventListener(
                "submit",
                passwortAendern
            );

        }


        const geburtstagSichtbar =
            document.getElementById(
                "geburtstagSichtbar"
            );

        if (geburtstagSichtbar) {
            geburtstagSichtbar.addEventListener(
                "change",
                geburtstagSichtbarkeitAendern
            );
        }


        const adminBenutzerForm =
            document.getElementById(
                "adminBenutzerForm"
            );

        if (adminBenutzerForm) {
            adminBenutzerForm.addEventListener(
                "submit",
                adminBenutzerAnlegen
            );
        }

    }
);


// ========================================
// SERVICE WORKER
// ========================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function() {

                        console.log(
                            "SAIER INTERN: Service Worker aktiv"
                        );

                    }
                )
                .catch(
                    function(error) {

                        console.error(
                            "Service Worker Fehler:",
                            error
                        );

                    }
                );

        }
    );

}