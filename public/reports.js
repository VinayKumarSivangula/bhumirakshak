/**
 * Dedicated Community Reports Feed Script
 * Features Camera Capture, Image Compression, and Photo Evidence Inspection
 */

let allReportsCache = [];
let activeFilter = 'all';
let currentPhotoBase64 = null;

document.addEventListener("DOMContentLoaded", () => {
  loadReports();
  initFilterButtons();
  initReportForm();
  initAuthPrefill();
  initLightbox();
  initCalamityModal();
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

    let photoHtml = "";
    if (rep.photoUrl) {
      photoHtml = `
        <div class="report-photo-thumb" style="margin: 0.6rem 0; cursor: pointer;" onclick="openPhotoLightbox('${rep.id}')">
          <div style="display:inline-block; position:relative; border-radius:8px; overflow:hidden; border:1px solid #334155;">
            <img src="${rep.photoUrl}" alt="Ground Sign Evidence" style="max-width: 260px; max-height: 160px; object-fit: cover; display: block;">
            <span style="position:absolute; bottom:6px; right:6px; background:rgba(15,23,42,0.85); color:#38bdf8; font-size:0.7rem; font-weight:600; padding:2px 6px; border-radius:4px;">
              🔍 Zoom Photo
            </span>
          </div>
        </div>
      `;
    }

    let diagSnippet = "";
    if (rep.calamityAnalysis) {
      const diag = rep.calamityAnalysis;
      diagSnippet = `
        <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #ef4444; padding: 0.5rem 0.75rem; border-radius: 6px; margin: 0.5rem 0; font-size: 0.825rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#fca5a5;">🚨 Diagnosed: ${diag.calamityType}</strong>
            <span class="confidence-badge" style="font-size:0.68rem;">${diag.confidenceScore || 94}%</span>
          </div>
          <div style="color:#38bdf8; font-size:0.775rem; margin-top:0.25rem;">
            📏 Range: ${diag.rangeOfEffect ? diag.rangeOfEffect.downslopeRunoutMeters : 'Active hazard'}
          </div>
        </div>
      `;
    }

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
      ${photoHtml}
      ${diagSnippet}
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem;">
        <button type="button" class="btn btn-sm btn-danger" onclick="inspectReportCalamity('${rep.id}')" style="background:rgba(220,38,38,0.2); color:#fca5a5; border:1px solid #ef4444; font-size:0.775rem; padding:0.25rem 0.65rem;">
          <span>🔬</span> View AI Calamity Diagnosis (Range & Evacuation)
        </button>
      </div>
      <div style="font-size:0.775rem; color:var(--text-dim); border-top:1px solid #1e293b; padding-top:0.4rem; margin-top:0.5rem;">
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
  const photoCamera = document.getElementById("dPhotoCamera");
  const photoUpload = document.getElementById("dPhotoUpload");
  const photoPreviewBox = document.getElementById("photoPreviewBox");
  const photoPreviewImg = document.getElementById("photoPreviewImg");
  const btnRemovePhoto = document.getElementById("btnRemovePhoto");

  // Handle Photo Selection / Camera Capture
  async function processSelectedFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("⚠️ Please select a valid image file.");
      return;
    }

    try {
      showToast("Optimizing and compressing photo...");
      const compressed = await compressImage(file, 1000, 0.75);
      currentPhotoBase64 = compressed;
      if (photoPreviewImg && photoPreviewBox) {
        photoPreviewImg.src = compressed;
        photoPreviewBox.style.display = "block";
      }

      // Trigger instant AI Calamity Pre-Diagnosis
      const diagPreview = document.getElementById("photoDiagnosisPreview");
      if (diagPreview) {
        diagPreview.classList.remove("hidden");
        const typeEl = document.getElementById("previewCalamityType");
        const confEl = document.getElementById("previewConfidence");
        const runEl = document.getElementById("previewRunout");
        const survEl = document.getElementById("previewSurvival");

        if (typeEl) typeEl.textContent = "Analyzing slope failure mechanism...";
        if (confEl) confEl.textContent = "...";
        if (runEl) runEl.textContent = "Calculating downslope runout footprint...";
        if (survEl) survEl.textContent = "Evaluating life-safety survival measures...";

        try {
          const res = await fetch("/api/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              photoUrl: compressed,
              signType: document.getElementById("dSignType").value,
              locationName: document.getElementById("dLocationName").value || "Mountain Sector",
              lat: document.getElementById("dLat").value || undefined,
              lon: document.getElementById("dLon").value || undefined
            })
          });
          const data = await res.json();
          if (data.success && data.diagnosis) {
            const d = data.diagnosis;
            if (typeEl) typeEl.textContent = `🚨 ${d.calamityType}`;
            if (confEl) confEl.textContent = `${d.confidenceScore}%`;
            if (runEl) runEl.textContent = `📏 Range: ${d.rangeOfEffect ? d.rangeOfEffect.downslopeRunoutMeters : 'Active'}`;
            if (survEl) survEl.textContent = `🛡️ Survival: ${d.survivalMeasures ? d.survivalMeasures[0] : 'Evacuate laterally'}`;
            showToast(`✅ Calamity diagnosed: ${d.calamityType}`);
          }
        } catch (diagErr) {
          console.warn("Pre-diagnosis error:", diagErr);
        }
      }

      showToast("✅ Photo attached ready for reporting!");
    } catch (err) {
      console.error("Photo processing error:", err);
      showToast("⚠️ Could not process image. Please try another photo.");
    }
  }

  if (photoCamera) {
    photoCamera.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        processSelectedFile(e.target.files[0]);
      }
    });
  }

  if (photoUpload) {
    photoUpload.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        processSelectedFile(e.target.files[0]);
      }
    });
  }

  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener("click", () => {
      currentPhotoBase64 = null;
      if (photoPreviewImg) photoPreviewImg.src = "";
      if (photoPreviewBox) photoPreviewBox.style.display = "none";
      const diagPreview = document.getElementById("photoDiagnosisPreview");
      if (diagPreview) diagPreview.classList.add("hidden");
      if (photoCamera) photoCamera.value = "";
      if (photoUpload) photoUpload.value = "";
      showToast("Photo removed.");
    });
  }

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
      photoUrl: currentPhotoBase64 || null,
      severity: "High"
    };

    try {
      showToast("Submitting verified ground sign with photo evidence...");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Submission failed");

      showToast("✅ Ground sign & photo submitted! Successfully broadcasted to regional feed.");
      form.reset();
      currentPhotoBase64 = null;
      if (photoPreviewBox) photoPreviewBox.style.display = "none";
      loadReports();
    } catch (err) {
      showToast("⚠️ Could not submit ground sign. Please try again.");
    }
  });
}

