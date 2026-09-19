/* ========================================
   SAIER INTERN
   NEWS – MODUL
   ======================================== */

(function () {

    "use strict";


    // ========================================
    // NEWS-DESIGN
    // ========================================

    function newsStylesLaden() {

        if (
            document.getElementById(
                "saier-news-styles"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "saier-news-styles";


        style.textContent = `

            /* ====================================
               NEWS BEREICH
               ==================================== */

            #newsListe {
                width: 100%;
                max-width: 1380px;

                margin: 32px auto 120px;
            }


            /* ====================================
               NEWS GRID
               ==================================== */

            .saier-news-grid {

                display: grid;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );

                gap: 28px;
            }


            /* ====================================
               EINZELNE NEWS KARTE
               ==================================== */

            .saier-news-card {

                position: relative;

                display: flex;

                flex-direction: column;

                background: #ffffff;

                border-radius: 24px;

                overflow: hidden;

                border:
                    1px solid #e8e8e8;

                box-shadow:
                    0 8px 30px
                    rgba(0, 0, 0, 0.07);

                transition:
                    transform 0.22s ease,
                    box-shadow 0.22s ease;

                min-height: 100%;
            }


            .saier-news-card:hover {

                transform:
                    translateY(-4px);

                box-shadow:
                    0 14px 38px
                    rgba(0, 0, 0, 0.11);
            }


            /* ====================================
               NEWS BILD
               ==================================== */

            .saier-news-card-image {

                position: relative;

                width: 100%;

                height: 235px;

                overflow: hidden;

                background:
                    linear-gradient(
                        135deg,
                        #95C11F,
                        #b8dc55
                    );
            }


            .saier-news-card-image img {

                display: block;

                width: 100%;
                height: 100%;

                object-fit: cover;

                transition:
                    transform 0.35s ease;
            }


            .saier-news-card:hover
            .saier-news-card-image img {

                transform:
                    scale(1.035);
            }


            /* ====================================
               BILD OHNE FOTO
               ==================================== */

            .saier-news-card-no-image {

                display: flex;

                align-items: center;
                justify-content: center;

                width: 100%;
                height: 100%;

                color: #ffffff;
            }


            .saier-news-card-no-image svg {

                width: 62px;
                height: 62px;

                opacity: 0.9;
            }


            /* ====================================
               NEU BADGE
               ==================================== */

            .saier-news-badge {

                position: absolute;

                top: 18px;
                left: 18px;

                z-index: 2;

                display: inline-flex;

                align-items: center;

                padding:
                    7px 12px;

                border-radius:
                    999px;

                background:
                    #95C11F;

                color:
                    #ffffff;

                font-size:
                    11px;

                font-weight:
                    800;

                letter-spacing:
                    0.6px;

                box-shadow:
                    0 4px 12px
                    rgba(0, 0, 0, 0.16);
            }


            /* ====================================
               KARTENINHALT
               ==================================== */

            .saier-news-card-content {

                display: flex;

                flex-direction: column;

                flex: 1;

                padding:
                    25px 27px 27px;
            }


            /* ====================================
               META
               ==================================== */

            .saier-news-meta {

                display: flex;

                align-items: center;

                flex-wrap: wrap;

                gap: 8px;

                margin-bottom:
                    13px;

                color:
                    #858585;

                font-size:
                    13px;

                line-height:
                    1.4;
            }


            .saier-news-meta-date {

                font-weight:
                    600;
            }


            .saier-news-meta-separator {

                color:
                    #c5c5c5;
            }


            .saier-news-meta-author {

                color:
                    #6e6e6e;
            }


            /* ====================================
               TITEL
               ==================================== */

            .saier-news-title {

                margin:
                    0 0 12px;

                color:
                    #222222;

                font-size:
                    25px;

                line-height:
                    1.22;

                font-weight:
                    750;

                letter-spacing:
                    -0.4px;
            }


            /* ====================================
               KURZTEXT
               ==================================== */

            .saier-news-teaser {

                margin:
                    0;

                color:
                    #555555;

                font-size:
                    16px;

                line-height:
                    1.6;
            }


            /* ====================================
               KARTEN FOOTER
               ==================================== */

            .saier-news-card-footer {

                display: flex;

                align-items: center;

                justify-content:
                    space-between;

                gap: 15px;

                margin-top:
                    25px;

                padding-top:
                    18px;

                border-top:
                    1px solid #eeeeee;
            }


            /* ====================================
               ARTIKEL LESEN
               ==================================== */

            .saier-news-read {

                display: inline-flex;

                align-items: center;

                gap: 7px;

                padding: 0;

                border: 0;

                background: transparent;

                color:
                    #95C11F;

                font-family:
                    inherit;

                font-size:
                    14px;

                font-weight:
                    750;

                cursor:
                    pointer;
            }


            .saier-news-read svg {

                width:
                    17px;

                height:
                    17px;

                transition:
                    transform 0.2s ease;
            }


            .saier-news-read:hover svg {

                transform:
                    translateX(3px);
            }


            /* ====================================
               MEDIUM ÖFFNEN
               ==================================== */

            .saier-news-medium-open {

                display: inline-flex;

                align-items: center;

                justify-content: center;

                gap: 7px;

                padding: 9px 12px;

                border: 1px solid #95C11F;

                border-radius: 9px;

                background: #ffffff;

                color: #6f9700;

                font-family: inherit;

                font-size: 13px;

                font-weight: 700;

                cursor: pointer;

                transition:
                    background 0.18s ease,
                    color 0.18s ease,
                    transform 0.18s ease;
            }


            .saier-news-medium-open:hover {

                background: #95C11F;

                color: #ffffff;

                transform: translateY(-1px);
            }


            .saier-news-medium-open svg {

                width: 16px;

                height: 16px;
            }


            /* ====================================
               STATUS
               ==================================== */

            .saier-news-status {

                display: flex;

                flex-direction: column;

                align-items: center;

                justify-content: center;

                min-height:
                    230px;

                padding:
                    40px;

                background:
                    #ffffff;

                border:
                    1px solid #e8e8e8;

                border-radius:
                    24px;

                box-shadow:
                    0 8px 30px
                    rgba(0, 0, 0, 0.05);

                text-align:
                    center;

                color:
                    #666666;
            }


            .saier-news-status svg {

                width:
                    42px;

                height:
                    42px;

                margin-bottom:
                    13px;

                color:
                    #95C11F;
            }


            .saier-news-status strong {

                margin-bottom:
                    5px;

                color:
                    #292929;

                font-size:
                    17px;
            }


            .saier-news-status span {

                font-size:
                    14px;
            }


            /* ====================================
               SPINNER
               ==================================== */

            .saier-news-spinner {

                width:
                    34px;

                height:
                    34px;

                margin-bottom:
                    14px;

                border:
                    3px solid #e7e7e7;

                border-top-color:
                    #95C11F;

                border-radius:
                    50%;

                animation:
                    saierNewsSpin
                    0.8s linear infinite;
            }


            @keyframes saierNewsSpin {

                from {
                    transform:
                        rotate(0deg);
                }

                to {
                    transform:
                        rotate(360deg);
                }

            }


            /* ====================================
               FEHLER
               ==================================== */

            .saier-news-error svg {

                color:
                    #c0392b;
            }


            /* ====================================
               ARTIKEL MODAL
               ==================================== */

            .saier-news-modal {

                position:
                    fixed;

                inset:
                    0;

                z-index:
                    99999;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    30px;

                background:
                    rgba(
                        20,
                        20,
                        20,
                        0.58
                    );

                backdrop-filter:
                    blur(5px);

                -webkit-backdrop-filter:
                    blur(5px);

                opacity:
                    0;

                visibility:
                    hidden;

                transition:
                    opacity 0.2s ease,
                    visibility 0.2s ease;
            }


            .saier-news-modal.offen {

                opacity:
                    1;

                visibility:
                    visible;
            }


            /* ====================================
               MODAL FENSTER
               ==================================== */

            .saier-news-modal-dialog {

                position:
                    relative;

                width:
                    min(900px, 100%);

                max-height:
                    calc(100vh - 60px);

                overflow:
                    hidden;

                background:
                    #ffffff;

                border-radius:
                    26px;

                box-shadow:
                    0 25px 80px
                    rgba(
                        0,
                        0,
                        0,
                        0.25
                    );

                transform:
                    translateY(12px)
                    scale(0.985);

                transition:
                    transform 0.2s ease;
            }


            .saier-news-modal.offen
            .saier-news-modal-dialog {

                transform:
                    translateY(0)
                    scale(1);
            }


            /* ====================================
               MODAL SCHLIESSEN
               ==================================== */

            .saier-news-modal-close {

                position:
                    absolute;

                top:
                    18px;

                right:
                    18px;

                z-index:
                    5;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                width:
                    42px;

                height:
                    42px;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.94
                    );

                color:
                    #333333;

                box-shadow:
                    0 4px 15px
                    rgba(
                        0,
                        0,
                        0,
                        0.13
                    );

                cursor:
                    pointer;
            }


            .saier-news-modal-close:hover {

                background:
                    #ffffff;
            }


            .saier-news-modal-close svg {

                width:
                    20px;

                height:
                    20px;
            }


            /* ====================================
               MODAL BILD
               ==================================== */

            .saier-news-modal-image {

                position:
                    relative;

                width:
                    100%;

                height:
                    310px;

                background:
                    linear-gradient(
                        135deg,
                        #95C11F,
                        #b8dc55
                    );
            }


            .saier-news-modal-image img {

                display:
                    block;

                width:
                    100%;

                height:
                    100%;

                object-fit:
                    cover;
            }


            .saier-news-modal-no-image {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                width:
                    100%;

                height:
                    100%;

                color:
                    #ffffff;
            }


            .saier-news-modal-no-image svg {

                width:
                    75px;

                height:
                    75px;

                opacity:
                    0.9;
            }


            .saier-news-modal-image
            .saier-news-badge {

                top:
                    20px;

                left:
                    20px;
            }


            /* ====================================
               MODAL INHALT
               ==================================== */

            .saier-news-modal-content {

                max-height:
                    calc(100vh - 370px);

                overflow-y:
                    auto;

                padding:
                    32px 40px 42px;
            }


            /* ====================================
               MODAL META
               ==================================== */

            .saier-news-modal-meta {

                display:
                    flex;

                align-items:
                    center;

                flex-wrap:
                    wrap;

                gap:
                    8px;

                margin-bottom:
                    12px;

                color:
                    #858585;

                font-size:
                    14px;
            }


            .saier-news-modal-meta-date {

                font-weight:
                    600;
            }


            .saier-news-modal-meta-separator {

                color:
                    #c5c5c5;
            }


            .saier-news-modal-meta-author {

                color:
                    #6e6e6e;
            }


            /* ====================================
               MODAL TITEL
               ==================================== */

            .saier-news-modal-title {

                margin:
                    0 0 25px;

                color:
                    #222222;

                font-size:
                    36px;

                line-height:
                    1.18;

                font-weight:
                    750;

                letter-spacing:
                    -0.6px;
            }


            /* ====================================
               MODAL ARTIKELTEXT
               ==================================== */

            .saier-news-modal-text {

                color:
                    #3e3e3e;

                font-size:
                    17px;

                line-height:
                    1.75;

                white-space:
                    pre-wrap;

                overflow-wrap:
                    anywhere;
            }


            /* ====================================
               MODAL BOTTOM
               ==================================== */

            .saier-news-modal-bottom {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                margin-top:
                    32px;

                padding-top:
                    20px;

                border-top:
                    1px solid #eeeeee;

                color:
                    #999999;

                font-size:
                    13px;
            }


            /* ====================================
               BODY GESPERRT
               ==================================== */

            body.saier-news-modal-open {

                overflow:
                    hidden;
            }


            /* ====================================
               DESKTOP – EINE NEWS BREITER
               ==================================== */

            .saier-news-grid:
            has(.saier-news-card:only-child) {

                grid-template-columns:
                    minmax(0, 1fr);
            }


            /* ====================================
               TABLET
               ==================================== */

            @media (max-width: 900px) {

                #newsListe {

                    margin-top:
                        22px;
                }


                .saier-news-grid {

                    grid-template-columns:
                        1fr;
                }


                .saier-news-modal {

                    padding:
                        18px;
                }


                .saier-news-modal-dialog {

                    max-height:
                        calc(100vh - 36px);

                    border-radius:
                        22px;
                }


                .saier-news-modal-image {

                    height:
                        250px;
                }


                .saier-news-modal-content {

                    max-height:
                        calc(100vh - 286px);

                    padding:
                        28px;
                }


                .saier-news-modal-title {

                    font-size:
                        30px;
                }

            }


            /* ====================================
               MOBILE
               ==================================== */

            @media (max-width: 600px) {

                #newsListe {

                    margin:
                        20px auto 100px;
                }


                .saier-news-card-image {

                    height:
                        190px;
                }


                .saier-news-card-content {

                    padding:
                        21px;
                }


                .saier-news-title {

                    font-size:
                        21px;
                }


                .saier-news-teaser {

                    font-size:
                        15px;
                }


                .saier-news-modal {

                    padding:
                        0;
                }


                .saier-news-modal-dialog {

                    width:
                        100%;

                    max-height:
                        100vh;

                    height:
                        100vh;

                    border-radius:
                        0;
                }


                .saier-news-modal-image {

                    height:
                        220px;
                }


                .saier-news-modal-content {

                    max-height:
                        calc(100vh - 220px);

                    padding:
                        24px 21px 35px;
                }


                .saier-news-modal-title {

                    font-size:
                        26px;

                    line-height:
                        1.2;
                }


                .saier-news-modal-text {

                    font-size:
                        16px;

                    line-height:
                        1.7;
                }


                .saier-news-modal-close {

                    top:
                        12px;

                    right:
                        12px;

                    width:
                        40px;

                    height:
                        40px;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    // ========================================
    // NEWS LADEN
    // ========================================

    async function newsLaden() {

        const container =
            document.getElementById(
                "newsListe"
            );


        if (!container) {

            console.warn(
                "News-Container #newsListe wurde nicht gefunden."
            );

            return;
        }


        container.innerHTML = `

            <div
                class="saier-news-status"
            >

                <div
                    class="saier-news-spinner"
                ></div>

                <strong>
                    Neuigkeiten werden geladen ...
                </strong>

                <span>
                    Einen Moment bitte.
                </span>

            </div>

        `;


        try {

            const {
                data,
                error
            } =
                await supabaseClient

                    .from("news")

                    .select(`
    id,
    titel,
    kurztext,
    inhalt,
    datum,
    autor,
    bild_url,
    medien_typ,
    neu,
    veröffentlicht,
    created_at
`)

                    .eq(
                        "veröffentlicht",
                        true
                    )

                    .order(
                        "datum",
                        {
                            ascending:
                                false
                        }
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                console.error(
                    "News konnten nicht geladen werden:",
                    error
                );


                container.innerHTML = `

                    <div
                        class="
                            saier-news-status
                            saier-news-error
                        "
                    >

                        <i
                            data-lucide="circle-alert"
                        ></i>

                        <strong>
                            Neuigkeiten konnten
                            nicht geladen werden.
                        </strong>

                        <span>
                            Bitte versuche es später erneut.
                        </span>

                    </div>

                `;


                newsIconsAktualisieren();

                return;

            }


            const newsMitMedien = await Promise.all(
                (data || []).map(async function (artikel) {

                    if (!artikel.bild_url) {
                        return artikel;
                    }

                    const medienUrl =
                        await newsMedienUrlErmitteln(
                            artikel.bild_url
                        );

                    return {
                        ...artikel,
                        bild_url: medienUrl
                    };
                })
            );

            newsAnzeigen(
                newsMitMedien
            );

        }

        catch (error) {

            console.error(
                "Unerwarteter Fehler beim Laden der News:",
                error
            );


            container.innerHTML = `

                <div
                    class="
                        saier-news-status
                        saier-news-error
                    "
                >

                    <i
                        data-lucide="circle-alert"
                    ></i>

                    <strong>
                        Neuigkeiten konnten
                        nicht geladen werden.
                    </strong>

                    <span>
                        Bitte versuche es später erneut.
                    </span>

                </div>

            `;


            newsIconsAktualisieren();

        }

    }


    // ========================================
    // NEWS ANZEIGEN
    // ========================================

    function newsAnzeigen(
        news
    ) {

        const container =
            document.getElementById(
                "newsListe"
            );


        if (!container) {
            return;
        }


        if (!news.length) {

            container.innerHTML = `

                <div
                    class="saier-news-status"
                >

                    <i
                        data-lucide="newspaper"
                    ></i>

                    <strong>
                        Noch keine Neuigkeiten vorhanden.
                    </strong>

                    <span>
                        Sobald neue Informationen
                        veröffentlicht werden,
                        erscheinen sie hier.
                    </span>

                </div>

            `;


            newsIconsAktualisieren();

            return;

        }


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "saier-news-grid";


        news.forEach(
            function (artikel) {

                const karte =
                    document.createElement(
                        "article"
                    );


                karte.className =
                    "saier-news-card";


                // ====================================
                // BILD
                // ====================================

                const bildBereich =
                    document.createElement(
                        "div"
                    );


                bildBereich.className =
                    "saier-news-card-image";


                if (
                    artikel.bild_url
                ) {

                    if (artikel.medien_typ === "pdf") {

                        const pdf =
                            document.createElement("iframe");

                        pdf.src =
                            artikel.bild_url +
                            "#toolbar=0&navpanes=0&scrollbar=0";

                        pdf.title =
                            artikel.titel ||
                            "PDF-Vorschau";

                        pdf.loading =
                            "lazy";

                        pdf.style.width = "100%";
                        pdf.style.height = "100%";
                        pdf.style.border = "0";
                        pdf.style.display = "block";
                        pdf.style.background = "#ffffff";

                        bildBereich.appendChild(
                            pdf
                        );

                    } else {

                        const bild =
                            document.createElement(
                                "img"
                            );

                        bild.src =
                            artikel.bild_url;

                        bild.alt =
                            artikel.titel ||
                            "News";

                        bild.loading =
                            "lazy";

                        bild.onerror =
                            function () {

                                bild.remove();

                                bildBereich.innerHTML = `
                                    <div
                                        class="
                                            saier-news-card-no-image
                                        "
                                    >
                                        <i
                                            data-lucide="newspaper"
                                        ></i>
                                    </div>
                                `;

                                newsIconsAktualisieren();

                            };

                        bildBereich.appendChild(
                            bild
                        );

                    }

                }

                else {

                    bildBereich.innerHTML = `

                        <div
                            class="
                                saier-news-card-no-image
                            "
                        >

                            <i
                                data-lucide="newspaper"
                            ></i>

                        </div>

                    `;

                }


                // ====================================
                // NEU BADGE
                // ====================================

                if (
                    newsIstNeu(artikel.datum)
                ) {

                    const badge =
                        document.createElement(
                            "span"
                        );


                    badge.className =
                        "saier-news-badge";


                    badge.textContent =
                        "NEU";


                    bildBereich.appendChild(
                        badge
                    );

                }


                karte.appendChild(
                    bildBereich
                );


                // ====================================
                // INHALT
                // ====================================

                const content =
                    document.createElement(
                        "div"
                    );


                content.className =
                    "saier-news-card-content";


                // ====================================
                // META
                // ====================================

                const meta =
                    document.createElement(
                        "div"
                    );


                meta.className =
                    "saier-news-meta";


                const datum =
                    document.createElement(
                        "span"
                    );


                datum.className =
                    "saier-news-meta-date";


                datum.textContent =
                    datumFormatieren(
                        artikel.datum
                    );


                meta.appendChild(
                    datum
                );


                if (
                    artikel.autor
                ) {

                    const separator =
                        document.createElement(
                            "span"
                        );


                    separator.className =
                        "saier-news-meta-separator";


                    separator.textContent =
                        "•";


                    meta.appendChild(
                        separator
                    );


                    const autor =
                        document.createElement(
                            "span"
                        );


                    autor.className =
                        "saier-news-meta-author";


                    autor.textContent =
                        artikel.autor;


                    meta.appendChild(
                        autor
                    );

                }


                content.appendChild(
                    meta
                );


                // ====================================
                // TITEL
                // ====================================

                const titel =
                    document.createElement(
                        "h2"
                    );


                titel.className =
                    "saier-news-title";


                titel.textContent =
                    artikel.titel ||
                    "Ohne Titel";


                content.appendChild(
                    titel
                );


                // ====================================
                // KURZTEXT
                // ====================================

                if (
                    artikel.kurztext
                ) {

                    const teaser =
                        document.createElement(
                            "p"
                        );


                    teaser.className =
                        "saier-news-teaser";


                    teaser.textContent =
                        artikel.kurztext;


                    content.appendChild(
                        teaser
                    );

                }


                // ====================================
                // FOOTER
                // ====================================

                const footer =
                    document.createElement(
                        "div"
                    );


                footer.className =
                    "saier-news-card-footer";


                const lesen =
                    document.createElement(
                        "button"
                    );


                    lesen.type =
                        "button";


                    lesen.className =
                        "saier-news-read";


                    lesen.innerHTML = `
                        Artikel lesen
                        <i
                            data-lucide="arrow-right"
                        ></i>
                    `;


                    lesen.addEventListener(
                        "click",
                        function () {

                            newsArtikelOeffnen(
                                artikel
                            );

                        }
                    );


                    footer.appendChild(
                        lesen
                    );


                    content.appendChild(
                        footer
                    );


                    karte.appendChild(
                        content
                    );


                    grid.appendChild(
                        karte
                    );

            }
        );


        container.innerHTML = "";

        container.appendChild(
            grid
        );


        newsIconsAktualisieren();

    }


    // ========================================
    // ARTIKEL ÖFFNEN
    // ========================================

    function newsArtikelOeffnen(
        artikel
    ) {

        newsModalErstellen();


        const modal =
            document.getElementById(
                "saierNewsModal"
            );


        if (!modal) {
            return;
        }


        const bildContainer =
            modal.querySelector(
                ".saier-news-modal-image"
            );


        const titel =
            modal.querySelector(
                ".saier-news-modal-title"
            );


        const meta =
            modal.querySelector(
                ".saier-news-modal-meta"
            );


        const text =
            modal.querySelector(
                ".saier-news-modal-text"
            );


        const bottom =
            modal.querySelector(
                ".saier-news-modal-bottom"
            );


        // ====================================
        // BILD ZURÜCKSETZEN
        // ====================================

        bildContainer.innerHTML = "";


        if (
            artikel.bild_url
        ) {

            if (artikel.medien_typ === "pdf") {

                const pdf =
                    document.createElement("iframe");

                pdf.src =
                    artikel.bild_url +
                    "#toolbar=0&navpanes=0&scrollbar=0";

                pdf.title =
                    artikel.titel ||
                    "PDF-Vorschau";

                pdf.style.width = "100%";
                pdf.style.height = "100%";
                pdf.style.minHeight = "420px";
                pdf.style.border = "0";
                pdf.style.display = "block";
                pdf.style.background = "#ffffff";

                bildContainer.appendChild(
                    pdf
                );

            } else {

                const bild =
                    document.createElement(
                        "img"
                    );

                bild.src =
                    artikel.bild_url;

                bild.alt =
                    artikel.titel ||
                    "News";

                bild.onerror =
                    function () {

                        bildContainer.innerHTML = `
                            <div
                                class="
                                    saier-news-modal-no-image
                                "
                            >
                                <i
                                    data-lucide="newspaper"
                                ></i>
                            </div>
                        `;

                        newsIconsAktualisieren();

                    };

                bildContainer.appendChild(
                    bild
                );

            }

        }

        else {

            bildContainer.innerHTML = `

                <div
                    class="
                        saier-news-modal-no-image
                    "
                >

                    <i
                        data-lucide="newspaper"
                    ></i>

                </div>

            `;

        }


        // ====================================
        // NEU BADGE
        // ====================================

        if (
            newsIstNeu(artikel.datum)
        ) {

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "saier-news-badge";


            badge.textContent =
                "NEU";


            bildContainer.appendChild(
                badge
            );

        }


        // ====================================
        // META
        // ====================================

        meta.innerHTML = "";


        const datum =
            document.createElement(
                "span"
            );


        datum.className =
            "saier-news-modal-meta-date";


        datum.textContent =
            datumFormatieren(
                artikel.datum
            );


        meta.appendChild(
            datum
        );


        if (
            artikel.autor
        ) {

            const separator =
                document.createElement(
                    "span"
                );


            separator.className =
                "saier-news-modal-meta-separator";


            separator.textContent =
                "•";


            meta.appendChild(
                separator
            );


            const autor =
                document.createElement(
                    "span"
                );


            autor.className =
                "saier-news-modal-meta-author";


            autor.textContent =
                artikel.autor;


            meta.appendChild(
                autor
            );

        }


        // ====================================
        // TITEL
        // ====================================

        titel.textContent =
            artikel.titel ||
            "Ohne Titel";


        // ====================================
        // INHALT
        // ====================================

        text.textContent =
            artikel.inhalt ||
            "";


        // ====================================
        // MEDIUM IN NEUEM TAB ÖFFNEN
        // ====================================

        bottom.innerHTML = "";

        if (artikel.bild_url) {

            const mediumOeffnen =
                document.createElement("button");

            mediumOeffnen.type = "button";
            mediumOeffnen.className = "saier-news-medium-open";

            const mediumText =
                artikel.medien_typ === "pdf"
                    ? "PDF öffnen"
                    : "Bild öffnen";

            mediumOeffnen.innerHTML = `
                ${mediumText}
                <i data-lucide="external-link"></i>
            `;

            mediumOeffnen.title =
                artikel.medien_typ === "pdf"
                    ? "PDF in neuem Tab öffnen"
                    : "Bild in neuem Tab öffnen";

            mediumOeffnen.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const neuesFenster =
                        window.open(
                            artikel.bild_url,
                            "_blank"
                        );

                    if (neuesFenster) {
                        neuesFenster.opener = null;
                    }
                }
            );

            bottom.appendChild(mediumOeffnen);
        }

        const hinweis =
            document.createElement("div");

        hinweis.textContent =
            artikel.created_at
                ? "Veröffentlicht im SAIER INTERN Newsportal"
                : "";

        bottom.appendChild(hinweis);


        // ====================================
        // ÖFFNEN
        // ====================================

        modal.classList.add(
            "offen"
        );


        document.body.classList.add(
            "saier-news-modal-open"
        );


        newsIconsAktualisieren();

    }


    // ========================================
    // MODAL ERSTELLEN
    // ========================================

    function newsModalErstellen() {

        if (
            document.getElementById(
                "saierNewsModal"
            )
        ) {
            return;
        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "saierNewsModal";


        modal.className =
            "saier-news-modal";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        modal.innerHTML = `

            <div
                class="saier-news-modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Newsartikel"
            >

                <button
                    type="button"
                    class="saier-news-modal-close"
                    aria-label="Artikel schließen"
                >

                    <i
                        data-lucide="x"
                    ></i>

                </button>


                <div
                    class="saier-news-modal-image"
                ></div>


                <div
                    class="saier-news-modal-content"
                >

                    <div
                        class="saier-news-modal-meta"
                    ></div>


                    <h2
                        class="saier-news-modal-title"
                    ></h2>


                    <div
                        class="saier-news-modal-text"
                    ></div>


                    <div
                        class="saier-news-modal-bottom"
                    ></div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        // ====================================
        // SCHLIESSEN BUTTON
        // ====================================

        const closeButton =
            modal.querySelector(
                ".saier-news-modal-close"
            );


        closeButton.addEventListener(
            "click",
            newsModalSchliessen
        );


        // ====================================
        // AUSSERHALB KLICKEN
        // ====================================

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    newsModalSchliessen();

                }

            }
        );


        // ====================================
        // ESC
        // ====================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    const aktuellesModal =
                        document.getElementById(
                            "saierNewsModal"
                        );


                    if (
                        aktuellesModal &&
                        aktuellesModal.classList.contains(
                            "offen"
                        )
                    ) {

                        newsModalSchliessen();

                    }

                }

            }
        );


        newsIconsAktualisieren();

    }


    // ========================================
    // MODAL SCHLIESSEN
    // ========================================

    function newsModalSchliessen() {

        const modal =
            document.getElementById(
                "saierNewsModal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "offen"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "saier-news-modal-open"
        );

    }


    // ========================================
    // DATUM FORMATIEREN
    // ========================================

    function datumFormatieren(
        datum
    ) {

        if (!datum) {
            return "";
        }


        const datumObjekt =
            new Date(
                datum + "T00:00:00"
            );


        if (
            Number.isNaN(
                datumObjekt.getTime()
            )
        ) {

            return datum;

        }


        return datumObjekt.toLocaleDateString(
            "de-DE",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        );

    }


    // ========================================
    // LUCIDE ICONS
    // ========================================

    async function newsMedienUrlErmitteln(bildUrl) {

        if (!bildUrl) {
            return null;
        }

        // Bereits vollständige URLs unverändert verwenden.
        if (/^https?:\/\//i.test(String(bildUrl))) {
            return String(bildUrl);
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .storage
                .from("news")
                .createSignedUrl(
                    String(bildUrl),
                    60 * 60 * 24
                );

            if (error || !data?.signedUrl) {
                console.error(
                    "News-Medium konnte nicht geladen werden:",
                    error
                );
                return null;
            }

            return data.signedUrl;

        } catch (error) {

            console.error(
                "Fehler beim Erzeugen der News-Medien-URL:",
                error
            );

            return null;
        }
    }


    function newsIstNeu(datum) {

        if (!datum) {
            return false;
        }

        // „NEU“ gilt am Veröffentlichungsdatum und an den
        // beiden folgenden Kalendertagen.
        const teile = String(datum).slice(0, 10).split("-");

        if (teile.length !== 3) {
            return false;
        }

        const jahr = Number(teile[0]);
        const monat = Number(teile[1]);
        const tag = Number(teile[2]);

        if (
            !Number.isInteger(jahr) ||
            !Number.isInteger(monat) ||
            !Number.isInteger(tag)
        ) {
            return false;
        }

        const newsDatum =
            new Date(jahr, monat - 1, tag);

        const heute = new Date();

        const heuteOhneZeit =
            new Date(
                heute.getFullYear(),
                heute.getMonth(),
                heute.getDate()
            );

        const differenz =
            Math.floor(
                (heuteOhneZeit.getTime() - newsDatum.getTime()) /
                (1000 * 60 * 60 * 24)
            );

        return differenz >= 0 && differenz <= 2;
    }


    function newsIconsAktualisieren() {

        if (
            typeof lucide !== "undefined"
        ) {

            lucide.createIcons();

        }

    }


    // ========================================
    // ÖFFENTLICHE FUNKTION
    // ========================================

    window.newsLaden =
        newsLaden;


    // ========================================
    // NEWS STARTEN
    // ========================================

    async function newsStarten() {

        newsStylesLaden();


        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "Supabase Client wurde nicht gefunden."
            );

            return;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(
                "Supabase Session konnte nicht geladen werden:",
                error
            );

            return;

        }


        if (
            data &&
            data.session
        ) {

            newsLaden();

        }


        supabaseClient
            .auth
            .onAuthStateChange(
                function (event) {

                    if (
                        event ===
                        "SIGNED_IN"
                    ) {

                        newsLaden();

                    }

                }
            );

    }


    // ========================================
    // INITIALISIERUNG
    // ========================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            newsStarten
        );

    }

    else {

        newsStarten();

    }


})();