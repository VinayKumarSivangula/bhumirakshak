/**
 * Dedicated Interactive Map Explorer Script
 */

let mapInstance = null;
let isroLayer = null;
let reportsLayer = null;
let activeLocationMarker = null;
let activeRadiusCircle = null;

const REGION_COORDS = {
  all: { lat: 28.5, lon: 79.5, zoom: 6 },
  joshimath: { lat: 30.5564, lon: 79.5658, zoom: 12 },
  shimla: { lat: 31.1048, lon: 77.1734, zoom: 12 },
  wayanad: { lat: 11.6854, lon: 76.1320, zoom: 11 },
  darjeeling: { lat: 27.0410, lon: 88.2663, zoom: 12 },
  gangtok: { lat: 27.3314, lon: 88.6138, zoom: 12 },
  nilgiris: { lat: 11.4102, lon: 76.6950, zoom: 12 }
};

document.addEventListener("DOMContentLoaded", () => {
  initFullMap();
  initMapControls();
  loadMapData();
});

function initFullMap() {
  mapInstance = L.map('fullMap').setView([REGION_COORDS.all.lat, REGION_COORDS.all.lon], REGION_COORDS.all.zoom);

  // Topographic styled OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap | ISRO NRSC | GSI India'
  }).addTo(mapInstance);

  isroLayer = L.layerGroup().addTo(mapInstance);
  reportsLayer = L.layerGroup().addTo(mapInstance);

  // Map Click Listener
  mapInstance.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lng * 10000) / 10000;
    assessClickedPoint(roundedLat, roundedLon);
  });
}

function initMapControls() {
  // Region Selector
  const regionSelect = document.getElementById("jumpRegionSelect");
  if (regionSelect) {
    regionSelect.addEventListener("change", (e) => {
      const target = REGION_COORDS[e.target.value] || REGION_COORDS.all;
      mapInstance.flyTo([target.lat, target.lon], target.zoom, { animate: true, duration: 1.2 });
      if (e.target.value !== 'all') {
        assessClickedPoint(target.lat, target.lon, e.target.options[e.target.selectedIndex].text);
      }
    });
  }

  // Layer Toggles
  document.getElementById("layerIsro").addEventListener("change", (e) => {
    if (e.target.checked) mapInstance.addLayer(isroLayer);
    else mapInstance.removeLayer(isroLayer);
  });

  document.getElementById("layerReports").addEventListener("change", (e) => {
    if (e.target.checked) mapInstance.addLayer(reportsLayer);
    else mapInstance.removeLayer(reportsLayer);
  });

  document.getElementById("layerRiskRadius").addEventListener("change", (e) => {
    if (activeRadiusCircle) {
      if (e.target.checked) mapInstance.addLayer(activeRadiusCircle);
      else mapInstance.removeLayer(activeRadiusCircle);
    }
  });
}

async function loadMapData() {
  // Load ISRO Historical Landslides
  try {
    const res = await fetch('/api/landslides/all');
    if (res.ok) {
      const data = await res.json();
      const events = data.historicalEvents || [];
      events.forEach(ev => {
        const icon = L.divIcon({
          className: 'isro-marker',
          html: `<div style="background:#ef4444; width:12px; height:12px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 5px rgba(0,0,0,0.6);"></div>`,
          iconSize: [12, 12]
        });

        const m = L.marker([ev.lat, ev.lon], { icon });
        m.bindPopup(`
          <div style="font-size:0.85rem; max-width:240px;">
            <strong style="color:#b91c1c;">🔴 ISRO Historical Landslide</strong><br>
            <strong>${ev.name}</strong><br>
            <span>📍 ${ev.location}, ${ev.state}</span><br>
            <span>📅 Year: ${ev.year} | Severity: <b>${ev.severity}</b></span><br>
            <p style="margin-top:4px; font-size:0.8rem; color:#475569;">${ev.description}</p>
          </div>
        `);
        isroLayer.addLayer(m);
      });
    }
  } catch (e) {
    console.warn("Could not load ISRO landslide points:", e);
  }

  // Load Community Reports
  try {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      const reports = data.reports || [];
      reports.forEach(rep => {
        const icon = L.divIcon({
          className: 'report-marker',
          html: `<div style="background:#f59e0b; width:14px; height:14px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 6px #000;"></div>`,
          iconSize: [14, 14]
        });

        const m = L.marker([rep.lat, rep.lon], { icon });
        m.bindPopup(`
          <div style="font-size:0.85rem; max-width:240px;">
            <strong style="color:#d97706;">⚠️ Community Field Sign</strong><br>
            <strong>${rep.signTitle}</strong><br>
            <span>📍 ${rep.locationName}</span><br>
            <span>👤 Reported by: ${rep.reportedBy}</span><br>
            <p style="margin-top:4px; font-size:0.8rem; color:#475569;">${rep.description}</p>
          </div>
        `);
        reportsLayer.addLayer(m);
      });
    }
  } catch (e) {
    console.warn("Could not load community reports:", e);
  }
}

