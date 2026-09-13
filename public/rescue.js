/**
 * User Domain: Safe Shelters Locator & Emergency SOS Broadcast
 */

let userLat = 30.5564;
let userLon = 79.5658;
let userLocName = "Joshimath, Chamoli, Uttarakhand";
let sheltersCache = [];
let miniMap = null;
let miniMapUserMarker = null;
let miniMapShelterLayer = null;
let activeSosRecord = null;
let sosPollTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  initMiniMap();
  initAuthPrefill();
  checkExistingSosSession();
  fetchNearbyShelters();
  initSosForm();
  initGpsDetector();
});

function initMiniMap() {
  const mapEl = document.getElementById("rescueMiniMap");
  if (!mapEl) return;

  miniMap = L.map("rescueMiniMap", {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([userLat, userLon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(miniMap);

  miniMapShelterLayer = L.layerGroup().addTo(miniMap);
  updateMiniMapUserMarker();
}

function updateMiniMapUserMarker() {
  if (!miniMap) return;

  if (miniMapUserMarker) {
    miniMap.removeLayer(miniMapUserMarker);
  }

  const userIcon = L.divIcon({
    className: 'user-mini-marker',
    html: `<div style="background:#0284c7; width:18px; height:18px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 10px #38bdf8;"></div>`,
    iconSize: [18, 18]
  });

  miniMapUserMarker = L.marker([userLat, userLon], { icon: userIcon })
    .addTo(miniMap)
    .bindPopup(`<b>📍 You Are Here</b><br>${userLocName}`);

  miniMap.setView([userLat, userLon], 13);
}

async function fetchNearbyShelters() {
  const listEl = document.getElementById("sheltersList");
  const countEl = document.getElementById("sheltersCount");
  
  try {
    const res = await fetch(`/api/shelters?lat=${userLat}&lon=${userLon}`);
    if (!res.ok) throw new Error("Could not fetch shelters");
    const data = await res.json();
    sheltersCache = data.shelters || [];

    if (countEl) countEl.textContent = sheltersCache.length;
    renderSheltersList();
    renderSheltersOnMiniMap();
  } catch (err) {
    console.error("Failed to load shelters:", err);
    if (listEl) {
      listEl.innerHTML = `<div style="color:#f87171; padding:1.5rem;">⚠️ Could not load shelter database. Please try again.</div>`;
    }
  }
}

function renderSheltersList() {
  const listEl = document.getElementById("sheltersList");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (sheltersCache.length === 0) {
    listEl.innerHTML = `<div class="card" style="padding:1.5rem; text-align:center; color:var(--text-muted);">No verified shelters found in this sector.</div>`;
    return;
  }

  sheltersCache.forEach((shelter, idx) => {
    const card = document.createElement("div");
    card.className = "shelter-card";

    const isNearest = idx === 0;
    const distanceText = shelter.distanceKm !== undefined ? `${shelter.distanceKm} km away` : "Nearby";
    const occupancyPercent = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);

    const facilitiesHtml = (shelter.facilities || []).map(f => `<span class="facility-chip">✓ ${f}</span>`).join(" ");

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span class="shelter-badge">🛡️ ${shelter.category || 'Safe Haven'}</span>
            ${isNearest ? '<span class="shelter-badge" style="background:rgba(234,179,8,0.2); color:#fde047; border-color:#eab308;">⭐ CLOSEST SAFE HAVEN</span>' : ''}
          </div>
          <h4 style="font-size:1.15rem; font-weight:700; color:#fff; margin:0;">${shelter.name}</h4>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">📍 ${shelter.district}, ${shelter.state} | Elevation: ${shelter.elevationMeters}m</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.25rem; font-weight:800; color:#38bdf8;">${distanceText}</div>
          <span class="elevation-badge">${shelter.elevationAdvantage || 'High Ground Safe'}</span>
        </div>
      </div>

      <!-- Capacity Bar -->
      <div style="background:#1e293b; border-radius:4px; padding:0.6rem; border:1px solid #334155;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.3rem;">
          <span style="color:#cbd5e1;">Shelter Capacity: <strong>${shelter.capacity - shelter.currentOccupancy} free beds</strong> (${shelter.currentOccupancy}/${shelter.capacity} occupied)</span>
          <span style="color:${occupancyPercent > 80 ? '#f87171' : '#4ade80'}; font-weight:700;">${occupancyPercent}% full</span>
        </div>
        <div style="background:#0f172a; height:6px; border-radius:3px; overflow:hidden;">
          <div style="background:${occupancyPercent > 80 ? '#ef4444' : '#22c55e'}; height:100%; width:${occupancyPercent}%;"></div>
        </div>
      </div>

      <!-- Facilities -->
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
        ${facilitiesHtml}
      </div>

      <!-- Access Direction & Contact -->
      <div style="background:rgba(15,23,42,0.6); border-radius:6px; padding:0.6rem 0.8rem; font-size:0.825rem; color:#94a3b8; border:1px dashed #334155;">
        🧭 <strong>Safe Evacuation Path:</strong> ${shelter.accessNotes || 'Follow main high ridge road. Avoid stream valleys.'}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; border-top:1px solid #1e293b; padding-top:0.6rem;">
        <span style="font-size:0.8rem; color:var(--text-dim);">
          In-Charge: <strong>${shelter.contactPerson}</strong>
        </span>
        <a href="tel:${shelter.contactPhone}" class="btn btn-outline btn-sm" style="border-color:#22c55e; color:#86efac; font-size:0.8rem;">
          📞 Call Shelter (${shelter.contactPhone})
        </a>
      </div>
    `;

    listEl.appendChild(card);
  });
}

function renderSheltersOnMiniMap() {
  if (!miniMap || !miniMapShelterLayer) return;
  miniMapShelterLayer.clearLayers();

  sheltersCache.forEach((s, idx) => {
    const isNearest = idx === 0;
    const shelterIcon = L.divIcon({
      className: 'shelter-marker',
      html: `<div style="background:${isNearest ? '#22c55e' : '#15803d'}; width:24px; height:24px; border-radius:6px; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:12px; box-shadow:0 0 8px rgba(0,0,0,0.5);">🛡️</div>`,
      iconSize: [24, 24]
    });

    const m = L.marker([s.lat, s.lon], { icon: shelterIcon });
    m.bindPopup(`
      <div style="font-size:0.85rem; max-width:240px;">
        <strong style="color:#15803d;">🛡️ ${s.name}</strong><br>
        <span>📍 ${s.district}, ${s.state}</span><br>
        <span>📏 <b>${s.distanceKm !== undefined ? s.distanceKm + ' km away' : 'Safe Haven'}</b></span><br>
        <span>🛌 Free Beds: <b>${s.capacity - s.currentOccupancy}</b></span><br>
        <span style="font-size:0.775rem; color:#475569;">📞 ${s.contactPhone}</span>
      </div>
    `);
    miniMapShelterLayer.addLayer(m);

    // Draw line from user to nearest shelter
    if (isNearest) {
      const line = L.polyline([[userLat, userLon], [s.lat, s.lon]], {
        color: '#22c55e',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85
      });
      miniMapShelterLayer.addLayer(line);
    }
  });
}

window.setSectorCoords = function(lat, lon, name) {
  userLat = lat;
  userLon = lon;
  userLocName = name;
  const label = document.getElementById("activeLocName");
  if (label) label.textContent = `${name} (${lat}, ${lon})`;
  updateMiniMapUserMarker();
  fetchNearbyShelters();
};

function initGpsDetector() {
  const btn = document.getElementById("btnDetectGps");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("⚠️ Geolocation is not supported by your device.");
      return;
    }
    btn.textContent = "Detecting GPS...";
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        userLat = Math.round(pos.coords.latitude * 10000) / 10000;
        userLon = Math.round(pos.coords.longitude * 10000) / 10000;
        userLocName = `GPS Detected (${userLat}, ${userLon})`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json`);
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              userLocName = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch (e) {}

        const label = document.getElementById("activeLocName");
        if (label) label.textContent = `${userLocName} (${userLat}, ${userLon})`;
        btn.innerHTML = "<span>📍</span> GPS Located!";
        updateMiniMapUserMarker();
        fetchNearbyShelters();
        showToast("✅ Located! Closest high-ground safe havens refreshed.");
      },
      () => {
        btn.innerHTML = "<span>📍</span> Use My Current GPS";
        showToast("⚠️ Could not detect GPS position.");
      }
    );
  });
}

