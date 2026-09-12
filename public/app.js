/**
 * BhumiRakshak - Main Assessment Dashboard Client Script
 */

const state = {
  currentLocation: {
    name: "Wayanad, Kerala",
    lat: 11.6854,
    lon: 76.1320
  },
  currentUser: null,
  map: null,
  userMarker: null,
  riskRadiusCircle: null,
  isroMarkersLayer: null,
  debounceTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initEventListeners();
  initAuth();
  loadHistoricalMarkers();
  loadRecentReports();

  // Check URL parameters (e.g. from map.html or alerts.html)
  const urlParams = new URLSearchParams(window.location.search);
  const paramLat = parseFloat(urlParams.get("lat"));
  const paramLon = parseFloat(urlParams.get("lon"));
  const paramName = urlParams.get("name");

  if (!isNaN(paramLat) && !isNaN(paramLon)) {
    assessLocation(paramLat, paramLon, paramName || `Location (${paramLat}, ${paramLon})`);
  } else {
    // Default initial location
    assessLocation(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation.name);
  }

  // Listen to multi-language changes
  window.addEventListener("languageChanged", () => {
    // Re-render assessment with current language
    if (state.lastAssessmentData && state.lastWeatherData) {
      renderAssessment(state.lastAssessmentData, state.lastWeatherData);
    }
  });
});

// -------------------------------------------------------------
// 1. Mini-Map Preview Initialization
// -------------------------------------------------------------
function initMap() {
  const mapEl = document.getElementById('riskMap');
  if (!mapEl) return;

  state.map = L.map('riskMap').setView([state.currentLocation.lat, state.currentLocation.lon], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap | ISRO NRSC'
  }).addTo(state.map);

  state.isroMarkersLayer = L.layerGroup().addTo(state.map);

  state.map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lng * 10000) / 10000;
    
    let locName = `Point (${roundedLat}, ${roundedLon})`;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        locName = geoData.display_name ? geoData.display_name.split(',').slice(0, 3).join(', ') : locName;
      }
    } catch (err) {}

    assessLocation(roundedLat, roundedLon, locName);
  });
}

