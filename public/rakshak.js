/**
 * Rakshak Tactical Command Center Script
 * GIS Operations, Survivor GPS Telemetry, Safe Haven Coordination & Dispatch
 */

let activeSosList = [];
let sheltersList = [];
let tacticalMap = null;
let sosLayer = null;
let shelterLayer = null;
let unitLayer = null;
let vectorLayer = null;
let pollInterval = null;

// Pre-deployed simulated Rakshak quick reaction units
const RAKSHAK_UNITS = [
  { id: "unit-1", name: "NDRF Battalion 1 (Joshimath Sector)", lat: 30.5520, lon: 79.5620, status: "ON_STANDBY", vehicle: "Heavy Rescue 4x4" },
  { id: "unit-2", name: "SDRF Rapid Evacuation Unit 2 (Shimla)", lat: 31.1090, lon: 77.1650, status: "DISPATCHED", vehicle: "All-Terrain Ambulance" },
  { id: "unit-3", name: "NDRF Team 4 (Wayanad High-Ground)", lat: 11.5650, lon: 76.1200, status: "PATROLLING", vehicle: "Mountain Evac Truck" },
  { id: "unit-4", name: "GTA Mountain Rescue (Darjeeling)", lat: 27.0380, lon: 88.2610, status: "ON_STANDBY", vehicle: "Ridge Response 4x4" },
  { id: "unit-5", name: "J&K SDRF Quick Reaction (Ramban)", lat: 33.2380, lon: 75.2350, status: "ON_STANDBY", vehicle: "High Clearance Rescue" }
];

document.addEventListener("DOMContentLoaded", () => {
  initTacticalMap();
  initDispatchModal();
  loadTacticalData();

  const refreshBtn = document.getElementById("btnRefreshTactical");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadTacticalData();
      showToast("🔄 Telemetry refreshed.");
    });
  }

  // Poll for live survivor beacons every 5 seconds
  pollInterval = setInterval(() => {
    loadTacticalData(true);
  }, 5000);
});

function initTacticalMap() {
  const mapEl = document.getElementById("tacticalGisMap");
  if (!mapEl) return;

  tacticalMap = L.map("tacticalGisMap", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([31.1048, 77.1734], 7);

  // High-contrast clean dark/streets map style
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors | BhumiRakshak Tactical GIS'
  }).addTo(tacticalMap);

  shelterLayer = L.layerGroup().addTo(tacticalMap);
  unitLayer = L.layerGroup().addTo(tacticalMap);
  vectorLayer = L.layerGroup().addTo(tacticalMap);
  sosLayer = L.layerGroup().addTo(tacticalMap);

  renderRakshakUnitsOnMap();
}

async function loadTacticalData(isBackground = false) {
  try {
    const [sosRes, sheltersRes] = await Promise.all([
      fetch('/api/sos/active'),
      fetch('/api/shelters')
    ]);

    if (sosRes.ok) {
      const sosData = await sosRes.json();
      activeSosList = sosData.activeSos || [];
    }

    if (sheltersRes.ok) {
      const shlData = await sheltersRes.json();
      sheltersList = shlData.shelters || [];
    }

    updateMetrics();
    renderTacticalGis();
    renderSosQueue();
    renderSheltersTable();
  } catch (err) {
    if (!isBackground) {
      console.error("Failed to load tactical data:", err);
      showToast("⚠️ Could not load tactical feeds.");
    }
  }
}

function updateMetrics() {
  const sosMetric = document.getElementById("metricActiveSos");
  const shlMetric = document.getElementById("metricShelters");
  const queueBadge = document.getElementById("queueBadge");

  const pendingCount = activeSosList.filter(s => s.status === 'PENDING' || s.status === 'DISPATCHED').length;
  if (sosMetric) sosMetric.textContent = pendingCount;
  if (queueBadge) queueBadge.textContent = `${pendingCount} Active`;

  if (shlMetric) {
    const totalBeds = sheltersList.reduce((acc, s) => acc + (s.capacity || 0), 0);
    shlMetric.textContent = `${sheltersList.length} Shelters`;
  }
}

