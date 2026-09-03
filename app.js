// ========================================
// SAIER INTERN
// Haupt-JavaScript
// ========================================


let kalenderDatum = new Date();


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

    const jahr =
        kalenderDatum.getFullYear();

    const monat =
        kalenderDatum.getMonth();


    const monate = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ];


    const monatElement =
        document.getElementById("kalenderMonat");

    if (monatElement) {

        monatElement.textContent =
            monate[monat] + " " + jahr;

    }


    const ersterTag =
        new Date(
            jahr,
            monat,
            1
        );


    const letzterTag =
        new Date(
            jahr,
            monat + 1,
            0
        );


    let startTag =
        ersterTag.getDay();


    if (startTag === 0) {
        startTag = 6;
    } else {
        startTag--;
    }


    const tageImMonat =
        letzterTag.getDate();


    const container =
        document.getElementById(
            "kalenderTage"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    for (
        let i = 0;
        i < startTag;
        i++
    ) {

        const leer =
            document.createElement("div");

        leer.className =
            "kalender-tag leer";

        container.appendChild(leer);

    }


    const heute =
        new Date();


    for (
        let tag = 1;
        tag <= tageImMonat;
        tag++
    ) {

        const element =
            document.createElement("div");

        element.className =
            "kalender-tag";


        const nummer =
            document.createElement("span");

        nummer.textContent =
            tag;


        element.appendChild(nummer);


        if (
            tag === heute.getDate() &&
            monat === heute.getMonth() &&
            jahr === heute.getFullYear()
        ) {

            element.classList.add("heute");

        }


        container.appendChild(element);

    }


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


function vorherigerMonat() {

    kalenderDatum.setMonth(
        kalenderDatum.getMonth() - 1
    );

    kalenderAnzeigen();

}


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

    const liste =
        document.getElementById(
            "termineListe"
        );

    if (!liste) {
        return;
    }


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("calendar_events")
            .select(
                "id, title, event_date, description, event_type"
            )
            .order(
                "event_date",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Kalenderfehler:",
            error
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    liste.innerHTML = "";


    data.forEach(function(termin) {

        const datum =
            new Date(
                termin.event_date +
                "T00:00:00"
            );


        const artikel =
            document.createElement("article");

        artikel.className =
            "kalender-termin";


        artikel.innerHTML = `

            <div class="kalender-termin-datum">

                <strong>
                    ${datum.getDate()}
                </strong>

                <span>
                    ${datum.toLocaleDateString(
                        "de-DE",
                        { month: "short" }
                    )}
                </span>

            </div>


            <div>

                <h3>
                    ${escapeHtml(
                        termin.title || "Termin"
                    )}
                </h3>

                ${
                    termin.description
                    ? `
                        <p>
                            ${escapeHtml(
                                termin.description
                            )}
                        </p>
                      `
                    : ""
                }

            </div>

        `;


        liste.appendChild(artikel);

    });


    lucide.createIcons();

}


// ========================================
// GEBURTSTAGE
// ========================================

async function geburtstageLaden() {

    const liste =
        document.getElementById(
            "geburtstageListe"
        );

    if (!liste) {
        return;
    }


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .rpc(
                "get_visible_birthdays"
            );


    if (error) {

        console.error(
            "Geburtstagsfehler:",
            error
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    liste.innerHTML = "";


    data.forEach(function(geburtstag) {

        const datum =
            new Date(
                2000,
                geburtstag.birthday_month - 1,
                geburtstag.birthday_day
            );


        const datumText =
            datum.toLocaleDateString(
                "de-DE",
                {
                    day: "2-digit",
                    month: "long"
                }
            );


        const artikel =
            document.createElement("article");


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
                    ${geburtstag.age} Jahre
                </p>

            </div>

        `;


        liste.appendChild(artikel);

    });


    lucide.createIcons();

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
    
    // ========================================
// PASSWORT ÄNDERN
// ========================================

function passwortAendernOeffnen() {

    const modal =
        document.getElementById(
            "passwortModal"
        );

    const form =
        document.getElementById(
            "passwortForm"
        );

    const fehler =
        document.getElementById(
            "passwortFehler"
        );

    const erfolg =
        document.getElementById(
            "passwortErfolg"
        );


    if (!modal) {
        return;
    }


    if (form) {
        form.reset();
    }


    if (fehler) {
        fehler.textContent = "";
    }


    if (erfolg) {
        erfolg.textContent = "";
    }


    modal.style.display = "flex";


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }


    const erstesFeld =
        document.getElementById(
            "neuesPasswort"
        );


    if (erstesFeld) {

        setTimeout(function() {

            erstesFeld.focus();

        }, 100);

    }

}

async function passwortAendern(event) {

    event.preventDefault();


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


    // ----------------------------------------
    // Passwörter vergleichen
    // ----------------------------------------

    if (
        neuesPasswort !==
        bestaetigung
    ) {

        fehler.textContent =
            "Die Passwörter stimmen nicht überein.";

        return;

    }


    // ----------------------------------------
    // Mindestlänge
    // ----------------------------------------

    if (
        neuesPasswort.length < 8
    ) {

        fehler.textContent =
            "Das neue Passwort muss mindestens 8 Zeichen lang sein.";

        return;

    }


    // ----------------------------------------
    // Passwort ändern
    // ----------------------------------------

    const {
        error
    } =
        await supabaseClient.auth.updateUser({
            password: neuesPasswort
        });


    if (error) {

        console.error(
            "Passwortänderung fehlgeschlagen:",
            error
        );


        fehler.textContent =
            "Das Passwort konnte nicht geändert werden.";

        return;

    }


    // ----------------------------------------
    // Erfolg
    // ----------------------------------------

    erfolg.textContent =
        "Dein Passwort wurde erfolgreich geändert.";


    document.getElementById(
        "passwortForm"
    ).reset();


    setTimeout(function() {

        passwortAendernSchliessen();

    }, 1800);

}


function passwortAendernSchliessen() {

    const modal =
        document.getElementById(
            "passwortModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "none";

}


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}

// ========================================
// BENUTZERDATEN
// ========================================

async function benutzerDatenLaden() {

    const nameElement =
        document.getElementById("benutzerName");

    const emailElement =
        document.getElementById("benutzerEmail");


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
            .select("name")
            .eq("user_id", user.id)
            .maybeSingle();


    if (mitarbeiterError) {

        console.error(
            "Mitarbeiterdaten konnten nicht geladen werden:",
            mitarbeiterError
        );

        return;

    }


    // ----------------------------------------
    // Name
    // ----------------------------------------

    if (nameElement) {

        nameElement.textContent =
            mitarbeiter?.name || "Mitarbeiter";

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
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

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