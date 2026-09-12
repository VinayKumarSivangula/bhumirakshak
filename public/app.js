/**
 * BhumiRakshak - Landslide Risk Early Warning Web Client
 */

// Global State
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
  reportsMarkersLayer: null,
  cachedHistoricalEvents: [],
  debounceTimer: null
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initEventListeners();
  initAuth();
  loadHistoricalLandslides();
  loadCommunityReports();
  
  // Initial assessment on load
  assessLocation(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation.name);
});

// -------------------------------------------------------------
// 1. Interactive Leaflet Map Initialization
// -------------------------------------------------------------
function initMap() {
  state.map = L.map('riskMap').setView([state.currentLocation.lat, state.currentLocation.lon], 11);

  // High contrast OpenStreetMap layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors | ISRO NRSC'
  }).addTo(state.map);

  state.isroMarkersLayer = L.layerGroup().addTo(state.map);
  state.reportsMarkersLayer = L.layerGroup().addTo(state.map);

  // Click on map to inspect risk anywhere
  state.map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lng * 10000) / 10000;
    
    // Quick reverse geocode or fallback to coordinates
    let locName = `Location (${roundedLat}, ${roundedLon})`;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        locName = geoData.display_name ? geoData.display_name.split(',').slice(0, 3).join(',') : locName;
      }
    } catch (err) {
      console.warn("Reverse geocode failed, using coordinates", err);
    }

    assessLocation(roundedLat, roundedLon, locName);
  });
}

// -------------------------------------------------------------
// 2. Risk Assessment Fetcher & UI Updater
// -------------------------------------------------------------
async function assessLocation(lat, lon, name) {
  state.currentLocation = { lat, lon, name };
  showLoading(true);

  // Update input text & modal pre-fills
  document.getElementById("searchInput").value = name;
  document.getElementById("subLocationDisplay").value = `${name} (${lat}, ${lon})`;
  document.getElementById("repLat").value = lat;
  document.getElementById("repLon").value = lon;
  document.getElementById("repLocationName").value = name;

  try {
    const res = await fetch(`/api/risk?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Server responded with error status");
    const json = await res.json();
    
    if (json.success && json.data) {
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

  // Header & Tags
  document.getElementById("displayLocationName").textContent = `Location: ${data.location.name}`;
  document.getElementById("displayTimestamp").textContent = `Updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  document.getElementById("displayConfidence").textContent = `Confidence: ${risk.confidence}`;

  // Big Risk Badge
  const badge = document.getElementById("riskBadge");
  const badgeIcon = document.getElementById("riskLevelIcon");
  const badgeTitle = document.getElementById("riskLevelTitle");
  const scoreVal = document.getElementById("riskScoreValue");

  badgeTitle.textContent = risk.badgeLabel;
  scoreVal.textContent = `Calculated Risk Score: ${risk.score} / 100`;

  // Color mapping
  badge.style.borderColor = risk.badgeColor;
  badge.style.backgroundColor = `${risk.badgeColor}1a`; // 10% opacity
  badgeTitle.style.color = risk.badgeColor;

  if (risk.level === "SEVERE") {
    badgeIcon.textContent = "🔴";
  } else if (risk.level === "HIGH") {
    badgeIcon.textContent = "🟠";
  } else if (risk.level === "MODERATE") {
    badgeIcon.textContent = "🟡";
  } else {
    badgeIcon.textContent = "🟢";
  }

  // In Plain Words
  document.getElementById("plainSummaryText").textContent = risk.plainEnglishSummary;

  // Key Factors List
  const reasonsEl = document.getElementById("reasonsList");
  reasonsEl.innerHTML = "";
  data.reasons.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r;
    reasonsEl.appendChild(li);
  });

  // Actionable Safety Checklist
  const actionEl = document.getElementById("actionList");
  actionEl.innerHTML = "";
  risk.safetyChecklist.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    actionEl.appendChild(li);
  });

  // Pillar 1: Rainfall
  document.getElementById("metricRain24h").textContent = `${weather.rainLast24h} mm`;
  document.getElementById("metricRain72h").textContent = `${weather.rainLast72h} mm`;
  document.getElementById("metricForecast24h").textContent = `${weather.forecastNext24h} mm`;
  const rainCat = document.getElementById("metricRainCategory");
  rainCat.textContent = weather.rainfallCategory;
  if (weather.rainLast24h >= 60) {
    rainCat.style.background = "#ef4444";
  } else if (weather.rainLast24h >= 25) {
    rainCat.style.background = "#f97316";
  } else {
    rainCat.style.background = "#334155";
  }

  // Pillar 2: Soil Moisture
  document.getElementById("metricSoilSat").textContent = `${weather.saturationPercent}%`;
  document.getElementById("metricSoilCategory").textContent = weather.moistureCategory;
  document.getElementById("metricSoilVol").textContent = `${weather.volumetricMoisture} m³/m³`;
  const soilRisk = document.getElementById("metricSoilRisk");
  if (weather.saturationPercent >= 80) {
    soilRisk.textContent = "Critical (High Pore Pressure)";
    soilRisk.style.color = "#ef4444";
  } else if (weather.saturationPercent >= 65) {
    soilRisk.textContent = "Elevated";
    soilRisk.style.color = "#f97316";
  } else {
    soilRisk.textContent = "Normal / Safe";
    soilRisk.style.color = "#22c55e";
  }

  // Pillar 3: Historical Landslides (ISRO)
  const nearestDist = factors.historicalLandslides.nearestDistanceKm;
  document.getElementById("metricNearestDist").textContent = nearestDist >= 999 ? "None nearby" : `${nearestDist} km`;
  document.getElementById("metricNearbyCount").textContent = factors.historicalLandslides.countWithin25km;
  document.getElementById("metricDistrictRank").textContent = data.location.district !== "Regional Zone" ? `${data.location.district}` : "Regional Himalayan/Ghat zone";
  document.getElementById("metricHistoricZone").textContent = nearestDist <= 15 ? "High Vulnerability Zone" : "Standard Hill Slope";

  // Pillar 4: Field Warning Signs & Susceptibility
  document.getElementById("metricFieldSigns").textContent = factors.fieldSigns.count;
  document.getElementById("metricGsiZone").textContent = data.location.gsiZone ? data.location.gsiZone.split(' ')[0] : "Monitored";
  document.getElementById("metricReportStatus").textContent = factors.fieldSigns.count > 0 ? `${factors.fieldSigns.count} recent ground signs` : "None reported within 20km";
}