function renderRakshakUnitsOnMap() {
  if (!unitLayer) return;
  unitLayer.clearLayers();

  RAKSHAK_UNITS.forEach(u => {
    const unitIcon = L.divIcon({
      className: 'unit-marker',
      html: `<div style="background:#0284c7; width:26px; height:26px; border-radius:50%; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:13px; box-shadow:0 0 10px #38bdf8;">🚒</div>`,
      iconSize: [26, 26]
    });

    const m = L.marker([u.lat, u.lon], { icon: unitIcon });
    m.bindPopup(`
      <div style="font-size:0.85rem; max-width:240px;">
        <strong style="color:#0284c7;">🚒 ${u.name}</strong><br>
        <span>Vehicle: <b>${u.vehicle}</b></span><br>
        <span>Status: <b style="color:#38bdf8;">${u.status}</b></span>
      </div>
    `);
    unitLayer.addLayer(m);
  });
}

function renderTacticalGis() {
  if (!tacticalMap || !shelterLayer || !sosLayer || !vectorLayer) return;

  shelterLayer.clearLayers();
  sosLayer.clearLayers();
  vectorLayer.clearLayers();

  const allBounds = [];

  // 1. Render Safe Shelters (Green Shields)
  sheltersList.forEach(s => {
    const shelterIcon = L.divIcon({
      className: 'shelter-marker-tactical',
      html: `<div style="background:#15803d; width:24px; height:24px; border-radius:6px; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:12px; box-shadow:0 0 8px rgba(0,0,0,0.6);">🛡️</div>`,
      iconSize: [24, 24]
    });

    const m = L.marker([s.lat, s.lon], { icon: shelterIcon });
    m.bindPopup(`
      <div style="font-size:0.85rem; max-width:260px;">
        <strong style="color:#15803d;">🛡️ SAFE HAVEN: ${s.name}</strong><br>
        <span>📍 ${s.district}, ${s.state} | Elev: <b>${s.elevationMeters}m</b></span><br>
        <span>🛌 Capacity: <b>${s.currentOccupancy} / ${s.capacity} occupied</b></span><br>
        <span>📞 Manager: <b>${s.contactPhone} (${s.contactPerson})</b></span><br>
        <p style="margin-top:4px; font-size:0.775rem; color:#475569;">${s.accessNotes}</p>
      </div>
    `);
    shelterLayer.addLayer(m);
    allBounds.push([s.lat, s.lon]);
  });

  // 2. Render Active Citizen SOS Beacons (Red/Amber Pulsing)
  activeSosList.forEach(sos => {
    const isDispatched = sos.status === 'DISPATCHED';
    const isRescued = sos.status === 'RESCUED';
    
    let color = '#ef4444';
    if (isDispatched) color = '#38bdf8';
    if (isRescued) color = '#22c55e';

    const sosIcon = L.divIcon({
      className: 'sos-marker',
      html: `<div style="background:${color}; width:28px; height:28px; border-radius:50%; border:3px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 0 15px ${color}; animation: pulseAlert 1.5s infinite;">🚨</div>`,
      iconSize: [28, 28]
    });

    const m = L.marker([sos.lat, sos.lon], { icon: sosIcon });
    const nearestShelterName = sos.nearestShelter ? sos.nearestShelter.name : "High-Ground Shelter";
    const distanceVal = sos.nearestShelter && sos.nearestShelter.distanceKm !== undefined ? `${sos.nearestShelter.distanceKm} km` : "Nearby";

    m.bindPopup(`
      <div style="font-size:0.85rem; max-width:280px;">
        <strong style="color:#ef4444;">🚨 CITIZEN SOS: ${sos.name}</strong><br>
        <span>📞 Phone: <a href="tel:${sos.phone}">${sos.phone || 'No phone'}</a></span><br>
        <span>👥 Family / Survivors: <b>${sos.peopleCount} People</b></span><br>
        <span>⚠️ Peril: <b>${sos.hazardType}</b></span><br>
        <span>📍 Landmark: <b>${sos.locationName}</b></span><br>
        <span>🛡️ Nearest Haven: <b>${nearestShelterName} (${distanceVal})</b></span><br>
        <span>Status: <b style="color:${isDispatched ? '#0284c7' : '#ef4444'};">${sos.status}</b></span><br>
        <p style="margin-top:4px; font-size:0.8rem; color:#475569;">${sos.notes || 'Awaiting guidance.'}</p>
        <button onclick="openDispatchModal('${sos.id}')" style="background:#0284c7; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer; margin-top:4px;">
          🚒 Dispatch Rescue Unit
        </button>
      </div>
    `);
    sosLayer.addLayer(m);
    allBounds.push([sos.lat, sos.lon]);

    // Draw connecting vector line to nearest shelter
    if (sos.nearestShelter && !isRescued) {
      const shelterObj = sheltersList.find(s => s.id === sos.nearestShelter.id);
      if (shelterObj) {
        const line = L.polyline([[sos.lat, sos.lon], [shelterObj.lat, shelterObj.lon]], {
          color: isDispatched ? '#38bdf8' : '#ef4444',
          weight: 2,
          dashArray: '5, 5',
          opacity: 0.75
        });
        vectorLayer.addLayer(line);
      }
    }
  });

  // Fit view if we have points and not user panned
  if (allBounds.length > 0 && !tacticalMap._hasInitialFitted) {
    tacticalMap.fitBounds(allBounds, { padding: [40, 40], maxZoom: 13 });
    tacticalMap._hasInitialFitted = true;
  }
}

