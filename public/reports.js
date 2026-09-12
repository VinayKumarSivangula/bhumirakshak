/**
 * Dedicated Community Reports Feed Script
 */

let allReportsCache = [];
let activeFilter = 'all';

document.addEventListener("DOMContentLoaded", () => {
  loadReports();
  initFilterButtons();
  initReportForm();
  initAuthPrefill();
});

async function loadReports() {
  const container = document.getElementById("fullReportsList");
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error("Could not fetch reports");
    const data = await res.json();
    allReportsCache = data.reports || [];
    renderFilteredReports();
  } catch (err) {
    container.innerHTML = `<div style="color:#f87171; padding:1.5rem;">⚠️ Could not load reports. Please try again.</div>`;
  }
}

function renderFilteredReports() {
  const container = document.getElementById("fullReportsList");
  container.innerHTML = "";

  const filtered = activeFilter === 'all' 
    ? allReportsCache 
    : allReportsCache.filter(r => r.signType === activeFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="card" style="padding:2rem; text-align:center; color:var(--text-muted);">No ground signs currently reported under this filter category.</div>`;
    return;
  }

  filtered.forEach(rep => {
    const card = document.createElement("div");
    card.className = "report-card-full";

    const timeStr = rep.timestamp ? new Date(rep.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Recently reported";
    const typeLabel = rep.signType ? rep.signType.replace('_', ' ').toUpperCase() : "OBSERVATION";
    const isVerified = rep.isVerified || (rep.reportedBy && rep.reportedBy.includes("Volunteer"));

    card.innerHTML = `
      <div class="report-meta">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-weight:700; color:#f59e0b;">⚠️ ${typeLabel}</span>
          ${isVerified ? '<span class="verified-badge">✓ Verified Field Sign</span>' : ''}
        </div>
        <span style="color:var(--text-dim);">${timeStr}</span>
      </div>
      <h3 style="font-size:1.15rem; font-weight:700; color:#fff;">${rep.signTitle || rep.locationName}</h3>
      <div style="font-size:0.85rem; color:var(--sky-blue-light);">📍 ${rep.locationName} (${rep.lat}, ${rep.lon})</div>
      <p style="font-size:0.9rem; color:#cbd5e1; line-height:1.55;">${rep.description}</p>
      <div style="font-size:0.775rem; color:var(--text-dim); border-top:1px solid #1e293b; padding-top:0.4rem; margin-top:0.25rem;">
        Reported by: <strong>${rep.reportedBy || 'Local Observer'}</strong>
      </div>
    `;

    container.appendChild(card);
  });
}

function initFilterButtons() {
  document.querySelectorAll(".filter-bar .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-bar .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      renderFilteredReports();
    });
  });
}

function initReportForm() {
  const form = document.getElementById("directReportForm");
  const btnGps = document.getElementById("btnGpsReport");

  // GPS Auto-detect
  if (btnGps) {
    btnGps.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("⚠️ Geolocation not supported by browser.");
        return;
      }
      btnGps.textContent = "Detecting GPS...";
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          btnGps.innerHTML = "<span>📍</span> Coordinates Filled!";
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lon = Math.round(pos.coords.longitude * 10000) / 10000;
          document.getElementById("dLat").value = lat;
          document.getElementById("dLon").value = lon;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            if (res.ok) {
              const data = await res.json();
              if (data.display_name && !document.getElementById("dLocationName").value) {
                document.getElementById("dLocationName").value = data.display_name.split(',').slice(0, 3).join(', ');
              }
            }
          } catch (e) {}
        },
        () => {
          btnGps.innerHTML = "<span>📍</span> Auto-Fill Coordinates with Device GPS";
          showToast("⚠️ Could not fetch GPS location. Please enter coordinates manually.");
        }
      );
    });
  }

  // Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("bk_auth_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const payload = {
      signType: document.getElementById("dSignType").value,
      signTitle: document.getElementById("dSignType").selectedOptions[0].text,
      locationName: document.getElementById("dLocationName").value.trim(),
      lat: document.getElementById("dLat").value,
      lon: document.getElementById("dLon").value,
      description: document.getElementById("dDescription").value.trim(),
      reportedBy: document.getElementById("dReporter").value.trim() || "Community Observer",
      severity: "High"
    };

    try {
      showToast("Submitting verified ground sign...");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Submission failed");

      showToast("✅ Ground sign submitted! Successfully broadcasted to regional feed.");
      form.reset();
      loadReports();
    } catch (err) {
      showToast("⚠️ Could not submit ground sign. Please try again.");
    }
  });
}

function initAuthPrefill() {
  const userJson = localStorage.getItem("bk_user");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const repField = document.getElementById("dReporter");
      if (repField) repField.value = `${user.name} (${user.role} - Verified)`;
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
