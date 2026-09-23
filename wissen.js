/* ========================================
   SAIERAPP – WISSEN
   ======================================== */
(() => {
  "use strict";

  const KATEGORIEN = "wissen_kategorien";
  const DOKUMENTE = "wissen";
  const BUCKET = "wissen";
  let admin = false;
  let kategorien = [];
  let wissenDokumente = [];
  let wissenSuchbegriff = "";

  const sb = () => (typeof supabaseClient !== "undefined" ? supabaseClient : null);

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
    }[c]));
  }

  function datum(v) {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("de-DE", {
      day:"2-digit", month:"long", year:"numeric"
    });
  }

  async function adminPruefen() {
    const client = sb();
    if (!client) return false;

    try {
      const { data: { user } = {} } = await client.auth.getUser();
      if (!user) return false;

      const { data, error } = await client
        .from("employees")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("Wissen: Admin-Prüfung fehlgeschlagen:", error.message);
        return false;
      }

      return data?.is_admin === true;
    } catch (error) {
      console.warn("Wissen: Admin-Prüfung fehlgeschlagen:", error);
      return false;
    }
  }

  async function kategorienLaden() {
    const client = sb();
    if (!client) return;

    const { data, error } = await client
      .from(KATEGORIEN)
      .select("id,name,created_at")
      .order("name", { ascending:true });

    if (error) throw error;

    kategorien = data || [];

    const filter = document.getElementById("wissenKategorieAuswahl");
    const upload = document.getElementById("wissenUploadKategorie");

    if (filter) {
      const value = filter.value;
      filter.innerHTML = `<option value="">Alle Bereiche</option>` +
        kategorien
          .map(k => `<option value="${esc(k.name)}">${esc(k.name)}</option>`)
          .join("");
      filter.value = kategorien.some(k => k.name === value) ? value : "";
    }

    if (upload) {
      const value = upload.value;
      upload.innerHTML = `<option value="">Bitte auswählen</option>` +
        kategorien
          .map(k => `<option value="${esc(k.name)}">${esc(k.name)}</option>`)
          .join("");
      upload.value = kategorien.some(k => k.name === value) ? value : "";
    }
  }

  async function dateiUrlErmitteln(doc) {
    // Die aktuelle Tabelle besitzt datei_url, nicht storage_path.
    // Beim Upload speichern wir dort den Storage-Pfad. Falls dort bereits
    // eine vollständige URL steht, wird sie direkt verwendet.
    const gespeichert = doc.datei_url || "";

    if (/^https?:\/\//i.test(gespeichert)) {
      return gespeichert;
    }

    if (!gespeichert) return "";

    const { data, error } = await sb()
      .storage
      .from(BUCKET)
      .createSignedUrl(gespeichert, 3600);

    if (error) {
      console.warn("Wissen: PDF konnte nicht geöffnet werden:", error.message);
      return "";
    }

    return data?.signedUrl || "";
  }

  function sucheNormalisieren(value) {
    return String(value || "")
      .toLocaleLowerCase("de-DE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function wissenSucheEinrichten() {
    const filter = document.getElementById("wissenKategorieAuswahl");
    if (!filter) return null;

    let suche = document.getElementById("wissenSuchfeld");
    if (suche) {
      suche.value = wissenSuchbegriff;
      return suche;
    }

    const container = document.createElement("div");
    container.className = "wissen-suche";
    container.innerHTML = `
      <div class="wissen-suche-feld">
        <i data-lucide="search" aria-hidden="true"></i>
        <input
          id="wissenSuchfeld"
          type="search"
          placeholder="Dokumente durchsuchen …"
          autocomplete="off"
          aria-label="Dokumente durchsuchen"
        >
        <button type="button" id="wissenSucheLeeren" class="wissen-suche-leeren" aria-label="Suche löschen" title="Suche löschen" hidden>
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>
    `;

    filter.parentElement?.appendChild(container);
    suche = container.querySelector("#wissenSuchfeld");
    const leeren = container.querySelector("#wissenSucheLeeren");

    const aktualisieren = () => {
      wissenSuchbegriff = suche.value.trim();
      if (leeren) leeren.hidden = !wissenSuchbegriff;
      wissenKartenRendern();
    };

    suche.addEventListener("input", aktualisieren);
    leeren?.addEventListener("click", () => {
      suche.value = "";
      wissenSuchbegriff = "";
      leeren.hidden = true;
      wissenKartenRendern();
      suche.focus();
    });

    if (window.lucide) lucide.createIcons();
    return suche;
  }

  async function wissenKartenRendern() {
    const list = document.getElementById("wissenListe");
    if (!list) return;

    const suche = sucheNormalisieren(wissenSuchbegriff);
    const daten = wissenDokumente.filter(doc => {
      if (!suche) return true;
      return sucheNormalisieren(doc.titel || "Ohne Titel").includes(suche);
    });

    if (!daten.length) {
      list.innerHTML = wissenSuchbegriff
        ? `<div class="wissen-status">Keine Dokumente für „${esc(wissenSuchbegriff)}“ gefunden.</div>`
        : `<div class="wissen-status">Für diesen Bereich sind noch keine Dateien eingestellt.</div>`;
      return;
    }

    const cards = daten.map(doc => {
      const url = doc._wissenUrl || "";
      if (!url) return "";

      return `
        <article class="wissen-karte" data-url="${esc(url)}">
          <div class="wissen-vorschau">
            <iframe src="${esc(url)}#toolbar=0&navpanes=0&scrollbar=0" title="PDF-Vorschau"></iframe>
          </div>
          <div class="wissen-karte-inhalt">
            <span class="wissen-karte-kategorie">${esc(doc.hersteller || "")}</span>
            <h2 class="wissen-karte-titel">${esc(doc.titel || "Ohne Titel")}</h2>
            <span class="wissen-karte-datum">${datum(doc.erstellt_am)}</span>
            ${admin ? `
              <div class="wissen-datei-aktionen">
                <button type="button" class="wissen-datei-bearbeiten"
                        data-id="${esc(doc.id)}"
                        data-title="${esc(doc.titel || "Ohne Titel")}">
                  <i data-lucide="pencil"></i>
                  <span>Bearbeiten</span>
                </button>
                <button type="button" class="wissen-datei-loeschen"
                        data-id="${esc(doc.id)}"
                        data-title="${esc(doc.titel || "Ohne Titel")}"
                        data-path="${esc(doc.datei_url || "")}">
                  <i data-lucide="trash-2"></i>
                  <span>Löschen</span>
                </button>
              </div>
            ` : ""}
          </div>
        </article>
      `;
    }).filter(Boolean);

    list.innerHTML = cards.join("") || `<div class="wissen-status">Keine PDF-Dokumente gefunden.</div>`;

    list.querySelectorAll(".wissen-karte").forEach(card => {
      card.addEventListener("click", (event) => {
        if (event.target.closest(".wissen-datei-bearbeiten, .wissen-datei-loeschen")) return;
        window.open(card.dataset.url, "_blank", "noopener,noreferrer");
      });
    });

    list.querySelectorAll(".wissen-datei-bearbeiten").forEach(button => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        await wissenDateiBearbeiten(button.dataset.id, button.dataset.title);
      });
    });

    list.querySelectorAll(".wissen-datei-loeschen").forEach(button => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        await wissenDateiLoeschen(button.dataset.id, button.dataset.title, button.dataset.path);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  async function wissenLaden() {
    const list = document.getElementById("wissenListe");
    const client = sb();
    if (!list) return;

    if (!client) {
      list.innerHTML = `<div class="wissen-status">Supabase ist nicht verfügbar.</div>`;
      return;
    }

    list.innerHTML = `<div class="wissen-status">Wissen wird geladen ...</div>`;

    try {
      // Die Admin-Prüfung darf das Laden der normalen Wissensseite niemals blockieren.
      admin = await adminPruefen();

      const adminBox = document.getElementById("wissenAdminAktionen");
      if (adminBox) adminBox.style.display = admin ? "flex" : "none";

      try {
        await kategorienLaden();
      } catch (error) {
        console.warn("Wissen: Kategorien konnten nicht geladen werden:", error.message);
      }

      const filter = document.getElementById("wissenKategorieAuswahl")?.value || "";

      // WICHTIG: Die Tabelle public.wissen verwendet die Spalte "title".
      let query = client
        .from(DOKUMENTE)
        .select("id,titel,hersteller,beschreibung,inhalt,datei_url,datei_name,autor,erstellt_am,aktualisiert_am,aktiv")
        .eq("aktiv", true)
        .order("titel", { ascending:true });

      if (filter) {
        query = query.eq("hersteller", filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      wissenDokumente = [];

      if (data?.length) {
        for (const doc of data) {
          const url = await dateiUrlErmitteln(doc);
          if (!url) continue;
          doc._wissenUrl = url;
          wissenDokumente.push(doc);
        }
      }

      wissenSucheEinrichten();
      await wissenKartenRendern();
    } catch (e) {
      console.error("Wissen:", e);
      list.innerHTML = `
        <div class="wissen-status">
          Die Wissensdaten konnten nicht geladen werden.<br>
          <small>${esc(e?.message || "Unbekannter Fehler")}</small>
        </div>`;
    }
  }

  async function wissenDateiBearbeiten(id, titel) {
    if (!admin) return;

    const neuerTitel = prompt("Name der Datei bearbeiten:", titel || "");
    if (neuerTitel === null) return;

    const bereinigt = neuerTitel.trim();
    if (!bereinigt) {
      alert("Der Dateiname darf nicht leer sein.");
      return;
    }

    if (bereinigt === (titel || "").trim()) return;

    try {
      const client = sb();
      if (!client) throw new Error("Supabase ist nicht verfügbar.");

      const { error } = await client
        .from(DOKUMENTE)
        .update({ titel: bereinigt })
        .eq("id", id);

      if (error) throw error;

      await wissenLaden();
    } catch (error) {
      console.error("Wissen Datei bearbeiten:", error);
      alert(`Der Dateiname konnte nicht geändert werden.\n\n${error?.message || "Unbekannter Fehler"}`);
    }
  }

  async function wissenDateiLoeschen(id, titel, path) {
    if (!admin) return;

    const bestaetigt = confirm(
      `Datei "${titel || "Ohne Titel"}" wirklich löschen?\n\n` +
      "Die PDF wird aus dem Speicher und aus der Wissensdatenbank entfernt. Dieser Vorgang kann nicht rückgängig gemacht werden."
    );

    if (!bestaetigt) return;

    try {
      const client = sb();
      if (!client) throw new Error("Supabase ist nicht verfügbar.");

      // Zuerst die PDF aus dem privaten Storage entfernen.
      if (path && !/^https?:\/\//i.test(path)) {
        const { error: storageError } = await client
          .storage
          .from(BUCKET)
          .remove([path]);

        if (storageError) throw storageError;
      }

      // Danach den Datensatz aus der Wissensdatenbank entfernen.
      const { error: dbError } = await client
        .from(DOKUMENTE)
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      await wissenLaden();
    } catch (error) {
      console.error("Wissen Datei löschen:", error);
      alert(`Die Datei konnte nicht gelöscht werden.\n\n${error?.message || "Unbekannter Fehler"}`);
    }
  }

  async function kategorienVerwaltenLaden() {
    const list = document.getElementById("wissenKategorienListe");
    if (!list || !sb()) return;

    try {
      const { data, error } = await sb()
        .from(KATEGORIEN)
        .select("id,name")
        .order("name", { ascending:true });

      if (error) throw error;

      list.innerHTML = (data || []).map(k => `
        <div class="wissen-kategorie-item">
          <strong>${esc(k.name)}</strong>
          <button type="button" class="wissen-kategorie-delete"
                  data-id="${esc(k.id)}" data-name="${esc(k.name)}">Löschen</button>
        </div>
      `).join("") || `<div class="wissen-status">Noch keine Kategorien.</div>`;

      list.querySelectorAll(".wissen-kategorie-delete").forEach(btn => {
        btn.onclick = () => kategorieLoeschen(btn.dataset.id, btn.dataset.name);
      });
    } catch (e) {
      console.error("Wissen Kategorien:", e);
      list.innerHTML = `<div class="wissen-status">Kategorien konnten nicht geladen werden.<br><small>${esc(e?.message || "Unbekannter Fehler")}</small></div>`;
    }
  }

  async function kategorieLoeschen(id, name) {
    const { count, error } = await sb()
      .from(DOKUMENTE)
      .select("id", { count:"exact", head:true })
      .eq("hersteller", name)
      .eq("aktiv", true);

    if (error) return alert(error.message);

    if ((count || 0) > 0) {
      alert(`Die Kategorie "${name}" kann nicht gelöscht werden.\n\nEs befinden sich noch ${count} Dokumente darin.`);
      return;
    }

    if (!confirm(`Kategorie "${name}" wirklich löschen?`)) return;

    const { error: delError } = await sb()
      .from(KATEGORIEN)
      .delete()
      .eq("id", id);

    if (delError) return alert(delError.message);

    await kategorienLaden();
    await kategorienVerwaltenLaden();
  }

  // Lädt externe Bibliotheken erst dann, wenn tatsächlich eine große PDF
  // verarbeitet werden muss. Dadurch bleibt die normale Wissensansicht leicht.
  async function wissenScriptLaden(src, vorhanden) {
    if (vorhanden()) return;

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Bibliothek konnte nicht geladen werden: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function wissenPdfKomprimieren(file, status) {
    const MAX_UPLOAD_BYTES = 19 * 1024 * 1024;

    if (file.size <= MAX_UPLOAD_BYTES) {
      return file;
    }

    status.textContent = `PDF ist ${ (file.size / 1024 / 1024).toFixed(1) } MB groß. PDF wird automatisch verkleinert ...`;

    await wissenScriptLaden(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
      () => typeof window.pdfjsLib !== "undefined"
    );

    await wissenScriptLaden(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      () => typeof window.jspdf?.jsPDF !== "undefined"
    );

    const pdfjsLib = window.pdfjsLib;
    const jsPDF = window.jspdf.jsPDF;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const originalPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Wir versuchen mehrere Qualitätsstufen. So bleiben normale PDFs möglichst
    // lesbar, während sehr große/scannte PDFs stärker verkleinert werden können.
    const stufen = [
      { scale: 1.25, quality: 0.68 },
      { scale: 1.05, quality: 0.56 },
      { scale: 0.90, quality: 0.46 },
      { scale: 0.75, quality: 0.36 },
      { scale: 0.62, quality: 0.28 },
      { scale: 0.50, quality: 0.22 }
    ];

    let bestBlob = null;

    for (let stufeIndex = 0; stufeIndex < stufen.length; stufeIndex++) {
      const { scale, quality } = stufen[stufeIndex];

      status.textContent = `PDF wird optimiert ... Stufe ${stufeIndex + 1}/${stufen.length}`;

      const ersteSeite = await originalPdf.getPage(1);
      const ersteViewport = ersteSeite.getViewport({ scale: 1 });
      const pdf = new jsPDF({
        unit: "pt",
        format: [ersteViewport.width, ersteViewport.height],
        orientation: ersteViewport.width > ersteViewport.height ? "landscape" : "portrait",
        compress: true
      });

      for (let pageNumber = 1; pageNumber <= originalPdf.numPages; pageNumber++) {
        const page = await originalPdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });
        canvas.width = Math.max(1, Math.ceil(renderViewport.width));
        canvas.height = Math.max(1, Math.ceil(renderViewport.height));

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: renderViewport
        }).promise;

        if (pageNumber > 1) {
          pdf.addPage(
            [viewport.width, viewport.height],
            viewport.width > viewport.height ? "landscape" : "portrait"
          );
        }

        // Das Canvas explizit als JPEG mit der jeweiligen Qualitätsstufe
        // erzeugen. Dadurch wird die quality-Einstellung tatsächlich wirksam.
        const jpegData = canvas.toDataURL("image/jpeg", quality);

        pdf.addImage(
          jpegData,
          "JPEG",
          0,
          0,
          viewport.width,
          viewport.height,
          undefined,
          "FAST",
          0
        );

        // Canvas sofort freigeben, damit große PDFs nicht unnötig viel RAM belegen.
        canvas.width = 1;
        canvas.height = 1;

        if (pageNumber === originalPdf.numPages || pageNumber % 5 === 0) {
          const prozent = Math.round((pageNumber / originalPdf.numPages) * 100);
          status.textContent = `PDF wird optimiert ... ${prozent}%`;
          await new Promise(requestAnimationFrame);
        }
      }

      bestBlob = pdf.output("blob");

      if (bestBlob.size <= MAX_UPLOAD_BYTES) {
        break;
      }
    }

    if (!bestBlob || bestBlob.size >= file.size) {
      // Falls die Optimierung keinen Vorteil bringt, lieber die Originaldatei
      // nicht hochladen und das Supabase-Limit verständlich erklären.
      throw new Error(
        `Die PDF konnte nicht unter 19 MB verkleinert werden (Ergebnis: ${bestBlob ? (bestBlob.size / 1024 / 1024).toFixed(1) : "unbekannt"} MB). Bitte die PDF extern komprimieren.`
      );
    }

    if (bestBlob.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `Die PDF ist nach der Optimierung noch ${ (bestBlob.size / 1024 / 1024).toFixed(1) } MB groß. Das Upload-Limit beträgt 20 MB.`
      );
    }

    const neuerName = file.name.replace(/\.pdf$/i, "") + "_optimiert.pdf";
    status.textContent = `PDF optimiert: ${(file.size / 1024 / 1024).toFixed(1)} MB → ${(bestBlob.size / 1024 / 1024).toFixed(1)} MB. Upload läuft ...`;

    return new File([bestBlob], neuerName, {
      type: "application/pdf",
      lastModified: Date.now()
    });
  }

  async function upload(e) {
    e.preventDefault();

    const status = document.getElementById("wissenUploadStatus");
    const file = document.getElementById("wissenUploadDatei")?.files?.[0];
    const titel = document.getElementById("wissenUploadTitel")?.value.trim();
    const hersteller = document.getElementById("wissenUploadKategorie")?.value;

    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
      status.textContent = "Bitte eine PDF-Datei auswählen.";
      return;
    }

    if (!titel || !hersteller) {
      status.textContent = "Bitte Titel und Bereich ausfüllen.";
      return;
    }

    status.textContent = "PDF wird vorbereitet ...";

    try {
      const { data: { user } = {} } = await sb().auth.getUser();
      if (!user) throw new Error("Du bist nicht angemeldet.");

      const uploadFile = await wissenPdfKomprimieren(file, status);

      const safe = uploadFile.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const path = `${hersteller.replace(/[^a-zA-Z0-9_-]/g, "_")}/${crypto.randomUUID()}_${safe}`;

      status.textContent = "PDF wird zu Supabase hochgeladen ...";

      const { error: uploadError } = await sb()
        .storage
        .from(BUCKET)
        .upload(path, uploadFile, {
          contentType: "application/pdf",
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Die Tabelle hat kein storage_path-Feld. Wir speichern deshalb den
      // privaten Storage-Pfad in datei_url und erzeugen beim Anzeigen eine
      // zeitlich begrenzte Signed URL.
      const { error: dbError } = await sb()
        .from(DOKUMENTE)
        .insert({
          titel: titel,
          hersteller,
          datei_url: path,
          datei_name: file.name,
          autor: user.id,
          aktiv: true
        });

      if (dbError) {
        await sb().storage.from(BUCKET).remove([path]);
        throw dbError;
      }

      status.textContent = "PDF erfolgreich hochgeladen.";
      document.getElementById("wissenUploadForm")?.reset();
      await wissenLaden();

      setTimeout(() => {
        const panel = document.getElementById("wissenUploadPanel");
        if (panel) panel.hidden = true;
        status.textContent = "";
      }, 800);
    } catch (error) {
      console.error("Wissen Upload:", error);
      status.textContent = `Upload fehlgeschlagen: ${error?.message || "Unbekannter Fehler"}`;
    }
  }

  window.wissenLaden = wissenLaden;

  window.wissenUploadOeffnen = () => {
    if (!admin) return;
    document.getElementById("wissenUploadPanel").hidden = false;
    document.getElementById("wissenKategorienPanel").hidden = true;
    if (window.lucide) lucide.createIcons();
  };

  window.wissenUploadSchliessen = () => {
    const panel = document.getElementById("wissenUploadPanel");
    if (panel) panel.hidden = true;
  };

  window.wissenKategorienOeffnen = async () => {
    if (!admin) return;
    document.getElementById("wissenKategorienPanel").hidden = false;
    document.getElementById("wissenUploadPanel").hidden = true;
    await kategorienVerwaltenLaden();
    if (window.lucide) lucide.createIcons();
  };

  window.wissenKategorienSchliessen = () => {
    const panel = document.getElementById("wissenKategorienPanel");
    if (panel) panel.hidden = true;
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const filter = document.getElementById("wissenKategorieAuswahl");
    filter?.addEventListener("change", wissenLaden);

    document.getElementById("wissenKategorieForm")?.addEventListener("submit", async e => {
      e.preventDefault();
      if (!admin) return;

      const input = document.getElementById("wissenNeueKategorie");
      const name = input.value.trim();
      const status = document.getElementById("wissenKategorienStatus");
      if (!name) return;

      const { error } = await sb().from(KATEGORIEN).insert({ name });

      if (error) {
        status.textContent = error.code === "23505"
          ? "Diese Kategorie gibt es bereits."
          : error.message;
        return;
      }

      input.value = "";
      status.textContent = "Kategorie erstellt.";
      await kategorienLaden();
      await kategorienVerwaltenLaden();
    });

    document.getElementById("wissenUploadForm")?.addEventListener("submit", upload);

    // Falls Wissen bereits beim Start aktiv ist.
    if (document.getElementById("wissen")?.classList.contains("aktiv")) {
      wissenLaden();
    }
  });
})();