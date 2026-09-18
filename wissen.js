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

      if (!data?.length) {
        list.innerHTML = `<div class="wissen-status">Für diesen Bereich sind noch keine Dateien eingestellt.</div>`;
        return;
      }

      const cards = [];

      for (const doc of data) {
        const url = await dateiUrlErmitteln(doc);
        if (!url) continue;

        cards.push(`
          <article class="wissen-karte" data-url="${esc(url)}">
            <div class="wissen-vorschau">
              <iframe src="${esc(url)}#toolbar=0&navpanes=0&scrollbar=0" title="PDF-Vorschau"></iframe>
            </div>
            <div class="wissen-karte-inhalt">
              <span class="wissen-karte-kategorie">${esc(doc.hersteller || "")}</span>
              <h2 class="wissen-karte-titel">${esc(doc.titel || "Ohne Titel")}</h2>
              <span class="wissen-karte-datum">${datum(doc.erstellt_am)}</span>
            </div>
          </article>
        `);
      }

      list.innerHTML = cards.join("") ||
        `<div class="wissen-status">Keine PDF-Dokumente gefunden.</div>`;

      list.querySelectorAll(".wissen-karte").forEach(card => {
        card.addEventListener("click", () => {
          window.open(card.dataset.url, "_blank", "noopener,noreferrer");
        });
      });

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.error("Wissen:", e);
      list.innerHTML = `
        <div class="wissen-status">
          Die Wissensdaten konnten nicht geladen werden.<br>
          <small>${esc(e?.message || "Unbekannter Fehler")}</small>
        </div>`;
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

    status.textContent = "PDF wird hochgeladen ...";

    try {
      const { data: { user } = {} } = await sb().auth.getUser();
      if (!user) throw new Error("Du bist nicht angemeldet.");

      const safe = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const path = `${hersteller.replace(/[^a-zA-Z0-9_-]/g, "_")}/${crypto.randomUUID()}_${safe}`;

      const { error: uploadError } = await sb()
        .storage
        .from(BUCKET)
        .upload(path, file, {
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