// -------------------------------------------------------------
// 2. Risk Assessment Fetcher & UI Updater
// -------------------------------------------------------------
async function assessLocation(lat, lon, name) {
  state.currentLocation = { lat, lon, name };
  showLoading(true);

  // Update input fields & modals
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = name;
  const subDisp = document.getElementById("subLocationDisplay");
  if (subDisp) subDisp.value = `${name} (${lat}, ${lon})`;
  const repLat = document.getElementById("repLat");
  if (repLat) repLat.value = lat;
  const repLon = document.getElementById("repLon");
  if (repLon) repLon.value = lon;
  const repName = document.getElementById("repLocationName");
  if (repName) repName.value = name;

  try {
    const res = await fetch(`/api/risk?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Server responded with error status");
    const json = await res.json();
    
    if (json.success && json.data) {
      state.lastAssessmentData = json.data;
      state.lastWeatherData = json.weather;
      renderAssessment(json.data, json.weather);
      updateMapMarker(lat, lon, name, json.data.risk);
    }
  } catch (err) {
    console.error("Error assessing location risk:", err);
    showToast("⚠️ Could not load risk data. Please check connection.");
  } finally {
    showLoading(false);
  }
}

function renderAssessment(data, weather) {
  const risk = data.risk;
  const factors = data.factorScores;

  // Header tags
  const locEl = document.getElementById("displayLocationName");
  if (locEl) locEl.textContent = `Location: ${data.location.name}`;
  const timeEl = document.getElementById("displayTimestamp");
  if (timeEl) timeEl.textContent = `Updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const confEl = document.getElementById("displayConfidence");
  if (confEl) confEl.textContent = `Confidence: ${risk.confidence}`;

  // Big Badge
  const badge = document.getElementById("riskBadge");
  const badgeIcon = document.getElementById("riskLevelIcon");
  const badgeTitle = document.getElementById("riskLevelTitle");
  const scoreVal = document.getElementById("riskScoreValue");

  if (badge && badgeTitle && scoreVal) {
    badgeTitle.textContent = risk.badgeLabel;
    scoreVal.textContent = `Calculated Risk Score: ${risk.score} / 100`;

    badge.style.borderColor = risk.badgeColor;
    badge.style.backgroundColor = `${risk.badgeColor}18`;
    badgeTitle.style.color = risk.badgeColor;

    if (risk.level === "SEVERE") badgeIcon.textContent = "🔴";
    else if (risk.level === "HIGH") badgeIcon.textContent = "🟠";
    else if (risk.level === "MODERATE") badgeIcon.textContent = "🟡";
    else badgeIcon.textContent = "🟢";
  }

  // In Plain Language
  const summaryEl = document.getElementById("plainSummaryText");
  if (summaryEl) summaryEl.textContent = risk.plainEnglishSummary;

  // Key Physical Reasons
  const reasonsEl = document.getElementById("reasonsList");
  if (reasonsEl) {
    reasonsEl.innerHTML = "";
    data.reasons.forEach(r => {
      const li = document.createElement("li");
      li.textContent = r;
      reasonsEl.appendChild(li);
    });
  }

  // Safety Action Checklist
  const actionEl = document.getElementById("actionList");
  if (actionEl) {
    actionEl.innerHTML = "";
    risk.safetyChecklist.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      actionEl.appendChild(li);
    });
  }

  // Pillar 1: Rainfall
  const r24 = document.getElementById("metricRain24h");
  if (r24) r24.textContent = `${weather.rainLast24h} mm`;
  const r72 = document.getElementById("metricRain72h");
  if (r72) r72.textContent = `${weather.rainLast72h} mm`;
  const rFc = document.getElementById("metricForecast24h");
  if (rFc) rFc.textContent = `${weather.forecastNext24h} mm`;
  const rCat = document.getElementById("metricRainCategory");
  if (rCat) {
    rCat.textContent = weather.rainfallCategory;
    if (weather.rainLast24h >= 60) rCat.style.background = "#ef4444";
    else if (weather.rainLast24h >= 25) rCat.style.background = "#f97316";
    else rCat.style.background = "#334155";
  }

  // Pillar 2: Soil Saturation
  const sSat = document.getElementById("metricSoilSat");
  if (sSat) sSat.textContent = `${weather.saturationPercent}%`;
  const sCat = document.getElementById("metricSoilCategory");
  if (sCat) sCat.textContent = weather.moistureCategory;
  const sVol = document.getElementById("metricSoilVol");
  if (sVol) sVol.textContent = `${weather.volumetricMoisture} m³/m³`;
  const sRisk = document.getElementById("metricSoilRisk");
  if (sRisk) {
    if (weather.saturationPercent >= 80) {
      sRisk.textContent = "Critical (High Pore Pressure)";
      sRisk.style.color = "#ef4444";
    } else if (weather.saturationPercent >= 65) {
      sRisk.textContent = "Elevated";
      sRisk.style.color = "#f97316";
    } else {
      sRisk.textContent = "Normal / Safe";
      sRisk.style.color = "#10b981";
    }
  }

  // Pillar 3: Historical Landslides (ISRO)
  const nearestDist = factors.historicalLandslides.nearestDistanceKm;
  const nDist = document.getElementById("metricNearestDist");
  if (nDist) nDist.textContent = nearestDist >= 999 ? "None nearby" : `${nearestDist} km`;
  const nCnt = document.getElementById("metricNearbyCount");
  if (nCnt) nCnt.textContent = factors.historicalLandslides.countWithin25km;
  const dRank = document.getElementById("metricDistrictRank");
  if (dRank) dRank.textContent = data.location.district !== "Regional Zone" ? `${data.location.district}` : "Himalayan zone";

  // Pillar 4: Field Signs
  const fCnt = document.getElementById("metricFieldSigns");
  if (fCnt) fCnt.textContent = factors.fieldSigns.count;
  const gZone = document.getElementById("metricGsiZone");
  if (gZone) gZone.textContent = data.location.gsiZone ? data.location.gsiZone.split(' ')[0] : "Monitored";
  const rStat = document.getElementById("metricReportStatus");
  if (rStat) rStat.textContent = factors.fieldSigns.count > 0 ? `${factors.fieldSigns.count} recent ground signs` : "None reported within 20km";
}

