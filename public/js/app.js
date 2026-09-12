(function () {
  const langPicker = document.getElementById("lang-picker");
  if (langPicker) initLanguageSwitcher(langPicker);

  const riskForm = document.getElementById("risk-form");
  const latInput = document.getElementById("loc-lat");
  const lonInput = document.getElementById("loc-lon");
  const nameInput = document.getElementById("loc-name");
  const checkBtn = document.getElementById("check-btn");
  const useLocationBtn = document.getElementById("use-location-btn");
  const coordReadout = document.getElementById("coord-readout");

  const readout = document.getElementById("readout");
  const readoutBadge = document.getElementById("readout-badge");
  const readoutScore = document.getElementById("readout-score");
  const readoutSummary = document.getElementById("readout-summary");
  const readoutChecklist = document.getElementById("readout-checklist");
  const readoutError = document.getElementById("readout-error");

  function dict() {
    return window.__bhumirakshakDict || {};
  }

  function setChecking(isChecking) {
    checkBtn.disabled = isChecking;
    checkBtn.textContent = isChecking
      ? (dict().panel_checking || "Checking…")
      : (dict().panel_check || "Check risk");
  }

  async function runRiskCheck(lat, lon, name) {
    readoutError.style.display = "none";
    readout.classList.remove("is-visible");
    setChecking(true);
    coordReadout.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    try {
      const url = `/api/risk?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&name=${encodeURIComponent(name || "Selected location")}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");

      const risk = json.data.risk;
      readoutBadge.textContent = `${risk.badgeLabel || risk.level}`;
      readoutBadge.className = `readout__badge risk--${risk.level}`;
      readoutScore.textContent = `${risk.score}/100 ${dict().score_label || "score"}`;
      readoutSummary.textContent = risk.plainEnglishSummary || "";

      readoutChecklist.innerHTML = "";
      (risk.safetyChecklist || []).forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        readoutChecklist.appendChild(li);
      });

      readout.classList.add("is-visible");
    } catch (err) {
      readoutError.textContent = err.message || "Could not reach the risk service.";
      readoutError.style.display = "block";
    } finally {
      setChecking(false);
    }
  }

  if (riskForm) {
    riskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;
      runRiskCheck(lat, lon, nameInput.value);
    });
  }

  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) return;
      useLocationBtn.disabled = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          latInput.value = pos.coords.latitude.toFixed(5);
          lonInput.value = pos.coords.longitude.toFixed(5);
          if (!nameInput.value) nameInput.value = "My location";
          useLocationBtn.disabled = false;
          runRiskCheck(pos.coords.latitude, pos.coords.longitude, nameInput.value);
        },
        () => { useLocationBtn.disabled = false; },
        { timeout: 8000 }
      );
    });
  }

  // ---- Landslide atlas (districts) ----
  const atlasList = document.getElementById("atlas-list");
  const statDistricts = document.getElementById("stat-districts");
  const districtOptions = document.getElementById("district-options");

  fetch("/api/districts")
    .then(r => r.json())
    .then(json => {
      const districts = json.districts || [];
      if (statDistricts) statDistricts.textContent = districts.length;
      if (!atlasList) return;
      atlasList.innerHTML = "";
      districts.slice(0, 12).forEach((d, i) => {
        const row = document.createElement("div");
        row.className = "atlas-row";
        row.innerHTML = `
          <div class="atlas-row__rank">${String(i + 1).padStart(2, "0")}</div>
          <div>
            <div class="atlas-row__name">${d.name || d.district || "Unnamed district"}</div>
            <div class="atlas-row__meta">${d.state || ""}${d.eventsCount ? " · " + d.eventsCount + " events" : ""}</div>
          </div>
          <div class="atlas-row__meta">${d.riskCategory || d.vulnerabilityRank || ""}</div>
          <div class="atlas-row__coord">${d.lat ? d.lat.toFixed(2) : ""}${d.lon ? ", " + d.lon.toFixed(2) : ""}</div>
        `;
        atlasList.appendChild(row);

        if (districtOptions && d.lat && d.lon) {
          const opt = document.createElement("option");
          opt.value = d.name || d.district;
          districtOptions.appendChild(opt);
        }
      });
    })
    .catch(() => {
      if (atlasList) atlasList.innerHTML = `<p style="color:var(--ink-soft);">Atlas data is unavailable right now.</p>`;
    });

  // ---- Community ground signs ----
  const reportsList = document.getElementById("reports-list");
  fetch("/api/reports")
    .then(r => r.json())
    .then(json => {
      const reports = json.reports || [];
      if (!reportsList) return;
      if (!reports.length) {
        reportsList.innerHTML = `<p style="color:var(--ink-soft);" data-i18n="community_empty">${dict().community_empty || "No ground signs reported nearby yet."}</p>`;
        return;
      }
      reportsList.innerHTML = "";
      reports.slice(0, 8).forEach(r => {
        const row = document.createElement("div");
        row.className = "report-row";
        const when = r.timestamp ? new Date(r.timestamp).toLocaleDateString() : "";
        row.innerHTML = `
          <div class="report-row__bar" data-severity="${r.severity || "Moderate"}"></div>
          <div>
            <div class="report-row__title">${r.signTitle || "Ground sign"} — ${r.locationName || ""}</div>
            <div class="report-row__desc">${r.description || ""}</div>
          </div>
          <div class="report-row__time">${when}</div>
        `;
        reportsList.appendChild(row);
      });
    })
    .catch(() => {
      if (reportsList) reportsList.innerHTML = `<p style="color:var(--ink-soft);">Reports are unavailable right now.</p>`;
    });

  // ---- Subscribe ----
  const subscribeForm = document.getElementById("subscribe-form");
  const subscribeSuccess = document.getElementById("subscribe-success");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const locationName = document.getElementById("sub-location").value;
      const threshold = document.getElementById("sub-threshold").value;
      const contact = document.getElementById("sub-contact").value;

      // Reuse last checked coordinates if available, otherwise skip lat/lon (server defaults).
      const lat = parseFloat(latInput?.value) || 0;
      const lon = parseFloat(lonInput?.value) || 0;

      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationName, lat, lon, threshold, contact })
        });
        if (!res.ok) throw new Error("subscribe failed");
        subscribeSuccess.classList.add("is-visible");
        subscribeForm.reset();
      } catch (err) {
        subscribeSuccess.classList.remove("is-visible");
      }
    });
  }

  // ---- Health check ----
  const healthReadout = document.getElementById("health-readout");
  if (healthReadout) {
    fetch("/health")
      .then(r => r.json())
      .then(j => { healthReadout.textContent = `server: ${j.status} · db: ${j.isFirestore ? "firestore" : "local json"}`; })
      .catch(() => { healthReadout.textContent = "server unreachable"; });
  }
})();