// -------------------------------------------------------------
// 3. Map Marker & Risk Radius Management
// -------------------------------------------------------------
function updateMapMarker(lat, lon, name, risk) {
  if (!state.map) return;

  state.map.flyTo([lat, lon], 12, { animate: true, duration: 1 });

  // Update or create user pin
  if (state.userMarker) {
    state.userMarker.setLatLng([lat, lon]);
    state.userMarker.setPopupContent(`<b>${name}</b><br>Landslide Risk: <strong>${risk.badgeLabel}</strong><br>Score: ${risk.score}/100`);
  } else {
    const customIcon = L.divIcon({
      className: 'user-pin-icon',
      html: `<div style="background:${risk.badgeColor}; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    state.userMarker = L.marker([lat, lon], { icon: customIcon }).addTo(state.map);
    state.userMarker.bindPopup(`<b>${name}</b><br>Landslide Risk: <strong>${risk.badgeLabel}</strong><br>Score: ${risk.score}/100`).openPopup();
  }

  // Update or create risk radius circle (5km radius)
  if (state.riskRadiusCircle) {
    state.riskRadiusCircle.setLatLng([lat, lon]);
    state.riskRadiusCircle.setStyle({
      color: risk.badgeColor,
      fillColor: risk.badgeColor,
      fillOpacity: 0.12
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

// -------------------------------------------------------------
// 4. Load & Overlay ISRO Landslide Atlas Inventory
// -------------------------------------------------------------
async function loadHistoricalLandslides() {
  try {
    const res = await fetch('/api/landslides/all');
    if (!res.ok) return;
    const data = await res.json();
    
    state.cachedHistoricalEvents = data.historicalEvents || [];
    renderHistoricalMarkers(state.cachedHistoricalEvents);
  } catch (err) {
    console.warn("Could not load historical landslides:", err);
  }
}

function renderHistoricalMarkers(events) {
  if (!state.isroMarkersLayer) return;
  state.isroMarkersLayer.clearLayers();

  events.forEach(ev => {
    const isroIcon = L.divIcon({
      className: 'isro-marker',
      html: `<div style="background:#ef4444; width:10px; height:10px; border-radius:50%; border:1.5px solid #ffffff;"></div>`,
      iconSize: [10, 10]
    });

    const m = L.marker([ev.lat, ev.lon], { icon: isroIcon });
    m.bindPopup(`
      <div style="font-size:0.85rem;">
        <strong style="color:#b91c1c;">ISRO Landslide Record</strong><br>
        <strong>${ev.name}</strong><br>
        <span>📍 ${ev.location}, ${ev.state}</span><br>
        <span>📅 Year: ${ev.year} | Severity: <b>${ev.severity}</b></span><br>
        <p style="margin-top:4px; font-size:0.8rem; color:#475569;">${ev.description}</p>
      </div>
    `);
    state.isroMarkersLayer.addLayer(m);
  });
}

// -------------------------------------------------------------
// 5. Load & Overlay Community Ground Warning Reports
// -------------------------------------------------------------
async function loadCommunityReports() {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) return;
    const json = await res.json();
    const reports = json.reports || [];
    
    renderReportsList(reports);
    renderReportsMapMarkers(reports);
  } catch (err) {
    console.warn("Could not load community reports:", err);
  }
}

function renderReportsList(reports) {
  const listEl = document.getElementById("reportsListContainer");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (reports.length === 0) {
    listEl.innerHTML = `<p style="font-size:0.85rem; color:#64748b; padding:0.5rem 0;">No ground signs currently reported in this region.</p>`;
    return;
  }

  reports.slice(0, 6).forEach(rep => {
    const item = document.createElement("div");
    item.className = "report-item";
    
    const timeStr = rep.timestamp ? new Date(rep.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Recent";
    const typeLabel = rep.signType ? rep.signType.replace('_', ' ').toUpperCase() : "OBSERVATION";

    item.innerHTML = `
      <div class="report-item-header">
        <span class="report-type-badge">⚠️ ${typeLabel}</span>
        <span class="report-time">${timeStr}</span>
      </div>
      <div class="report-title">${rep.signTitle || rep.locationName}</div>
      <div class="report-desc">${rep.description}</div>
    `;
    listEl.appendChild(item);
  });
}

function renderReportsMapMarkers(reports) {
  if (!state.reportsMarkersLayer) return;
  state.reportsMarkersLayer.clearLayers();

  reports.forEach(rep => {
    const reportIcon = L.divIcon({
      className: 'report-marker',
      html: `<div style="background:#f59e0b; width:12px; height:12px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 4px #000;"></div>`,
      iconSize: [12, 12]
    });

    const m = L.marker([rep.lat, rep.lon], { icon: reportIcon });
    m.bindPopup(`
      <div style="font-size:0.85rem;">
        <strong style="color:#d97706;">⚠️ Community Field Sign</strong><br>
        <strong>${rep.signTitle}</strong><br>
        <span>📍 ${rep.locationName}</span><br>
        <p style="margin-top:4px; font-size:0.8rem; color:#475569;">${rep.description}</p>
      </div>
    `);
    state.reportsMarkersLayer.addLayer(m);
  });
}

// -------------------------------------------------------------
// 6. Search, Geocoding & Autocomplete
// -------------------------------------------------------------
function initEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnDetect = document.getElementById("btnDetectLocation");
  const autocompleteList = document.getElementById("autocompleteList");

  // Search input typing with debounce for autocomplete
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    clearTimeout(state.debounceTimer);
    if (q.length < 3) {
      autocompleteList.classList.add("hidden");
      return;
    }
    state.debounceTimer = setTimeout(() => fetchAutocomplete(q), 350);
  });

  btnSearch.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (q) performNominatimSearch(q);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      autocompleteList.classList.add("hidden");
      const q = searchInput.value.trim();
      if (q) performNominatimSearch(q);
    }
  });

  // GPS "Use My Location"
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
      (err) => {
        btnDetect.innerHTML = "<span>📍</span> Use My Location";
        showToast("⚠️ Could not detect GPS location. Please enter a city name.");
      },
      { timeout: 8000 }
    );
  });

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

  // Modals management
  setupModals();
}

async function fetchAutocomplete(query) {
  const autocompleteList = document.getElementById("autocompleteList");
  try {
    // Search OpenStreetMap Nominatim with India viewbox preference
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5`);
    if (!res.ok) return;
    const items = await res.json();

    if (items.length === 0) {
      autocompleteList.classList.add("hidden");
      return;
    }

    autocompleteList.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.display_name;
      li.addEventListener("click", () => {
        autocompleteList.classList.add("hidden");
        const lat = Math.round(parseFloat(item.lat) * 10000) / 10000;
        const lon = Math.round(parseFloat(item.lon) * 10000) / 10000;
        assessLocation(lat, lon, item.display_name.split(',').slice(0, 2).join(', '));
      });
      autocompleteList.appendChild(li);
    });
    autocompleteList.classList.remove("hidden");
  } catch (err) {
    console.warn("Autocomplete error:", err);
  }
}