// -------------------------------------------------------------
// 3. Map Marker & Risk Radius
// -------------------------------------------------------------
function updateMapMarker(lat, lon, name, risk) {
  if (!state.map) return;

  state.map.flyTo([lat, lon], 12, { animate: true, duration: 1 });

  if (state.userMarker) {
    state.userMarker.setLatLng([lat, lon]);
    state.userMarker.setPopupContent(`<b>${name}</b><br>Risk: <strong style="color:${risk.badgeColor};">${risk.badgeLabel}</strong>`);
  } else {
    const customIcon = L.divIcon({
      className: 'user-pin-icon',
      html: `<div style="background:${risk.badgeColor}; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(0,0,0,0.6);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    state.userMarker = L.marker([lat, lon], { icon: customIcon }).addTo(state.map);
    state.userMarker.bindPopup(`<b>${name}</b><br>Risk: <strong style="color:${risk.badgeColor};">${risk.badgeLabel}</strong>`).openPopup();
  }

  if (state.riskRadiusCircle) {
    state.riskRadiusCircle.setLatLng([lat, lon]);
    state.riskRadiusCircle.setStyle({
      color: risk.badgeColor,
      fillColor: risk.badgeColor
    });
  } else {
    state.riskRadiusCircle = L.circle([lat, lon], {
      radius: 5000,
      color: risk.badgeColor,
      fillColor: risk.badgeColor,
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(state.map);
  }
}

async function loadHistoricalMarkers() {
  if (!state.isroMarkersLayer) return;
  try {
    const res = await fetch('/api/landslides/all');
    if (!res.ok) return;
    const data = await res.json();
    const events = data.historicalEvents || [];

    events.forEach(ev => {
      const isroIcon = L.divIcon({
        className: 'isro-marker',
        html: `<div style="background:#ef4444; width:10px; height:10px; border-radius:50%; border:1.5px solid #fff;"></div>`,
        iconSize: [10, 10]
      });

      const m = L.marker([ev.lat, ev.lon], { icon: isroIcon });
      m.bindPopup(`
        <div style="font-size:0.85rem;">
          <strong style="color:#b91c1c;">ISRO Landslide Record</strong><br>
          <strong>${ev.name}</strong><br>
          <span>📍 ${ev.location} (${ev.year})</span>
        </div>
      `);
      state.isroMarkersLayer.addLayer(m);
    });
  } catch (e) {}
}

async function loadRecentReports() {
  const listEl = document.getElementById("reportsListContainer");
  if (!listEl) return;

  try {
    const res = await fetch('/api/reports');
    if (!res.ok) return;
    const json = await res.json();
    const reports = json.reports || [];

    listEl.innerHTML = "";
    if (reports.length === 0) {
      listEl.innerHTML = `<p style="font-size:0.825rem; color:#64748b; padding:0.5rem 0;">No ground signs currently reported in this region.</p>`;
      return;
    }

    reports.slice(0, 3).forEach(rep => {
      const item = document.createElement("div");
      item.className = "report-item";
      const timeStr = rep.timestamp ? new Date(rep.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Recent";
      item.innerHTML = `
        <div class="report-item-header">
          <span class="report-type-badge">⚠️ ${rep.signType ? rep.signType.replace('_', ' ').toUpperCase() : 'SIGN'}</span>
          <span class="report-time">${timeStr}</span>
        </div>
        <div class="report-title">${rep.signTitle || rep.locationName}</div>
        <div class="report-desc">${rep.description}</div>
      `;
      listEl.appendChild(item);
    });
  } catch (e) {}
}

// -------------------------------------------------------------
// 4. Search, Geocoding & Event Listeners
// -------------------------------------------------------------
function initEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnDetect = document.getElementById("btnDetectLocation");
  const autocompleteList = document.getElementById("autocompleteList");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      clearTimeout(state.debounceTimer);
      if (q.length < 3) {
        if (autocompleteList) autocompleteList.classList.add("hidden");
        return;
      }
      state.debounceTimer = setTimeout(() => fetchAutocomplete(q), 350);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (autocompleteList) autocompleteList.classList.add("hidden");
        const q = searchInput.value.trim();
        if (q) performNominatimSearch(q);
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", () => {
      const q = searchInput ? searchInput.value.trim() : "";
      if (q) performNominatimSearch(q);
    });
  }

  if (btnDetect) {
    btnDetect.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("⚠️ Geolocation is not supported by your browser.");
        return;
      }
      btnDetect.textContent = "Locating...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btnDetect.innerHTML = "<span>📍</span> Use My Location";
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lon = Math.round(pos.coords.longitude * 10000) / 10000;
          assessLocation(lat, lon, "My Current Location");
        },
        () => {
          btnDetect.innerHTML = "<span>📍</span> Use My Location";
          showToast("⚠️ Could not detect GPS location.");
        },
        { timeout: 8000 }
      );
    });
  }

  // Quick Chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const lat = parseFloat(chip.dataset.lat);
      const lon = parseFloat(chip.dataset.lon);
      const name = chip.dataset.name;
      assessLocation(lat, lon, name);
    });
  });

  setupModals();
}

async function fetchAutocomplete(query) {
  const list = document.getElementById("autocompleteList");
  if (!list) return;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5`);
    if (!res.ok) return;
    const items = await res.json();

    if (items.length === 0) {
      list.classList.add("hidden");
      return;
    }

    list.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.display_name;
      li.addEventListener("click", () => {
        list.classList.add("hidden");
        const lat = Math.round(parseFloat(item.lat) * 10000) / 10000;
        const lon = Math.round(parseFloat(item.lon) * 10000) / 10000;
        assessLocation(lat, lon, item.display_name.split(',').slice(0, 2).join(', '));
      });
      list.appendChild(li);
    });
    list.classList.remove("hidden");
  } catch (e) {}
}