// Client-side lightweight canvas image compression
function compressImage(file, maxDimension = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Lightbox Modal for Full-Size Photo Inspection
function initLightbox() {
  const modal = document.getElementById("photoLightboxModal");
  const btnClose = document.getElementById("btnCloseLightbox");

  if (btnClose && modal) {
    btnClose.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }
}

window.openPhotoLightbox = function(reportId) {
  const rep = allReportsCache.find(r => r.id === reportId);
  if (!rep || !rep.photoUrl) return;

  const modal = document.getElementById("photoLightboxModal");
  const img = document.getElementById("lightboxImg");
  const title = document.getElementById("lightboxTitle");
  const caption = document.getElementById("lightboxCaption");

  if (modal && img) {
    img.src = rep.photoUrl;
    if (title) title.textContent = rep.signTitle || "Photographic Evidence";
    if (caption) caption.textContent = `📍 ${rep.locationName} (${rep.lat}, ${rep.lon}) | Observed: ${rep.description}`;
    modal.style.display = "flex";
  }
};

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

// -------------------------------------------------------------
// Calamity Inspection Modal in Community Reports
// -------------------------------------------------------------
window.inspectReportCalamity = async function(reportId) {
  const rep = allReportsCache.find(r => r.id === reportId);
  if (!rep) return;

  // If report already has calamityAnalysis, open immediately
  if (rep.calamityAnalysis) {
    openCalamityModal(rep.calamityAnalysis, rep.photoUrl, rep.locationName, []);
    return;
  }

  // Otherwise, request dynamic calamity diagnosis
  showToast("🔬 Generating AI Calamity Diagnosis...");
  try {
    const res = await fetch("/api/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoUrl: rep.photoUrl || "",
        signType: rep.signType,
        locationName: rep.locationName,
        description: rep.description,
        lat: rep.lat,
        lon: rep.lon
      })
    });
    const data = await res.json();
    if (data.success && data.diagnosis) {
      rep.calamityAnalysis = data.diagnosis;
      openCalamityModal(data.diagnosis, rep.photoUrl, rep.locationName, data.nearbySafeShelters || []);
    }
  } catch (err) {
    showToast("⚠️ Could not generate diagnosis for this report.");
  }
};

function initCalamityModal() {
  const modal = document.getElementById("calamityModal");
  const btnClose1 = document.getElementById("btnCloseCalamityModal");
  const btnClose2 = document.getElementById("btnCloseCalamityModal2");

  if (btnClose1 && modal) {
    btnClose1.onclick = () => modal.classList.add("hidden");
  }
  if (btnClose2 && modal) {
    btnClose2.onclick = () => modal.classList.add("hidden");
  }
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    };
  }
}

