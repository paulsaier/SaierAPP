/* ========================================
   SAIER INTERN
   NEWS – ADMINISTRATION
   ======================================== */

(function () {

    "use strict";

    let newsAdminModal = null;
    let aktuelleBearbeitungsId = null;


    // ========================================
    // HILFSFUNKTIONEN
    // ========================================

    function lucideAktualisieren() {

        if (
            typeof lucide !== "undefined" &&
            typeof lucide.createIcons === "function"
        ) {
            lucide.createIcons();
        }
    }


    function htmlEscapen(wert) {

        return String(wert ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function datumFormatieren(wert) {

        if (!wert) {
            return "–";
        }

        const teile = String(wert).split("-");

        if (teile.length !== 3) {
            return wert;
        }

        return `${teile[2]}.${teile[1]}.${teile[0]}`;
    }


    function heuteAlsString() {

        const heute = new Date();
        const jahr = heute.getFullYear();
        const monat = String(heute.getMonth() + 1).padStart(2, "0");
        const tag = String(heute.getDate()).padStart(2, "0");

        return `${jahr}-${monat}-${tag}`;
    }


    function buttonZuruecksetzen(button) {

        if (!button) {
            return;
        }

        button.disabled = false;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
    }


    // ========================================
    // MODAL ERSTELLEN
    // ========================================

    function newsAdminModalErstellen() {

        if (newsAdminModal) {
            return newsAdminModal;
        }

        newsAdminModal = document.createElement("div");
        newsAdminModal.id = "newsAdminModal";
        newsAdminModal.className = "passwort-modal";
        newsAdminModal.style.display = "none";

        newsAdminModal.innerHTML = `

            <div
                class="passwort-modal-hintergrund"
                id="newsAdminHintergrund">
            </div>

            <div
                class="passwort-modal-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="newsAdminModalTitel"
                style="max-height:90vh; overflow-y:auto; overflow-x:hidden; box-sizing:border-box; -webkit-overflow-scrolling:touch;"
            >

                <div class="passwort-modal-kopf">

                    <div class="passwort-modal-icon">
                        <i data-lucide="newspaper"></i>
                    </div>

                    <button
                        type="button"
                        class="passwort-modal-schliessen"
                        id="newsAdminSchliessen"
                        aria-label="Fenster schließen"
                    >
                        <i data-lucide="x"></i>
                    </button>

                </div>

                <div class="passwort-modal-inhalt">

                    <span class="kleine-ueberschrift">
                        ADMINISTRATION
                    </span>

                    <h2 id="newsAdminModalTitel">
                        News verwalten
                    </h2>

                    <div id="newsAdminInhalt"></div>

                </div>

            </div>

        `;

        document.body.appendChild(newsAdminModal);

        document
            .getElementById("newsAdminHintergrund")
            ?.addEventListener(
                "click",
                window.adminNewsVerwaltenSchliessen
            );

        document
            .getElementById("newsAdminSchliessen")
            ?.addEventListener(
                "click",
                window.adminNewsVerwaltenSchliessen
            );

        lucideAktualisieren();

        return newsAdminModal;
    }


    // ========================================
    // FORMULARFELD
    // ========================================

    function formularFeld(label, id, placeholder) {

        return `

            <label
                for="${id}"
                style="
                    display:block;
                    margin-bottom:6px;
                    font-size:13px;
                    font-weight:600;
                "
            >
                ${label}
            </label>

            <input
                id="${id}"
                type="text"
                placeholder="${htmlEscapen(placeholder)}"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:12px 13px;
                    border:1px solid var(--line);
                    border-radius:10px;
                    font:inherit;
                    background:white;
                    margin-bottom:16px;
                "
            >

        `;
    }


    // ========================================
    // NEWS VERWALTUNG
    // ========================================

    async function newsVerwaltungAnzeigen() {

        const inhalt = document.getElementById("newsAdminInhalt");
        const titel = document.getElementById("newsAdminModalTitel");

        if (!inhalt) {
            return;
        }

        aktuelleBearbeitungsId = null;

        if (titel) {
            titel.textContent = "News verwalten";
        }

        inhalt.innerHTML = `

            <button
                type="button"
                id="newsNeueNewsButton"
                style="
                    width:100%;
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:15px;
                    border:1px solid rgba(149,193,31,.25);
                    border-radius:12px;
                    background:var(--hellgruen);
                    color:inherit;
                    cursor:pointer;
                    text-align:left;
                    font:inherit;
                    margin-bottom:18px;
                "
            >

                <span
                    style="
                        width:40px;
                        height:40px;
                        border-radius:11px;
                        background:white;
                        color:var(--saier-gruen);
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        flex-shrink:0;
                    "
                >
                    <i data-lucide="plus"></i>
                </span>

                <span>
                    <strong
                        style="
                            display:block;
                            font-size:15px;
                            margin-bottom:3px;
                        "
                    >
                        Neue News erstellen
                    </strong>

                    <small style="color:var(--grau);">
                        Eine neue Mitteilung für SAIER INTERN anlegen.
                    </small>
                </span>

                <i
                    data-lucide="chevron-right"
                    style="margin-left:auto;"
                ></i>

            </button>

            <div id="newsAdminListe">
                <div
                    style="
                        padding:22px 10px;
                        text-align:center;
                        color:var(--grau);
                    "
                >
                    News werden geladen …
                </div>
            </div>

        `;

        document
            .getElementById("newsNeueNewsButton")
            ?.addEventListener("click", newsNeueNewsOeffnen);

        lucideAktualisieren();

        await newsAdminListeLaden();
    }


    // ========================================
    // NEWS-LISTE LADEN
    // ========================================

    async function newsAdminListeLaden() {

        const liste = document.getElementById("newsAdminListe");

        if (!liste) {
            return;
        }

        if (typeof supabaseClient === "undefined") {
            liste.innerHTML = `
                <p style="color:#b42318;">
                    Die Verbindung zur Datenbank ist nicht verfügbar.
                </p>
            `;
            return;
        }

        try {

            const { data, error } =
                await supabaseClient
                    .from("news")
                    .select(
                        "id,titel,kurztext,inhalt,datum,autor,bild_url,medien_typ,neu,veröffentlicht,created_at"
                    )
                    .order("datum", { ascending: false })
                    .order("created_at", { ascending: false });

            if (error) {
                console.error(
                    "News konnten für die Administration nicht geladen werden:",
                    error
                );

                liste.innerHTML = `
                    <div
                        style="
                            padding:16px;
                            border:1px solid #f1c0bb;
                            border-radius:12px;
                            background:#fff6f5;
                            color:#b42318;
                        "
                    >
                        Die News konnten nicht geladen werden.
                    </div>
                `;
                return;
            }

            if (!data || data.length === 0) {
                liste.innerHTML = `
                    <div
                        style="
                            padding:24px 14px;
                            text-align:center;
                            border:1px dashed var(--line);
                            border-radius:12px;
                            color:var(--grau);
                        "
                    >
                        Noch keine News vorhanden.
                    </div>
                `;
                return;
            }

            liste.innerHTML = data
                .map(newsAdminKarteErstellen)
                .join("");

            liste
                .querySelectorAll("[data-news-bearbeiten]")
                .forEach((button) => {
                    button.addEventListener("click", function () {
                        const id = this.getAttribute("data-news-bearbeiten");
                        const news = data.find((eintrag) => String(eintrag.id) === String(id));

                        if (news) {
                            newsBearbeitenOeffnen(news);
                        }
                    });
                });

            liste
                .querySelectorAll("[data-news-veroeffentlichen]")
                .forEach((button) => {
                    button.addEventListener("click", function () {
                        const id = this.getAttribute("data-news-veroeffentlichen");
                        const news = data.find((eintrag) => String(eintrag.id) === String(id));

                        if (news) {
                            newsVeroeffentlichungUmschalten(news);
                        }
                    });
                });

            liste
                .querySelectorAll("[data-news-loeschen]")
                .forEach((button) => {
                    button.addEventListener("click", function () {
                        const id = this.getAttribute("data-news-loeschen");
                        const news = data.find((eintrag) => String(eintrag.id) === String(id));

                        if (news) {
                            newsLoeschen(news);
                        }
                    });
                });

            lucideAktualisieren();

        }
        catch (error) {

            console.error(
                "Unerwarteter Fehler beim Laden der News-Verwaltung:",
                error
            );

            liste.innerHTML = `
                <div
                    style="
                        padding:16px;
                        border:1px solid #f1c0bb;
                        border-radius:12px;
                        background:#fff6f5;
                        color:#b42318;
                    "
                >
                    Beim Laden der News ist ein unerwarteter Fehler aufgetreten.
                </div>
            `;
        }
    }


    // ========================================
    // NEWS-KARTE ADMIN
    // ========================================

    function newsAdminKarteErstellen(news) {

        const istVeroeffentlicht = news.veröffentlicht === true;
        const statusText = istVeroeffentlicht
            ? "Veröffentlicht"
            : "Entwurf";
        const statusFarbe = istVeroeffentlicht
            ? "var(--saier-gruen)"
            : "#b7791f";
        const statusHintergrund = istVeroeffentlicht
            ? "var(--hellgruen)"
            : "#fff8e7";

        const titel = htmlEscapen(news.titel || "Ohne Titel");
        const kurztext = htmlEscapen(news.kurztext || "");
        const autor = htmlEscapen(news.autor || "SAIER INTERN");
        const datum = htmlEscapen(datumFormatieren(news.datum));
        const id = htmlEscapen(news.id);

        return `

            <article
                style="
                    border:1px solid var(--line);
                    border-radius:14px;
                    padding:15px;
                    margin-bottom:12px;
                    background:white;
                    box-shadow:0 2px 8px rgba(0,0,0,.03);
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:flex-start;
                        gap:12px;
                    "
                >

                    <div style="flex:1; min-width:0;">

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                                flex-wrap:wrap;
                                margin-bottom:6px;
                            "
                        >
                            <span
                                style="
                                    display:inline-flex;
                                    align-items:center;
                                    gap:5px;
                                    padding:4px 8px;
                                    border-radius:999px;
                                    background:${statusHintergrund};
                                    color:${statusFarbe};
                                    font-size:11px;
                                    font-weight:700;
                                "
                            >
                                <i
                                    data-lucide="${istVeroeffentlicht ? "check-circle-2" : "clock-3"}"
                                    style="width:13px;height:13px;"
                                ></i>
                                ${statusText}
                            </span>
                        </div>

                        <h3
                            style="
                                margin:0 0 5px;
                                font-size:16px;
                                line-height:1.3;
                            "
                        >
                            ${titel}
                        </h3>

                        <p
                            style="
                                margin:0 0 7px;
                                color:var(--grau);
                                font-size:13px;
                                line-height:1.45;
                            "
                        >
                            ${kurztext}
                        </p>

                        <small style="color:var(--grau);">
                            ${datum} · ${autor}
                        </small>

                    </div>

                </div>

                <div
                    style="
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                        margin-top:14px;
                        padding-top:12px;
                        border-top:1px solid var(--line);
                    "
                >

                    <button
                        type="button"
                        data-news-bearbeiten="${id}"
                        style="
                            flex:1;
                            min-width:110px;
                            padding:9px 10px;
                            border:1px solid var(--line);
                            border-radius:9px;
                            background:white;
                            color:inherit;
                            font:inherit;
                            font-size:13px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        <i
                            data-lucide="pencil"
                            style="width:14px;height:14px;vertical-align:-2px;margin-right:4px;"
                        ></i>
                        Bearbeiten
                    </button>

                    <button
                        type="button"
                        data-news-veroeffentlichen="${id}"
                        style="
                            flex:1;
                            min-width:135px;
                            padding:9px 10px;
                            border:1px solid rgba(149,193,31,.35);
                            border-radius:9px;
                            background:var(--hellgruen);
                            color:inherit;
                            font:inherit;
                            font-size:13px;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        <i
                            data-lucide="${istVeroeffentlicht ? "eye-off" : "send"}"
                            style="width:14px;height:14px;vertical-align:-2px;margin-right:4px;"
                        ></i>
                        ${istVeroeffentlicht ? "Zurückziehen" : "Veröffentlichen"}
                    </button>

                    <button
                        type="button"
                        data-news-loeschen="${id}"
                        style="
                            flex:0 0 auto;
                            padding:9px 10px;
                            border:1px solid #efc4bf;
                            border-radius:9px;
                            background:white;
                            color:#b42318;
                            font:inherit;
                            font-size:13px;
                            font-weight:600;
                            cursor:pointer;
                        "
                        aria-label="News löschen"
                    >
                        <i
                            data-lucide="trash-2"
                            style="width:14px;height:14px;vertical-align:-2px;"
                        ></i>
                    </button>

                </div>

            </article>

        `;
    }


    // ========================================
    // NEUE NEWS / NEWS BEARBEITEN
    // ========================================

    function newsNeueNewsOeffnen() {
        newsFormularAnzeigen(null);
    }


    function newsBearbeitenOeffnen(news) {
        newsFormularAnzeigen(news);
    }


    function newsFormularAnzeigen(news) {

        const inhalt = document.getElementById("newsAdminInhalt");
        const titel = document.getElementById("newsAdminModalTitel");

        if (!inhalt) {
            return;
        }

        const istBearbeitung = !!news;
        aktuelleBearbeitungsId = istBearbeitung ? news.id : null;

        if (titel) {
            titel.textContent = istBearbeitung
                ? "News bearbeiten"
                : "Neue News erstellen";
        }

        inhalt.innerHTML = `

            <form id="newsNeueNewsForm">

                ${formularFeld(
                    "Titel",
                    "newsTitel",
                    "z. B. Sommerfest 2026"
                )}

                <label
                    for="newsTeaser"
                    style="
                        display:block;
                        margin-bottom:6px;
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    Kurzbeschreibung
                </label>

                <textarea
                    id="newsTeaser"
                    rows="3"
                    placeholder="Kurzer Text, der auf der News-Übersicht angezeigt wird."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px 13px;
                        border:1px solid var(--line);
                        border-radius:10px;
                        font:inherit;
                        resize:vertical;
                        background:white;
                        margin-bottom:16px;
                    "
                ></textarea>

                <label
                    for="newsInhalt"
                    style="
                        display:block;
                        margin-bottom:6px;
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    Inhalt
                </label>

                <div style="margin-bottom:16px;">

                    <label
                        for="newsMedium"
                        style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;"
                    >
                        Bild oder PDF
                    </label>

                    <input
                        id="newsMedium"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;background:white;"
                    >

                    <div
                        id="newsMedienVorschau"
                        style="display:none;margin-top:10px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#f5f5f5;"
                    ></div>

                    <small style="display:block;margin-top:7px;color:var(--grau);">
                        JPG, PNG, WEBP oder PDF. Eine Anlage pro News.
                    </small>

                </div>

                <textarea
                    id="newsInhalt"
                    rows="8"
                    placeholder="Hier kommt der vollständige Inhalt der News hinein."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px 13px;
                        border:1px solid var(--line);
                        border-radius:10px;
                        font:inherit;
                        resize:vertical;
                        background:white;
                        margin-bottom:16px;
                    "
                ></textarea>

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:12px;
                    "
                >

                    <div>

                        <label
                            for="newsDatum"
                            style="
                                display:block;
                                margin-bottom:6px;
                                font-size:13px;
                                font-weight:600;
                            "
                        >
                            Datum
                        </label>

                        <input
                            id="newsDatum"
                            type="date"
                            value="${htmlEscapen(news?.datum || heuteAlsString())}"
                            style="
                                width:100%;
                                box-sizing:border-box;
                                padding:12px 13px;
                                border:1px solid var(--line);
                                border-radius:10px;
                                font:inherit;
                                background:white;
                                margin-bottom:16px;
                            "
                        >

                    </div>

                    <label
                        style="
                            display:flex;
                            align-items:center;
                            gap:9px;
                            font-size:14px;
                            cursor:pointer;
                            padding-top:22px;
                        "
                    >

                        <input
                            id="newsVeroeffentlicht"
                            type="checkbox"
                            ${news?.veröffentlicht === true ? "checked" : ""}
                            style="width:18px;height:18px;"
                        >

                        Sofort veröffentlichen

                    </label>

                </div>

                <div
                    style="
                        display:flex;
                        gap:10px;
                        margin-top:4px;
                    "
                >

                    <button
                        type="button"
                        id="newsFormZurueck"
                        style="
                            flex:1;
                            padding:12px;
                            border:1px solid var(--line);
                            border-radius:10px;
                            background:white;
                            font:inherit;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Zurück
                    </button>

                    <button
                        type="submit"
                        id="newsSpeichernButton"
                        style="
                            flex:1;
                            padding:12px;
                            border:1px solid var(--saier-gruen);
                            border-radius:10px;
                            background:var(--saier-gruen);
                            color:white;
                            font:inherit;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        ${istBearbeitung ? "Änderungen speichern" : "Speichern"}
                    </button>

                </div>

                <p
                    id="newsSpeicherHinweis"
                    style="
                        margin:12px 0 0;
                        color:var(--grau);
                        font-size:12px;
                        text-align:center;
                    "
                >
                    ${istBearbeitung
                        ? "Änderungen werden direkt in SAIER INTERN gespeichert."
                        : "Die News wird in SAIER INTERN gespeichert."}
                </p>

            </form>

        `;

        if (news) {
            document.getElementById("newsTitel").value = news.titel || "";
            document.getElementById("newsTeaser").value = news.kurztext || "";
            document.getElementById("newsInhalt").value = news.inhalt || "";
        }

        const newsMediumFeld = document.getElementById("newsMedium");
        const newsMedienVorschau = document.getElementById("newsMedienVorschau");

        function newsMedienVorschauAnzeigen(file) {
            if (!newsMedienVorschau) return;

            if (!file) {
                newsMedienVorschau.style.display = "none";
                newsMedienVorschau.innerHTML = "";
                return;
            }

            const url = URL.createObjectURL(file);
            newsMedienVorschau.style.display = "block";

            if (file.type === "application/pdf") {
                newsMedienVorschau.innerHTML = `
                    <iframe src="${url}#toolbar=0&navpanes=0" title="PDF-Vorschau" style="display:block;width:100%;height:360px;border:0;background:white;"></iframe>
                `;
            } else {
                newsMedienVorschau.innerHTML = `
                    <img src="${url}" alt="Vorschau" style="display:block;width:100%;max-height:360px;object-fit:contain;background:white;">
                `;
            }
        }

        newsMediumFeld?.addEventListener("change", function () {
            const file = this.files?.[0] || null;
            newsMedienVorschauAnzeigen(file);
        });

        if (news?.bild_url) {
            newsMedienVorschau.style.display = "block";
            newsMedienVorschau.innerHTML = `
                <div style="padding:10px 12px;font-size:13px;font-weight:600;background:white;border-bottom:1px solid var(--line);">Aktuelle Anlage</div>
                ${news.medien_typ === "pdf"
                    ? `<iframe src="${htmlEscapen(news.bild_url)}#toolbar=0&navpanes=0" title="PDF-Vorschau" style="display:block;width:100%;height:360px;border:0;background:white;"></iframe>`
                    : `<img src="${htmlEscapen(news.bild_url)}" alt="Aktuelle Anlage" style="display:block;width:100%;max-height:360px;object-fit:contain;background:white;">`}
            `;
        }

        document
            .getElementById("newsNeueNewsForm")
            ?.addEventListener("submit", newsNeueNewsSpeichern);

        document
            .getElementById("newsFormZurueck")
            ?.addEventListener("click", newsVerwaltungAnzeigen);

        lucideAktualisieren();
    }


    // ========================================
    // AKTUELLEN AUTOR ERMITTELN
    // ========================================

    async function aktuellenAutorLaden() {

        try {

            const {
                data: userData,
                error: userError
            } = await supabaseClient.auth.getUser();

            if (
                userError ||
                !userData ||
                !userData.user
            ) {
                console.warn(
                    "Angemeldeter Benutzer konnte nicht ermittelt werden:",
                    userError
                );
                return "SAIER INTERN";
            }

            const user = userData.user;

            const {
                data: mitarbeiter,
                error: mitarbeiterError
            } = await supabaseClient
                .from("employees")
                .select("name")
                .eq("user_id", user.id)
                .maybeSingle();

            if (
                !mitarbeiterError &&
                mitarbeiter &&
                mitarbeiter.name
            ) {
                return mitarbeiter.name;
            }

            if (user.email) {
                return user.email;
            }

            return "SAIER INTERN";
        }
        catch (error) {
            console.error(
                "Autor konnte nicht ermittelt werden:",
                error
            );
            return "SAIER INTERN";
        }
    }


    // ========================================
    // SICHERE, SAFARI-KOMPATIBLE DATEI-ID
    // ========================================

    function newsEindeutigeDateiId() {

        // crypto.randomUUID() ist in manchen Safari-/file://-Kontexten
        // nicht verfügbar. Deshalb gibt es bewusst einen Fallback.
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2, 12) +
            "-" +
            Math.random().toString(36).slice(2, 12)
        );
    }


    // ========================================
    // NEWS SPEICHERN
    // ========================================

    async function newsNeueNewsSpeichern(event) {

        event.preventDefault();

        const titelFeld = document.getElementById("newsTitel");
        const teaserFeld = document.getElementById("newsTeaser");
        const inhaltFeld = document.getElementById("newsInhalt");
        const datumFeld = document.getElementById("newsDatum");
        const veroeffentlichtFeld = document.getElementById("newsVeroeffentlicht");
        const hinweis = document.getElementById("newsSpeicherHinweis");
        const speichernButton = document.getElementById("newsSpeichernButton");

        if (!titelFeld || !titelFeld.value.trim()) {
            if (hinweis) {
                hinweis.textContent = "Bitte zuerst einen Titel eingeben.";
                hinweis.style.color = "#b42318";
            }
            titelFeld?.focus();
            return;
        }

        if (!teaserFeld || !teaserFeld.value.trim()) {
            if (hinweis) {
                hinweis.textContent = "Bitte eine Kurzbeschreibung eingeben.";
                hinweis.style.color = "#b42318";
            }
            teaserFeld?.focus();
            return;
        }

        if (!inhaltFeld || !inhaltFeld.value.trim()) {
            if (hinweis) {
                hinweis.textContent = "Bitte einen Inhalt eingeben.";
                hinweis.style.color = "#b42318";
            }
            inhaltFeld?.focus();
            return;
        }

        if (!datumFeld || !datumFeld.value) {
            if (hinweis) {
                hinweis.textContent = "Bitte ein Datum auswählen.";
                hinweis.style.color = "#b42318";
            }
            datumFeld?.focus();
            return;
        }

        if (typeof supabaseClient === "undefined") {
            if (hinweis) {
                hinweis.textContent = "Die Verbindung zur Datenbank ist nicht verfügbar.";
                hinweis.style.color = "#b42318";
            }
            return;
        }

        if (speichernButton) {
            speichernButton.disabled = true;
            speichernButton.style.opacity = "0.65";
            speichernButton.style.cursor = "wait";
            speichernButton.textContent = "Wird gespeichert …";
        }

        if (hinweis) {
            hinweis.textContent = "News wird gespeichert …";
            hinweis.style.color = "var(--grau)";
        }

        try {

            const sollVeroeffentlichtWerden =
                veroeffentlichtFeld
                    ? veroeffentlichtFeld.checked
                    : false;

            const autor = await aktuellenAutorLaden();

            const mediumFeld = document.getElementById("newsMedium");
            const mediumDatei = mediumFeld?.files?.[0] || null;

            if (mediumDatei) {
                const erlaubteTypen = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "application/pdf"
                ];

                if (!erlaubteTypen.includes(mediumDatei.type)) {
                    throw new Error("Bitte nur JPG, PNG, WEBP oder PDF auswählen.");
                }

                if (mediumDatei.size > 15 * 1024 * 1024) {
                    throw new Error("Die Datei darf maximal 15 MB groß sein.");
                }
            }

            let bildUrl = null;
            let medienTyp = null;

            if (mediumDatei) {
                const dateiendung = (mediumDatei.name.split(".").pop() || "bin").toLowerCase();
                const dateiname = `news/${newsEindeutigeDateiId()}.${dateiendung}`;

                const { error: uploadError } = await supabaseClient
                    .storage
                    .from("news")
                    .upload(dateiname, mediumDatei, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: mediumDatei.type
                    });

                if (uploadError) {
                    throw new Error("Die Datei konnte nicht hochgeladen werden. " + uploadError.message);
                }

                bildUrl = dateiname;
                medienTyp = mediumDatei.type === "application/pdf" ? "pdf" : "image";
            }

            const newsDaten = {
                titel: titelFeld.value.trim(),
                kurztext: teaserFeld.value.trim(),
                inhalt: inhaltFeld.value.trim(),
                datum: datumFeld.value,
                autor: autor,
                veröffentlicht: sollVeroeffentlichtWerden,
                ...(aktuelleBearbeitungsId ? {} : { neu: true }),
                ...(mediumDatei ? { bild_url: bildUrl, medien_typ: medienTyp } : {})
            };

            let error = null;

            if (aktuelleBearbeitungsId) {

                const ergebnis = await supabaseClient
                    .from("news")
                    .update(newsDaten)
                    .eq("id", aktuelleBearbeitungsId);

                error = ergebnis.error;

            }
            else {

                const ergebnis = await supabaseClient
                    .from("news")
                    .insert(newsDaten);

                error = ergebnis.error;
            }

            if (error) {

                console.error(
                    "News konnte nicht gespeichert werden:",
                    error
                );

                if (hinweis) {
                    let fehlermeldung =
                        "Die News konnte nicht gespeichert werden.";

                    if (error.message) {
                        fehlermeldung += " " + error.message;
                    }

                    hinweis.textContent = fehlermeldung;
                    hinweis.style.color = "#b42318";
                }

                buttonZuruecksetzen(speichernButton);

                if (speichernButton) {
                    speichernButton.textContent = aktuelleBearbeitungsId
                        ? "Änderungen speichern"
                        : "Speichern";
                }

                return;
            }

            console.log("News erfolgreich gespeichert.");

                        // ========================================
            // NEWS-PUSH AUSLÖSEN
            // ========================================

            if (!aktuelleBearbeitungsId && sollVeroeffentlichtWerden) {

                try {

                    const { data: sessionData } =
                        await supabaseClient.auth.getSession();

                    const accessToken =
                        sessionData?.session?.access_token;

                        console.log("NEWS-PUSH TEST – AccessToken vorhanden:", !!accessToken);

                    if (!accessToken) {

                        console.error(
                            "News wurde gespeichert, aber es konnte kein Anmeldetoken für den Push ermittelt werden."
                        );

                    }
                    else {

                        const { data: pushData, error: pushError } =
                            await supabaseClient.functions.invoke(
                                "send-news-push",
                                {
                                    body: {
                                        title: titelFeld.value.trim(),
                                        body: teaserFeld.value.trim(),
                                        url: window.location.href
                                    },
                                    headers: {
                                        Authorization: `Bearer ${accessToken}`
                                    }
                                }
                            );

                        if (pushError) {

                            console.error(
                                "News wurde gespeichert, aber der Push konnte nicht ausgelöst werden:",
                                pushError
                            );

                        }
                        else {

                            console.log(
                                "News-Push erfolgreich ausgelöst:",
                                pushData
                            );

                        }

                    }

                }
                catch (pushError) {

                    console.error(
                        "Fehler beim Auslösen des News-Pushs:",
                        pushError
                    );

                }

            }

            if (hinweis) {
                hinweis.textContent = sollVeroeffentlichtWerden
                    ? "News wurde erfolgreich veröffentlicht."
                    : "News wurde als Entwurf gespeichert.";
                hinweis.style.color = "var(--saier-gruen)";
            }

            // Das eigentliche Speichern war erfolgreich. Ein Fehler beim
            // anschließenden Neuladen der News darf die erfolgreiche
            // Speicherung nicht mehr als Fehler darstellen.
            try {
                if (typeof window.newsLaden === "function") {
                    await window.newsLaden();
                }
            }
            catch (reloadError) {
                console.error(
                    "News wurde gespeichert, aber die News-Liste konnte nicht aktualisiert werden:",
                    reloadError
                );
            }

            setTimeout(function () {
                newsVerwaltungAnzeigen();
            }, 500);

        }
        catch (error) {

            console.error(
                "Unerwarteter Fehler beim Speichern der News:",
                error
            );

            if (hinweis) {
                const details =
                    error?.message ||
                    error?.error_description ||
                    String(error || "");

                hinweis.textContent = details
                    ? `Fehler beim Speichern: ${details}`
                    : "Beim Speichern ist ein unerwarteter Fehler aufgetreten.";
                hinweis.style.color = "#b42318";
            }

            buttonZuruecksetzen(speichernButton);

            if (speichernButton) {
                speichernButton.textContent = aktuelleBearbeitungsId
                    ? "Änderungen speichern"
                    : "Speichern";
            }
        }
    }


    // ========================================
    // VERÖFFENTLICHUNG UMSCHALTEN
    // ========================================

    async function newsVeroeffentlichungUmschalten(news) {

        const sollVeroeffentlichtWerden =
            news.veröffentlicht !== true;

        const aktion = sollVeroeffentlichtWerden
            ? "veröffentlicht"
            : "zurückgezogen";

        const bestaetigt = window.confirm(
            sollVeroeffentlichtWerden
                ? `Soll „${news.titel || "Diese News"}“ veröffentlicht werden?`
                : `Soll „${news.titel || "Diese News"}“ wieder als Entwurf gespeichert werden?`
        );

        if (!bestaetigt) {
            return;
        }

        try {

            const { error } = await supabaseClient
                .from("news")
                .update({
                    veröffentlicht: sollVeroeffentlichtWerden
                })
                .eq("id", news.id);

            if (error) {
                console.error(
                    "Veröffentlichungsstatus konnte nicht geändert werden:",
                    error
                );
                window.alert(
                    `Die News konnte nicht ${aktion} werden. ${error.message || ""}`
                );
                return;
            }

            if (typeof window.newsLaden === "function") {
                await window.newsLaden();
            }

            await newsAdminListeLaden();

        }
        catch (error) {
            console.error(
                "Unerwarteter Fehler beim Ändern des Veröffentlichungsstatus:",
                error
            );
            window.alert(
                "Beim Ändern des Veröffentlichungsstatus ist ein unerwarteter Fehler aufgetreten."
            );
        }
    }


    // ========================================
    // NEWS LÖSCHEN
    // ========================================

    async function newsLoeschen(news) {

        const bestaetigt = window.confirm(
            `Soll die News „${news.titel || "Ohne Titel"}“ wirklich gelöscht werden?\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`
        );

        if (!bestaetigt) {
            return;
        }

        try {

            const { error } = await supabaseClient
                .from("news")
                .delete()
                .eq("id", news.id);

            if (error) {
                console.error(
                    "News konnte nicht gelöscht werden:",
                    error
                );
                window.alert(
                    `Die News konnte nicht gelöscht werden. ${error.message || ""}`
                );
                return;
            }

            if (typeof window.newsLaden === "function") {
                await window.newsLaden();
            }

            await newsAdminListeLaden();

        }
        catch (error) {
            console.error(
                "Unerwarteter Fehler beim Löschen der News:",
                error
            );
            window.alert(
                "Beim Löschen der News ist ein unerwarteter Fehler aufgetreten."
            );
        }
    }


    // ========================================
    // ADMIN MODAL ÖFFNEN
    // ========================================

    window.adminNewsVerwaltenOeffnen = function () {

        const modal = newsAdminModalErstellen();

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";

        newsVerwaltungAnzeigen();
    };


    // ========================================
    // ADMIN MODAL SCHLIESSEN
    // ========================================

    window.adminNewsVerwaltenSchliessen = function () {

        if (!newsAdminModal) {
            newsAdminModal = document.getElementById("newsAdminModal");
        }

        if (!newsAdminModal) {
            return;
        }

        newsAdminModal.style.display = "none";
        document.body.style.overflow = "";
        aktuelleBearbeitungsId = null;
    };


    // ========================================
    // ESC
    // ========================================

    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            newsAdminModal &&
            newsAdminModal.style.display !== "none"
        ) {
            window.adminNewsVerwaltenSchliessen();
        }
    });


})();
s