function initSosForm() {
  const form = document.getElementById("sosBroadcastForm");
  const btnCancel = document.getElementById("btnCancelSos");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("sosName").value.trim();
      const phone = document.getElementById("sosPhone").value.trim();
      const peopleCount = document.getElementById("sosPeopleCount").value;
      const urgency = document.getElementById("sosUrgency").value;
      const hazardType = document.getElementById("sosHazard").value;
      const notes = document.getElementById("sosNotes").value.trim();

      const token = localStorage.getItem("bk_auth_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        showToast("🚨 Broadcasting live SOS coordinates to Rakshaks...");
        const res = await fetch("/api/sos/broadcast", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name,
            phone,
            locationName: userLocName,
            lat: userLat,
            lon: userLon,
            peopleCount,
            urgency,
            hazardType,
            notes
          })
        });

        if (!res.ok) throw new Error("Could not broadcast SOS");
        const data = await res.json();
        activeSosRecord = data.sos;
        localStorage.setItem("bk_active_sos", JSON.stringify(activeSosRecord));

        showActiveSosUI(activeSosRecord);
        startSosStatusPolling();
        showToast("🚨 SOS Beacon active! Live coordinates sent to Rakshaks.");
      } catch (err) {
        console.error("SOS Broadcast failed:", err);
        showToast("⚠️ Failed to transmit SOS beacon. Please dial emergency helpline 112 directly.");
      }
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener("click", async () => {
      if (!activeSosRecord) return;
      try {
        await fetch("/api/sos/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sosId: activeSosRecord.id })
        });
      } catch (e) {}

      localStorage.removeItem("bk_active_sos");
      activeSosRecord = null;
      if (sosPollTimer) clearInterval(sosPollTimer);

      document.getElementById("sosActiveContainer").style.display = "none";
      document.getElementById("sosFormContainer").style.display = "block";
      showToast("✅ SOS Beacon cancelled. Glad you are safe!");
    });
  }
}

