// ========================================
// SAIER INTERN
// Haupt-JavaScript
// ========================================


// ----------------------------------------
// Seite wechseln
// ----------------------------------------

function zeigeSeite(seitenId, button) {

    // Alle Seiten ausblenden
    const seiten = document.querySelectorAll(".seite");

    seiten.forEach(function(seite) {
        seite.classList.remove("aktiv");
    });


    // Gewählte Seite anzeigen
    const gewaehlteSeite = document.getElementById(seitenId);

    if (gewaehlteSeite) {
        gewaehlteSeite.classList.add("aktiv");
    }


    // Alle Navigationsbuttons deaktivieren
    const buttons = document.querySelectorAll(".nav-button");

    buttons.forEach(function(buttonElement) {
        buttonElement.classList.remove("aktiv");
    });


    // Aktuellen Button aktiv setzen
    if (button) {
        button.classList.add("aktiv");
    }


    // Seite nach oben scrollen
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ----------------------------------------
// Lucide Icons laden
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function() {

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

});