function renderSosQueue() {
  const queueEl = document.getElementById("sosQueueList");
  if (!queueEl) return;
  queueEl.innerHTML = "";

  if (activeSosList.length === 0) {
    queueEl.innerHTML = `
      <div class="card" style="padding:1.5rem; text-align:center; color:var(--text-muted);">
        ✅ No active distress beacons in this sector.
      </div>
    `;
    return;
  }

  activeSosList.forEach(sos => {
    const card = document.createElement("div");
    card.className = "sos-ticket-card";

    const isCritical = sos.urgency === 'CRITICAL_TRAPPED';
    const urgencyClass = isCritical ? 'urgency-critical' : 'urgency-high';
    const isDispatched = sos.status === 'DISPATCHED';
    const isRescued = sos.status === 'RESCUED';

    const nearestShelterName = sos.nearestShelter ? sos.nearestShelter.name : "Nearest Shelter";
    const distanceVal = sos.nearestShelter && sos.nearestShelter.distanceKm !== undefined ? `${sos.nearestShelter.distanceKm} km` : "Nearby";

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="urgency-badge ${urgencyClass}">
          ${sos.urgency ? sos.urgency.replace('_', ' ') : 'DISTRESS BEACON'}
        </span>
        <span class="status-badge" style="background:${isDispatched ? 'rgba(56,189,248,0.2)' : (isRescued ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)')}; color:${isDispatched ? '#38bdf8' : (isRescued ? '#4ade80' : '#fca5a5')};">
          ${sos.status || 'PENDING'}
        </span>
      </div>

      <div>
        <h4 style="font-size:1.1rem; font-weight:700; color:#fff; margin:0;">${sos.name}</h4>
        <div style="font-size:0.8rem; color:#38bdf8;">📍 ${sos.locationName} (${sos.lat}, ${sos.lon})</div>
      </div>

      <div style="background:#1e293b; padding:0.5rem; border-radius:4px; font-size:0.8rem; display:flex; justify-content:space-between;">
        <span>👥 Survivors: <strong>${sos.peopleCount}</strong></span>
        <span>⚠️ Threat: <strong>${sos.hazardType}</strong></span>
      </div>

      <div style="font-size:0.825rem; color:#cbd5e1; line-height:1.4;">
        ${sos.notes ? `"${sos.notes}"` : 'No additional text notes provided.'}
      </div>

      <div style="background:rgba(21,128,61,0.15); border:1px solid rgba(21,128,61,0.3); border-radius:4px; padding:0.4rem 0.6rem; font-size:0.775rem; color:#86efac;">
        🛡️ Nearest Haven: <strong>${nearestShelterName} (${distanceVal})</strong>
      </div>

      ${sos.assignedTeam ? `<div style="font-size:0.75rem; color:#7dd3fc;">🚒 Assigned: <strong>${sos.assignedTeam}</strong></div>` : ''}

      <div style="display:flex; gap:0.4rem; margin-top:0.35rem; flex-wrap:wrap;">
        <a href="tel:${sos.phone}" class="btn btn-outline btn-sm" style="flex:1; justify-content:center; font-size:0.75rem; padding:0.35rem;">
          📞 Call (${sos.phone || 'N/A'})
        </a>

        ${!isRescued ? `
          <button onclick="openDispatchModal('${sos.id}')" class="btn btn-sm" style="flex:1; justify-content:center; background:#0284c7; color:#fff; font-size:0.75rem; padding:0.35rem;">
            🚒 Dispatch
          </button>
          <button onclick="markAsRescued('${sos.id}')" class="btn btn-sm" style="background:#15803d; color:#fff; font-size:0.75rem; padding:0.35rem;">
            ✅ Safe
          </button>
        ` : `
          <span style="font-size:0.75rem; color:#4ade80; font-weight:700;">✓ Evacuation Completed</span>
        `}
      </div>
    `;

    queueEl.appendChild(card);
  });
}

function renderSheltersTable() {
  const tbody = document.getElementById("sheltersTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  sheltersList.forEach(s => {
    const freeBeds = s.capacity - s.currentOccupancy;
    const occPercent = Math.round((s.currentOccupancy / s.capacity) * 100);

    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #1e293b";
    tr.innerHTML = `
      <td style="padding:0.6rem; font-weight:600; color:#fff;">
        ${s.name}<br>
        <span style="font-size:0.75rem; color:var(--text-dim);">📍 ${s.district}, ${s.state} (Elev. ${s.elevationMeters}m)</span>
      </td>
      <td style="padding:0.6rem; color:#94a3b8; font-size:0.8rem;">${s.category}</td>
      <td style="padding:0.6rem;">
        <span style="font-weight:700; color:#fff;">${s.currentOccupancy} / ${s.capacity}</span>
        <div style="background:#0f172a; height:4px; border-radius:2px; width:80px; margin-top:3px; overflow:hidden;">
          <div style="background:${occPercent > 80 ? '#ef4444' : '#22c55e'}; height:100%; width:${occPercent}%;"></div>
        </div>
      </td>
      <td style="padding:0.6rem; font-weight:700; color:${freeBeds > 50 ? '#4ade80' : '#facc15'};">${freeBeds} beds</td>
      <td style="padding:0.6rem; font-size:0.775rem; color:#86efac;">✓ Medical Standby</td>
      <td style="padding:0.6rem; font-size:0.8rem;">
        <a href="tel:${s.contactPhone}" style="color:#38bdf8; text-decoration:none;">${s.contactPhone}</a><br>
        <span style="font-size:0.7rem; color:var(--text-dim);">${s.contactPerson}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function initDispatchModal() {
  const modal = document.getElementById("dispatchModal");
  const btnClose = document.getElementById("btnCloseDispatchModal");
  const form = document.getElementById("dispatchForm");

  if (btnClose && modal) {
    btnClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const sosId = document.getElementById("modalSosId").value;
      const assignedTeam = document.getElementById("selectRescueTeam").value;
      const notes = document.getElementById("dispatchNotes").value.trim();

      try {
        showToast("🚒 Dispatching Rakshak rescue unit...");
        const res = await fetch("/api/sos/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sosId,
            status: "DISPATCHED",
            assignedTeam,
            notes
          })
        });

        if (!res.ok) throw new Error("Dispatch failed");
        showToast(`✅ ${assignedTeam} successfully dispatched to survivor!`);
        modal.style.display = "none";
        loadTacticalData();
      } catch (err) {
        showToast("⚠️ Could not dispatch unit. Please retry.");
      }
    });
  }
}

window.openDispatchModal = function(sosId) {
  const sos = activeSosList.find(s => s.id === sosId);
  if (!sos) return;

  const modal = document.getElementById("dispatchModal");
  document.getElementById("modalSosId").value = sos.id;
  document.getElementById("modalCitizenName").textContent = `${sos.name} (${sos.peopleCount} survivors)`;
  document.getElementById("modalCitizenLoc").textContent = `📍 ${sos.locationName} (${sos.lat}, ${sos.lon}) | Threat: ${sos.hazardType}`;

  modal.style.display = "flex";
};

window.markAsRescued = async function(sosId) {
  try {
    showToast("Updating rescue status to SAFE...");
    const res = await fetch("/api/sos/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sosId,
        status: "RESCUED",
        notes: "Guided to high-ground relief shelter."
      })
    });

    if (res.ok) {
      showToast("✅ Survivor safely guided and logged into shelter!");
      loadTacticalData();
    }
  } catch (e) {
    showToast("⚠️ Error updating status.");
  }
};

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 4000);
}