function showActiveSosUI(sos) {
  document.getElementById("sosFormContainer").style.display = "none";
  const activeBox = document.getElementById("sosActiveContainer");
  activeBox.style.display = "block";

  document.getElementById("sosTicketId").textContent = `BEACON ID: ${sos.id}`;
  const statusLabel = document.getElementById("sosStatusLabel");
  const teamBox = document.getElementById("sosAssignedTeamBox");
  const teamName = document.getElementById("sosAssignedTeamName");

  if (sos.status === "DISPATCHED") {
    statusLabel.textContent = "RAKSHAK RESCUE UNIT EN ROUTE";
    statusLabel.style.color = "#38bdf8";
    if (sos.assignedTeam) {
      teamBox.style.display = "block";
      teamName.textContent = sos.assignedTeam;
    }
  } else if (sos.status === "RESCUED") {
    statusLabel.textContent = "GUIDED / ARRIVED AT SAFE HAVEN";
    statusLabel.style.color = "#4ade80";
  } else {
    statusLabel.textContent = "WAITING FOR RAKSHAK ASSIGNMENT";
    statusLabel.style.color = "#facc15";
    teamBox.style.display = "none";
  }
}

function startSosStatusPolling() {
  if (sosPollTimer) clearInterval(sosPollTimer);
  sosPollTimer = setInterval(async () => {
    if (!activeSosRecord) return;
    try {
      const res = await fetch("/api/sos/active");
      if (res.ok) {
        const data = await res.json();
        const found = (data.activeSos || []).find(s => s.id === activeSosRecord.id);
        if (found) {
          activeSosRecord = found;
          localStorage.setItem("bk_active_sos", JSON.stringify(found));
          showActiveSosUI(found);
        }
      }
    } catch (e) {}
  }, 4000);
}

function checkExistingSosSession() {
  const saved = localStorage.getItem("bk_active_sos");
  if (saved) {
    try {
      activeSosRecord = JSON.parse(saved);
      showActiveSosUI(activeSosRecord);
      startSosStatusPolling();
    } catch (e) {}
  }
}

function initAuthPrefill() {
  const userJson = localStorage.getItem("bk_user");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const nameInput = document.getElementById("sosName");
      const phoneInput = document.getElementById("sosPhone");
      if (nameInput && !nameInput.value) nameInput.value = user.name || "";
      if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || "";
    } catch (e) {}
  }
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 4000);
}