async function assessClickedPoint(lat, lon, name = null) {
  const inspectorEl = document.getElementById("inspectorContent");
  if (!inspectorEl) return;

  inspectorEl.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0;">
      <div class="spinner" style="width:18px; height:18px; border-width:2px;"></div>
      <span>Querying Open-Meteo & ISRO inventory for (${lat}, ${lon})...</span>
    </div>
  `;

  try {
    let locName = name || `Point (${lat}, ${lon})`;
    if (!name) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.display_name) {
            locName = geoData.display_name.split(',').slice(0, 3).join(', ');
          }
        }
      } catch (e) {}
    }

    const res = await fetch(`/api/risk?lat=${lat}&lon=${lon}&name=${encodeURIComponent(locName)}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error("Could not calculate risk");

    const risk = json.data.risk;
    const weather = json.weather;

    inspectorEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.4rem;">
        <strong style="color:#fff; font-size:0.95rem;">${locName}</strong>
        <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
          <span style="font-size:1.4rem;">${risk.level === 'SEVERE' ? '🔴' : risk.level === 'HIGH' ? '🟠' : risk.level === 'MODERATE' ? '🟡' : '🟢'}</span>
          <div>
            <strong style="color:${risk.badgeColor}; font-size:1.05rem;">${risk.badgeLabel}</strong><br>
            <span style="color:var(--text-dim); font-size:0.75rem;">Score: ${risk.score}/100 • Confidence: ${risk.confidence}</span>
          </div>
        </div>

        <div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px solid #334155; font-size:0.8rem; line-height:1.4;">
          <span>🌧️ 24h Rain: <b>${weather.rainLast24h}mm</b> (${weather.rainfallCategory})</span><br>
          <span>💧 Soil Saturation: <b>${weather.saturationPercent}%</b></span><br>
          <span>🏔️ Nearest Historical Slide: <b>${json.data.factorScores.historicalLandslides.nearestDistanceKm}km</b></span>
        </div>

        <p style="margin-top:0.4rem; font-size:0.8rem; color:#cbd5e1; background:rgba(0,0,0,0.25); padding:0.4rem; border-radius:4px;">
          ${risk.plainEnglishSummary}
        </p>

        <a href="/?lat=${lat}&lon=${lon}&name=${encodeURIComponent(locName)}" class="btn btn-sm btn-primary" style="margin-top:0.5rem; justify-content:center;">
          Open in Full Assessor →
        </a>
      </div>
    `;

    // Update marker on map
    if (activeLocationMarker) {
      activeLocationMarker.setLatLng([lat, lon]);
      activeLocationMarker.setPopupContent(`<b>${locName}</b><br>Risk: <strong style="color:${risk.badgeColor};">${risk.badgeLabel}</strong>`).openPopup();
    } else {
      const pinIcon = L.divIcon({
        className: 'active-pin',
        html: `<div style="background:${risk.badgeColor}; width:20px; height:20px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 10px rgba(0,0,0,0.8);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      activeLocationMarker = L.marker([lat, lon], { icon: pinIcon }).addTo(mapInstance);
      activeLocationMarker.bindPopup(`<b>${locName}</b><br>Risk: <strong style="color:${risk.badgeColor};">${risk.badgeLabel}</strong>`).openPopup();
    }

    // Update risk radius circle
    if (activeRadiusCircle) {
      activeRadiusCircle.setLatLng([lat, lon]);
      activeRadiusCircle.setStyle({
        color: risk.badgeColor,
        fillColor: risk.badgeColor
      });
    } else {
      activeRadiusCircle = L.circle([lat, lon], {
        radius: 5000,
        color: risk.badgeColor,
        fillColor: risk.badgeColor,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4'
      }).addTo(mapInstance);
    }

  } catch (err) {
    inspectorEl.innerHTML = `<span style="color:#f87171;">⚠️ Could not calculate risk for selected point.</span>`;
  }
}
