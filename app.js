// ========================================
// SAIER INTERN
// Haupt-JavaScript
// ========================================

let kalenderDatum = new Date();

let sichtbareGeburtstage = [];

let kalenderTermine = [];

let aktuellerBenutzerIstAdmin = false;


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
            .select("id, title, event_date, description, event_type")
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
            bereich.style.display = "none";
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

    sichtbareGeburtstage = data || [];

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

function kalenderTagAngeklickt(jahr, monat, tag) {

    const datumString = kalenderDatumAlsString(jahr, monat, tag);

    const termineAnDiesemTag = kalenderTermine.filter(function(termin) {
        return termin.event_date === datumString;
    });

    kalenderPopupOeffnen(jahr, monat, tag, termineAnDiesemTag);
}


// ========================================
// KALENDER-POPUP
// ========================================

function kalenderPopupOeffnen(jahr, monat, tag, termine) {

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

    let inhalt = "";

    // Geburtstage werden separat von den normalen Terminen angezeigt.
    if (geburtstageAnDiesemTag.length > 0) {
        inhalt += `
            <section class="kalender-popup-geburtstage">
                <h3>Geburtstage</h3>
                ${geburtstageAnDiesemTag.map(function(geburtstag) {
                    const alterText =
                        Number.isInteger(geburtstag.age) && geburtstag.age >= 0
                            ? ` wird ${geburtstag.age} Jahre alt`
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
            return `
                <article class="kalender-popup-termin">
                    <h3>${escapeHtml(termin.title || "Termin")}</h3>
                    ${termin.description ? `<p>${escapeHtml(termin.description)}</p>` : ""}
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

async function passwortAendern(event) {

    event.preventDefault();


    const altesPasswort =
        document.getElementById(
            "altesPasswort"
        ).value;


    const neuesPasswort =
        document.getElementById(
            "neuesPasswort"
        ).value;


    const bestaetigung =
        document.getElementById(
            "neuesPasswortBestaetigung"
        ).value;


    const fehler =
        document.getElementById(
            "passwortFehler"
        );


    const erfolg =
        document.getElementById(
            "passwortErfolg"
        );


    fehler.textContent = "";

    erfolg.textContent = "";


    if (!altesPasswort) {

        fehler.textContent =
            "Bitte gib dein aktuelles Passwort ein.";

        return;

    }


    if (!neuesPasswort) {

        fehler.textContent =
            "Bitte gib ein neues Passwort ein.";

        return;

    }


    if (!bestaetigung) {

        fehler.textContent =
            "Bitte wiederhole dein neues Passwort.";

        return;

    }


    if (
        neuesPasswort !==
        bestaetigung
    ) {

        fehler.textContent =
            "Die neuen Passwörter stimmen nicht überein.";

        return;

    }


    if (
        neuesPasswort.length < 8
    ) {

        fehler.textContent =
            "Das neue Passwort muss mindestens 8 Zeichen lang sein.";

        return;

    }


    if (
        neuesPasswort ===
        altesPasswort
    ) {

        fehler.textContent =
            "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.";

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
        !userData.user ||
        !userData.user.email
    ) {

        fehler.textContent =
            "Dein Benutzerkonto konnte nicht ermittelt werden.";

        return;

    }


    const email =
        userData.user.email;


    const {
        error: aktuellesPasswortFehler
    } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: altesPasswort

        });


    if (aktuellesPasswortFehler) {

        console.error(
            "Aktuelles Passwort ist nicht korrekt:",
            aktuellesPasswortFehler
        );


        fehler.textContent =
            "Das aktuelle Passwort ist nicht korrekt.";

        return;

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


        fehler.textContent =
            "Das neue Passwort konnte nicht gespeichert werden.";

        return;

    }


    erfolg.textContent =
        "Passwort zurücksetzen erfolgreich.";


    document.getElementById(
        "passwortForm"
    ).reset();


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

    const name =
        document.getElementById("adminBenutzerName")?.value.trim() || "";

    const email =
        document.getElementById("adminBenutzerEmail")?.value.trim() || "";

    const passwort =
        document.getElementById("adminBenutzerPasswort")?.value || "";

    const fehler =
        document.getElementById("adminBenutzerFehler");

    const erfolg =
        document.getElementById("adminBenutzerErfolg");

    const button =
        document.getElementById("adminBenutzerAnlegenButton");

    if (fehler) fehler.textContent = "";
    if (erfolg) erfolg.textContent = "";

    if (!name || !email || !passwort) {
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

    if (button) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = "Benutzer wird angelegt …";
    }

    try {

        const { data, error } =
            await supabaseClient.functions.invoke(
                "admin-create-user",
                {
                    body: {
                        name: name,
                        email: email,
                        password: passwort
                    }
                }
            );

        if (error) {
            let meldung =
                "Der Benutzer konnte nicht angelegt werden.";

            try {
                const antwort =
                    await error.context?.json();

                if (antwort?.error) {
                    meldung = antwort.error;
                }
            } catch (jsonFehler) {
                // Standardfehlermeldung verwenden.
            }

            throw new Error(meldung);
        }

        if (erfolg) {
            erfolg.textContent =
                `Benutzer „${data?.name || name}“ wurde erfolgreich angelegt.`;
        }

        const form =
            document.getElementById("adminBenutzerForm");

        if (form) {
            form.reset();
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

window.vorherigerMonat =
    vorherigerMonat;

window.naechsterMonat =
    naechsterMonat;

window.zeigeSeite =
    zeigeSeite;

window.ausloggen =
    ausloggen;

window.adminBenutzerFormularZuruecksetzen =
    adminBenutzerFormularZuruecksetzen;


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        document.addEventListener("keydown", kalenderPopupEscape);

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