async function performNominatimSearch(query) {
  try {
    showToast(`Searching location "${query}"...`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=1`);
    const items = await res.json();
    if (items.length > 0) {
      const lat = Math.round(parseFloat(items[0].lat) * 10000) / 10000;
      const lon = Math.round(parseFloat(items[0].lon) * 10000) / 10000;
      assessLocation(lat, lon, items[0].display_name.split(',').slice(0, 2).join(', '));
    } else {
      showToast(`⚠️ No location found for "${query}".`);
    }
  } catch (e) {
    showToast("⚠️ Search failed. Please check network.");
  }
}

// -------------------------------------------------------------
// 5. Modals & Authentication
// -------------------------------------------------------------
function setupModals() {
  const reportModal = document.getElementById("reportModal");
  const subscribeModal = document.getElementById("subscribeModal");

  const btnOpenReport = document.getElementById("btnOpenReportModal");
  if (btnOpenReport && reportModal) {
    btnOpenReport.onclick = () => reportModal.classList.remove("hidden");
  }

  const btnOpenSub = document.getElementById("btnOpenSubscribeModal");
  if (btnOpenSub && subscribeModal) {
    btnOpenSub.onclick = () => subscribeModal.classList.remove("hidden");
  }

  const closeRep = document.getElementById("btnCloseReportModal");
  if (closeRep && reportModal) closeRep.onclick = () => reportModal.classList.add("hidden");
  const cancelRep = document.getElementById("btnCancelReport");
  if (cancelRep && reportModal) cancelRep.onclick = () => reportModal.classList.add("hidden");

  const closeSub = document.getElementById("btnCloseSubscribeModal");
  if (closeSub && subscribeModal) closeSub.onclick = () => subscribeModal.classList.add("hidden");

  // Ground Sign submit
  const repForm = document.getElementById("groundSignForm");
  if (repForm) {
    repForm.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        signType: document.getElementById("repSignType").value,
        signTitle: document.getElementById("repSignType").selectedOptions[0].text,
        locationName: document.getElementById("repLocationName").value,
        lat: document.getElementById("repLat").value,
        lon: document.getElementById("repLon").value,
        description: document.getElementById("repDescription").value,
        reportedBy: document.getElementById("repReporter").value || "Community Observer",
        severity: "High"
      };

      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          reportModal.classList.add("hidden");
          showToast("✅ Ground sign reported! Thank you for protecting neighbors.");
          assessLocation(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation.name);
        }
      } catch (e) {
        showToast("⚠️ Submission error.");
      }
    };
  }

  // Subscribe submit
  const subForm = document.getElementById("subscribeForm");
  if (subForm) {
    subForm.onsubmit = async (e) => {
      e.preventDefault();
      if ("Notification" in window) await Notification.requestPermission();

      const payload = {
        locationName: state.currentLocation.name,
        lat: state.currentLocation.lat,
        lon: state.currentLocation.lon,
        threshold: document.getElementById("subThreshold").value,
        contact: document.getElementById("subContact").value
      };

      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          subscribeModal.classList.add("hidden");
          showToast(`🔔 Alerts active for ${state.currentLocation.name}!`);
        }
      } catch (e) {
        showToast("⚠️ Could not subscribe.");
      }
    };
  }

  // Simulate alert test
  const testAlertBtn = document.getElementById("btnTestAlert");
  if (testAlertBtn) {
    testAlertBtn.onclick = async () => {
      showToast("Checking background alert thresholds...");
      try {
        const res = await fetch("/api/check-alerts", { method: "POST" });
        const json = await res.json();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🚨 BhumiRakshak Landslide Alert", {
            body: `Elevated risk detected near ${state.currentLocation.name}.`,
            icon: "🏔️"
          });
        }
        showToast(`🔔 Alert simulated! Checked ${json.subscriptionsChecked} locations.`);
      } catch (e) {}
    };
  }

  setupSavedLocations();
}

// -------------------------------------------------------------
// 6. User Authentication & Profile
// -------------------------------------------------------------
async function initAuth() {
  const token = localStorage.getItem("bk_auth_token");
  const navLoginBtn = document.getElementById("navLoginBtn");
  const navUserBadge = document.getElementById("navUserBadge");
  const btnSaveCurrentLoc = document.getElementById("btnSaveCurrentLoc");

  if (!token) {
    if (navLoginBtn) navLoginBtn.classList.remove("hidden");
    if (navUserBadge) navUserBadge.classList.add("hidden");
    if (btnSaveCurrentLoc) btnSaveCurrentLoc.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem("bk_auth_token");
      localStorage.removeItem("bk_user");
      return;
    }

    const data = await res.json();
    state.currentUser = data.user;

    if (navLoginBtn) navLoginBtn.classList.add("hidden");
    if (navUserBadge) navUserBadge.classList.remove("hidden");
    if (btnSaveCurrentLoc) btnSaveCurrentLoc.classList.remove("hidden");

    document.getElementById("navUserName").textContent = `👤 ${data.user.name.split(' ')[0]}`;
    document.getElementById("dropdownFullName").textContent = data.user.name;
    document.getElementById("dropdownRolePhone").textContent = `${data.user.role} • ${data.user.phone || 'Alerts active'}`;

    setupUserMenu();
  } catch (err) {}
}

function setupUserMenu() {
  const btn = document.getElementById("btnUserMenu");
  const menu = document.getElementById("userDropdown");
  const btnLogout = document.getElementById("btnLogout");

  if (btn && menu) {
    btn.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    };

    document.addEventListener("click", () => menu.classList.add("hidden"));
  }

  if (btnLogout) {
    btnLogout.onclick = async () => {
      const token = localStorage.getItem("bk_auth_token");
      if (token) {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
        } catch (e) {}
      }
      localStorage.removeItem("bk_auth_token");
      localStorage.removeItem("bk_user");
      state.currentUser = null;
      showToast("Logged out successfully.");
      setTimeout(() => window.location.reload(), 600);
    };
  }
}

function setupSavedLocations() {
  const btnSave = document.getElementById("btnSaveCurrentLoc");
  const savedModal = document.getElementById("savedLocationsModal");
  const btnOpenSaved = document.getElementById("btnOpenSavedModal");
  const btnClose1 = document.getElementById("btnCloseSavedModal");
  const btnClose2 = document.getElementById("btnCloseSavedModal2");

  if (btnSave) {
    btnSave.onclick = async () => {
      const token = localStorage.getItem("bk_auth_token");
      if (!token) {
        showToast("Please sign in to save monitored locations.");
        return;
      }

      try {
        const res = await fetch("/api/user/saved-locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: state.currentLocation.name,
            lat: state.currentLocation.lat,
            lon: state.currentLocation.lon
          })
        });

        if (res.ok) {
          showToast(`⭐ "${state.currentLocation.name}" saved to your safety profile!`);
        }
      } catch (e) {}
    };
  }

  if (btnOpenSaved && savedModal) {
    btnOpenSaved.onclick = async () => {
      savedModal.classList.remove("hidden");
      await renderSavedLocations();
    };
  }

  if (btnClose1 && savedModal) btnClose1.onclick = () => savedModal.classList.add("hidden");
  if (btnClose2 && savedModal) btnClose2.onclick = () => savedModal.classList.add("hidden");
}

async function renderSavedLocations() {
  const container = document.getElementById("savedLocationsList");
  const token = localStorage.getItem("bk_auth_token");
  if (!container || !token) return;

  container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-dim);">Loading saved locations...</p>`;

  try {
    const res = await fetch("/api/user/saved-locations", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    const locs = data.savedLocations || [];

    if (locs.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No locations saved yet. Click the "⭐ Save" button on any location card to bookmark it.</p>`;
      return;
    }

    container.innerHTML = "";
    locs.forEach(loc => {
      const item = document.createElement("div");
      item.className = "saved-loc-item";
      item.innerHTML = `
        <div class="saved-loc-info">
          <strong>${loc.name}</strong>
          <small>Coords: ${loc.lat}, ${loc.lon}</small>
        </div>
        <div class="saved-loc-actions">
          <button class="btn btn-sm btn-primary btn-inspect-saved">Assess Risk</button>
          <button class="btn btn-sm btn-outline btn-delete-saved" title="Remove">✕</button>
        </div>
      `;

      item.querySelector(".btn-inspect-saved").onclick = () => {
        document.getElementById("savedLocationsModal").classList.add("hidden");
        assessLocation(loc.lat, loc.lon, loc.name);
      };

      item.querySelector(".btn-delete-saved").onclick = async () => {
        try {
          await fetch(`/api/user/saved-locations/${loc.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          item.remove();
          showToast(`Removed "${loc.name}".`);
        } catch (e) {}
      };

      container.appendChild(item);
    });
  } catch (e) {
    container.innerHTML = `<p style="color:#ef4444;">Failed to load saved locations.</p>`;
  }
}

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
function showLoading(show) {
  const el = document.getElementById("loadingIndicator");
  const dash = document.getElementById("resultsDashboard");
  if (!el || !dash) return;
  if (show) {
    el.classList.remove("hidden");
    dash.style.opacity = "0.45";
  } else {
    el.classList.add("hidden");
    dash.style.opacity = "1";
  }
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 4000);
}
