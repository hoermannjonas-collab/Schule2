(function () {
  "use strict";

  const cfg = window.WELTKARTE_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const role = params.get("role") === "teacher" || (!params.get("role") && cfg.DEFAULT_ROLE === "teacher") ? "teacher" : "student";
  const sessionCode = (params.get("session") || cfg.SESSION_CODE || "").trim().toUpperCase();
  const configured = /^https:\/\/.+\.supabase\.co$/.test(cfg.SUPABASE_URL || "") &&
    typeof cfg.SUPABASE_ANON_KEY === "string" && cfg.SUPABASE_ANON_KEY.length > 40 &&
    sessionCode && !sessionCode.startsWith("__");

  const $ = (id) => document.getElementById(id);
  const els = {
    roleBadge: $("roleBadge"), sessionBadge: $("sessionBadge"), setupError: $("setupError"),
    studentIntro: $("studentIntro"), teacherStats: $("teacherStats"), studentPanel: $("studentPanel"),
    teacherPanel: $("teacherPanel"), mapLoading: $("mapLoading"), legend: $("legend"),
    selectedCount: $("selectedCount"), selectedList: $("selectedList"), clearButton: $("clearButton"),
    saveDot: $("saveDot"), saveStatus: $("saveStatus"), participantCount: $("participantCount"),
    selectionCount: $("selectionCount"), lastUpdate: $("lastUpdate"), rankingList: $("rankingList"),
    refreshButton: $("refreshButton"), fullscreenButton: $("fullscreenButton"), resetButton: $("resetButton"),
    teacherStatus: $("teacherStatus")
  };

  let db = null;
  let map = null;
  let countriesLayer = null;
  let countriesById = new Map();
  let selected = new Set();
  let results = new Map();
  let participants = 0;
  let saveTimer = null;
  let refreshTimer = null;
  let saving = false;
  let saveAgain = false;
  let scormApi = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function initScorm() {
    function findApi(win) {
      let attempts = 0;
      try {
        while (win && !win.API && win.parent && win.parent !== win && attempts < 10) { win = win.parent; attempts += 1; }
        return win && win.API ? win.API : null;
      } catch (_) { return null; }
    }
    scormApi = findApi(window) || (window.opener ? findApi(window.opener) : null);
    if (!scormApi) return;
    try {
      scormApi.LMSInitialize("");
      const status = scormApi.LMSGetValue("cmi.core.lesson_status");
      if (!status || status === "not attempted") scormApi.LMSSetValue("cmi.core.lesson_status", "incomplete");
      scormApi.LMSCommit("");
    } catch (_) { scormApi = null; }
  }

  function markScormComplete() {
    if (!scormApi) return;
    try { scormApi.LMSSetValue("cmi.core.lesson_status", "completed"); scormApi.LMSCommit(""); } catch (_) {}
  }

  function finishScorm() {
    if (!scormApi) return;
    try { scormApi.LMSSetValue("cmi.core.exit", "suspend"); scormApi.LMSCommit(""); scormApi.LMSFinish(""); } catch (_) {}
  }

  function makeDeviceId() {
    const key = `weltkarte-device-${sessionCode}`;
    let value = localStorage.getItem(key);
    if (!value) {
      value = crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === "x" ? r : (r & 3 | 8)).toString(16);
      });
      localStorage.setItem(key, value);
    }
    return value;
  }

  const deviceId = makeDeviceId();
  const selectionStorageKey = `weltkarte-selection-${sessionCode}`;

  function loadLocalSelection() {
    try { selected = new Set(JSON.parse(localStorage.getItem(selectionStorageKey) || "[]").map(String)); }
    catch (_) { selected = new Set(); }
  }

  function saveLocalSelection() {
    localStorage.setItem(selectionStorageKey, JSON.stringify([...selected]));
  }

  function setSaveStatus(kind, text) {
    els.saveDot.className = `status-dot ${kind || ""}`;
    els.saveStatus.textContent = text;
  }

  function countryId(feature) {
    return String(feature.id).padStart(3, "0");
  }

  function countryName(feature) {
    return feature.properties && feature.properties.name ? feature.properties.name : `Gebiet ${countryId(feature)}`;
  }

  function teacherColor(votes, max) {
    if (!votes) return "#dfe8eb";
    const ratio = votes / Math.max(max, 1);
    if (ratio <= .2) return "#cce8f3";
    if (ratio <= .4) return "#8dccdf";
    if (ratio <= .6) return "#46a7c7";
    if (ratio <= .8) return "#1678b8";
    return "#0b4f82";
  }

  function styleFeature(feature) {
    const id = countryId(feature);
    if (role === "student") {
      const active = selected.has(id);
      return { color: active ? "#075985" : "#748791", weight: active ? 1.4 : .65, fillColor: active ? "#1d9bd1" : "#dfe8eb", fillOpacity: active ? .72 : .28 };
    }
    const max = Math.max(0, ...results.values());
    const votes = results.get(id) || 0;
    return { color: "#607882", weight: .7, fillColor: teacherColor(votes, max), fillOpacity: votes ? .78 : .34 };
  }

  function onCountry(feature, layer) {
    const id = countryId(feature);
    const name = countryName(feature);
    countriesById.set(id, { feature, layer, name });
    layer.bindTooltip(name, { sticky: true, className: "country-tooltip" });
    layer.on("click", () => {
      if (role === "student") {
        selected.has(id) ? selected.delete(id) : selected.add(id);
        layer.setStyle(styleFeature(feature));
        renderStudentList();
        saveLocalSelection();
        scheduleSave();
      } else {
        const votes = results.get(id) || 0;
        const percent = participants ? Math.round(votes / participants * 100) : 0;
        layer.bindPopup(`<strong>${escapeHtml(name)}</strong><br>${votes} von ${participants} Lernenden (${percent}&nbsp;%)`).openPopup();
      }
    });
  }

  async function initMap() {
    map = L.map("map", { minZoom: 1.5, maxZoom: 12, worldCopyJump: true, zoomControl: true }).setView([22, 8], 2);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap-Mitwirkende'
    }).addTo(map);

    const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    if (!response.ok) throw new Error("Kartendaten konnten nicht geladen werden.");
    const topology = await response.json();
    const geo = topojson.feature(topology, topology.objects.countries);
    countriesLayer = L.geoJSON(geo, { style: styleFeature, onEachFeature: onCountry }).addTo(map);
    els.mapLoading.classList.add("hidden");
    if (role === "student") renderStudentList();
    else renderTeacherResults();
  }

  function renderStudentList() {
    const entries = [...selected].map((id) => countriesById.get(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, "de"));
    els.selectedCount.textContent = String(entries.length);
    els.clearButton.disabled = entries.length === 0;
    if (!entries.length) {
      els.selectedList.className = "country-list empty-list";
      els.selectedList.innerHTML = "<li>Noch nichts ausgewählt.</li>";
    } else {
      els.selectedList.className = "country-list";
      els.selectedList.innerHTML = entries.map((entry) => `<li>${escapeHtml(entry.name)}</li>`).join("");
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    setSaveStatus("saving", "Speichern …");
    saveTimer = setTimeout(submitSelection, 300);
  }

  async function submitSelection() {
    if (saving) { saveAgain = true; return; }
    saving = true;
    setSaveStatus("saving", "Speichern …");
    const { error } = await db.rpc("submit_worldmap_selection", {
      p_session_code: sessionCode,
      p_device_id: deviceId,
      p_countries: [...selected]
    });
    saving = false;
    if (error) {
      console.error(error);
      setSaveStatus("error", "Nicht gespeichert – Verbindung prüfen");
    } else {
      setSaveStatus("saved", "Gespeichert");
      markScormComplete();
    }
    if (saveAgain) { saveAgain = false; submitSelection(); }
  }

  function renderLegend(max) {
    const colors = ["#cce8f3", "#8dccdf", "#46a7c7", "#1678b8", "#0b4f82"];
    els.legend.innerHTML = `<strong>Anzahl Lernende</strong><div class="legend-scale">${colors.map((c) => `<i style="background:${c}"></i>`).join("")}</div><div class="legend-labels"><span>1</span><span>${Math.max(max, 1)}</span></div>`;
    els.legend.classList.remove("hidden");
  }

  function renderTeacherResults() {
    if (countriesLayer) countriesLayer.setStyle(styleFeature);
    const rows = [...results.entries()].map(([id, votes]) => ({ id, votes, name: countriesById.get(id)?.name || id })).sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "de"));
    if (!rows.length) {
      els.rankingList.className = "ranking-list empty-list";
      els.rankingList.innerHTML = "<li>Noch keine Markierungen.</li>";
    } else {
      els.rankingList.className = "ranking-list";
      els.rankingList.innerHTML = rows.map((row, index) => `<li><span class="rank">${index + 1}.</span><span>${escapeHtml(row.name)}</span><span class="votes">${row.votes}</span></li>`).join("");
    }
    renderLegend(Math.max(0, ...results.values()));
  }

  async function refreshResults(manual) {
    if (manual) els.teacherStatus.textContent = "Aktualisiere …";
    const { data, error } = await db.rpc("get_worldmap_results", { p_session_code: sessionCode });
    if (error) {
      console.error(error);
      els.teacherStatus.textContent = "Verbindung unterbrochen – neuer Versuch läuft automatisch.";
      return;
    }
    const payload = typeof data === "string" ? JSON.parse(data) : (data || {});
    participants = Number(payload.participants || 0);
    const totalSelections = Number(payload.totalSelections || 0);
    results = new Map((payload.countries || []).map((row) => [String(row.countryId), Number(row.votes)]));
    els.participantCount.textContent = String(participants);
    els.selectionCount.textContent = String(totalSelections);
    els.lastUpdate.textContent = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());
    els.teacherStatus.textContent = "Live-Ansicht aktiv – automatische Aktualisierung alle 2 Sekunden.";
    renderTeacherResults();
    markScormComplete();
  }

  async function resetSession() {
    const teacherKey = window.prompt("Lehrerschlüssel zum Zurücksetzen eingeben:");
    if (!teacherKey) return;
    if (!window.confirm("Wirklich alle Antworten dieser Abfrage löschen?")) return;
    els.teacherStatus.textContent = "Setze Abfrage zurück …";
    const { data, error } = await db.rpc("reset_worldmap_session", { p_session_code: sessionCode, p_teacher_key: teacherKey });
    if (error || data !== true) {
      els.teacherStatus.textContent = error ? "Zurücksetzen fehlgeschlagen." : "Lehrerschlüssel ist nicht korrekt.";
      return;
    }
    await refreshResults(false);
    els.teacherStatus.textContent = "Die Abfrage wurde zurückgesetzt.";
  }

  async function start() {
    initScorm();
    els.roleBadge.textContent = role === "teacher" ? "LEHRERANSICHT" : "SCHÜLERANSICHT";
    els.sessionBadge.textContent = `Sitzung ${sessionCode || "–"}`;
    if (role === "teacher") {
      els.teacherStats.classList.remove("hidden");
      els.teacherPanel.classList.remove("hidden");
    } else {
      els.studentIntro.classList.remove("hidden");
      els.studentPanel.classList.remove("hidden");
      loadLocalSelection();
    }

    if (!configured || !window.supabase || !window.L || !window.topojson) {
      els.setupError.classList.remove("hidden");
      els.mapLoading.classList.add("hidden");
      return;
    }

    db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    try {
      await initMap();
      if (role === "teacher") {
        await refreshResults(false);
        refreshTimer = setInterval(() => refreshResults(false), 2000);
      } else {
        await submitSelection();
      }
    } catch (error) {
      console.error(error);
      els.mapLoading.innerHTML = "<span>Die Karte konnte nicht geladen werden. Bitte Internetverbindung prüfen und neu laden.</span>";
      els.mapLoading.classList.remove("hidden");
    }
  }

  els.clearButton.addEventListener("click", () => {
    if (!selected.size) return;
    selected.clear();
    if (countriesLayer) countriesLayer.setStyle(styleFeature);
    renderStudentList();
    saveLocalSelection();
    scheduleSave();
  });
  els.refreshButton.addEventListener("click", () => refreshResults(true));
  els.fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  els.resetButton.addEventListener("click", resetSession);
  window.addEventListener("beforeunload", () => { clearInterval(refreshTimer); finishScorm(); });
  start();
})();