async function performNominatimSearch(query) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=1`);
    if (!res.ok) throw new Error("Search request failed");
    const items = await res.json();
    if (items.length > 0) {
      const lat = Math.round(parseFloat(items[0].lat) * 10000) / 10000;
      const lon = Math.round(parseFloat(items[0].lon) * 10000) / 10000;
      assessLocation(lat, lon, items[0].display_name.split(',').slice(0, 2).join(', '));
    } else {
      showToast(`⚠️ No location matches found for "${query}".`);
    }
  } catch (err) {
    showToast("⚠️ Geocoding service error. Please try again.");
  }
}

// -------------------------------------------------------------
// 7. Modals: Ground Sign Reporting & Alert Subscription
// -------------------------------------------------------------
function setupModals() {
  const reportModal = document.getElementById("reportModal");
  const subscribeModal = document.getElementById("subscribeModal");

  // Open buttons
  document.getElementById("btnOpenReportModal").addEventListener("click", () => reportModal.classList.remove("hidden"));
  document.getElementById("btnQuickReport").addEventListener("click", () => reportModal.classList.remove("hidden"));
  document.getElementById("btnOpenSubscribeModal").addEventListener("click", () => subscribeModal.classList.remove("hidden"));

  // Close buttons
  document.getElementById("btnCloseReportModal").addEventListener("click", () => reportModal.classList.add("hidden"));
  document.getElementById("btnCancelReport").addEventListener("click", () => reportModal.classList.add("hidden"));
  document.getElementById("btnCloseSubscribeModal").addEventListener("click", () => subscribeModal.classList.add("hidden"));

  // Submit Ground Sign Form
  document.getElementById("groundSignForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      locationName: document.getElementById("repLocationName").value,
      lat: document.getElementById("repLat").value,
      lon: document.getElementById("repLon").value,
      signType: document.getElementById("repSignType").value,
      signTitle: document.getElementById("repSignType").selectedOptions[0].text,
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
      if (!res.ok) throw new Error("Failed to post report");
      
      reportModal.classList.add("hidden");
      showToast("✅ Ground sign submitted! Neighbors have been alerted.");
      loadCommunityReports();
      // Recalculate risk with new report incorporated
      assessLocation(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation.name);
    } catch (err) {
      showToast("⚠️ Failed to submit report. Please try again.");
    }
  });

  // Submit Subscribe Form
  document.getElementById("subscribeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Request browser notification permission
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Browser notification permission granted.");
      }
    }

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
      if (!res.ok) throw new Error("Subscription failed");
      
      subscribeModal.classList.add("hidden");
      showToast(`🔔 Early warning alerts active for ${state.currentLocation.name}!`);
    } catch (err) {
      showToast("⚠️ Could not activate alert subscription.");
    }
  });

  // Simulate Alert Trigger
  document.getElementById("btnTestAlert").addEventListener("click", async () => {
    try {
      showToast("Checking background alert thresholds...");
      const res = await fetch("/api/check-alerts", { method: "POST" });
      const json = await res.json();
      
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 BhumiRakshak Landslide Alert", {
          body: `Elevated risk detected near ${state.currentLocation.name}. Please stay alert near steep terrain.`,
          icon: "🏔️"
        });
      }
      showToast(`🔔 Alert simulated! Backend verified ${json.subscriptionsChecked} locations.`);
    } catch (err) {
      showToast("⚠️ Simulation test failed.");
    }
  });

  // Saved Locations Modal management
  setupSavedLocations();
}

// -------------------------------------------------------------
// 8. User Authentication & Profile Integration
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
      // Token invalid or expired
      localStorage.removeItem("bk_auth_token");
      localStorage.removeItem("bk_user");
      if (navLoginBtn) navLoginBtn.classList.remove("hidden");
      if (navUserBadge) navUserBadge.classList.add("hidden");
      if (btnSaveCurrentLoc) btnSaveCurrentLoc.classList.add("hidden");
      return;
    }

    const data = await res.json();
    state.currentUser = data.user;

    // Update UI for logged-in user
    if (navLoginBtn) navLoginBtn.classList.add("hidden");
    if (navUserBadge) navUserBadge.classList.remove("hidden");
    if (btnSaveCurrentLoc) btnSaveCurrentLoc.classList.remove("hidden");

    document.getElementById("navUserName").textContent = `👤 ${data.user.name.split(' ')[0]}`;
    document.getElementById("dropdownFullName").textContent = data.user.name;
    document.getElementById("dropdownRolePhone").textContent = `${data.user.role} • ${data.user.phone || 'Alerts active'}`;

    // Pre-fill user details in ground sign reporting modal
    const repReporter = document.getElementById("repReporter");
    if (repReporter) repReporter.value = `${data.user.name} (${data.user.role})`;

    // Pre-fill user details in alert subscription modal
    const subContact = document.getElementById("subContact");
    if (subContact) subContact.value = `${data.user.name} (${data.user.phone || 'Phone'})`;

    setupUserMenu();
  } catch (err) {
    console.warn("Auth initialization error:", err);
  }
}

function setupUserMenu() {
  const btnUserMenu = document.getElementById("btnUserMenu");
  const userDropdown = document.getElementById("userDropdown");
  const btnLogout = document.getElementById("btnLogout");

  if (btnUserMenu && userDropdown) {
    btnUserMenu.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    };

    document.addEventListener("click", () => {
      userDropdown.classList.add("hidden");
    });
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
    btnSave.addEventListener("click", async () => {
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
        } else {
          showToast("⚠️ Could not save location.");
        }
      } catch (err) {
        showToast("⚠️ Error saving location.");
      }
    });
  }

  // Open & Render Saved Locations List
  if (btnOpenSaved) {
    btnOpenSaved.addEventListener("click", async () => {
      savedModal.classList.remove("hidden");
      await renderSavedLocations();
    });
  }

  if (btnClose1) btnClose1.onclick = () => savedModal.classList.add("hidden");
  if (btnClose2) btnClose2.onclick = () => savedModal.classList.add("hidden");
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
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); padding: 0.5rem 0;">No locations saved yet. Click the "⭐ Save" button on any location card to bookmark it here.</p>`;
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

      // Assess Risk button
      item.querySelector(".btn-inspect-saved").addEventListener("click", () => {
        document.getElementById("savedLocationsModal").classList.add("hidden");
        assessLocation(loc.lat, loc.lon, loc.name);
      });

      // Delete button
      item.querySelector(".btn-delete-saved").addEventListener("click", async () => {
        try {
          await fetch(`/api/user/saved-locations/${loc.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          item.remove();
          showToast(`Removed "${loc.name}" from saved list.`);
        } catch (e) {}
      });

      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `<p style="font-size:0.85rem; color:#ef4444;">Failed to load saved locations.</p>`;
  }
}

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
function showLoading(show) {
  const el = document.getElementById("loadingIndicator");
  const dash = document.getElementById("resultsDashboard");
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
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4500);
}

// Register Service Worker for offline support & push alerts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[ServiceWorker] Registered:', reg.scope))
      .catch(err => console.log('[ServiceWorker] Registration skipped:', err.message));
  });
}