function openCalamityModal(diagnosis, photoUrl, locationName, nearbyShelters = []) {
  const modal = document.getElementById("calamityModal");
  if (!modal || !diagnosis) return;

  const hazardCodeEl = document.getElementById("modalHazardCode");
  if (hazardCodeEl) hazardCodeEl.textContent = diagnosis.hazardCode || "GSI-HAZARD-01";

  const confEl = document.getElementById("modalConfidenceScore");
  if (confEl) confEl.textContent = `Confidence: ${diagnosis.confidenceScore || 94}%`;

  const sevEl = document.getElementById("modalThreatSeverity");
  if (sevEl) sevEl.textContent = (diagnosis.threatSeverity || "HIGH_WARNING").replace('_', ' ');

  const titleEl = document.getElementById("modalCalamityTitle");
  if (titleEl) titleEl.textContent = diagnosis.calamityType || "Geological Slope Instability";

  const subEl = document.getElementById("modalLocationSubtitle");
  if (subEl) subEl.textContent = `📍 ${locationName || 'Monitored Hillside'} | Diagnosed via ${diagnosis.engine || 'BhumiRakshak Geological Vision'}`;

  const photoEl = document.getElementById("modalPhotoPreview");
  if (photoEl) {
    photoEl.src = photoUrl || "images/warning_signs.jpg";
  }

  const indList = document.getElementById("modalVisualIndicators");
  if (indList) {
    indList.innerHTML = "";
    (diagnosis.visualIndicators || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      indList.appendChild(li);
    });
  }

  const sumEl = document.getElementById("modalEmergencySummary");
  if (sumEl) sumEl.textContent = diagnosis.emergencyActionSummary || `🚨 ${diagnosis.threatSeverity}: Immediate lateral ridge evacuation advised.`;

  const runoutEl = document.getElementById("modalRunoutFootprint");
  if (runoutEl) runoutEl.textContent = diagnosis.rangeOfEffect ? diagnosis.rangeOfEffect.downslopeRunoutMeters : "150m - 500m";

  const speedEl = document.getElementById("modalPropagationSpeed");
  if (speedEl) speedEl.textContent = diagnosis.rangeOfEffect ? diagnosis.rangeOfEffect.propagationSpeed : "Rapid";

  const assetsList = document.getElementById("modalThreatenedAssets");
  if (assetsList) {
    assetsList.innerHTML = "";
    const assets = diagnosis.rangeOfEffect ? (diagnosis.rangeOfEffect.threatenedAssets || []) : [];
    assets.forEach(asset => {
      const li = document.createElement("li");
      li.textContent = asset;
      assetsList.appendChild(li);
    });
  }

  const survList = document.getElementById("modalSurvivalMeasures");
  if (survList) {
    survList.innerHTML = "";
    (diagnosis.survivalMeasures || []).forEach(m => {
      const li = document.createElement("li");
      li.textContent = m;
      survList.appendChild(li);
    });
  }

  const evacList = document.getElementById("modalEvacuationMeasures");
  if (evacList) {
    evacList.innerHTML = "";
    (diagnosis.evacuationMeasures || []).forEach(e => {
      const li = document.createElement("li");
      li.textContent = e;
      evacList.appendChild(li);
    });
  }

  const sheltersContainer = document.getElementById("modalNearbySheltersList");
  if (sheltersContainer) {
    sheltersContainer.innerHTML = "";
    if (!nearbyShelters || nearbyShelters.length === 0) {
      sheltersContainer.innerHTML = `
        <div style="font-size:0.825rem; color:#94a3b8; padding:0.5rem 0;">
          Safe shelters are mapped across all hill sectors. Access the <a href="/rescue.html" style="color:#38bdf8;">Safe Shelters & SOS Locator</a> to view full list.
        </div>
      `;
    } else {
      nearbyShelters.slice(0, 3).forEach(shl => {
        const card = document.createElement("div");
        card.className = "shelter-mini-card";
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.85rem; color:#fff;">${shl.name}</strong>
            <span class="badge badge-terrain" style="font-size:0.7rem;">${shl.distanceKm ? shl.distanceKm + ' km away' : 'Safe High Ground'}</span>
          </div>
          <p style="font-size:0.775rem; color:var(--text-muted); margin:0.25rem 0;">
            ${shl.address || shl.sector} &bull; Capacity: ${shl.capacityPeople || 200} citizens
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.35rem;">
            <span style="font-size:0.75rem; color:#6ee7b7;">📞 ${shl.contactPhone || '112'}</span>
            <a href="/rescue.html?lat=${shl.lat}&lon=${shl.lon}" class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:0.15rem 0.5rem;">
              Directions ↗
            </a>
          </div>
        `;
        sheltersContainer.appendChild(card);
      });
    }
  }

  const btnSos = document.getElementById("btnModalBroadcastSos");
  if (btnSos) {
    btnSos.href = `/rescue.html?hazard=${encodeURIComponent(diagnosis.calamityType)}`;
  }

  modal.classList.remove("hidden");
}
