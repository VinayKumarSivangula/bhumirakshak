/**
 * Dedicated Alerts & Subscriptions Manager Script
 */

document.addEventListener("DOMContentLoaded", () => {
  loadSubscriptions();
  initSubscribeForm();
  initCheckTrigger();
});

async function loadSubscriptions() {
  const container = document.getElementById("subscriptionsList");
  try {
    const res = await fetch("/api/subscriptions");
    if (!res.ok) throw new Error("Could not fetch subscriptions");
    const data = await res.json();
    const subs = data.subscriptions || [];

    if (subs.length === 0) {
      container.innerHTML = `<div style="color:var(--text-muted); padding:1rem 0;">No active location subscriptions yet. Register your village on the right.</div>`;
      return;
    }

    container.innerHTML = "";
    subs.forEach(sub => {
      const card = document.createElement("div");
      card.className = "sub-card";

      const thresholdColor = sub.threshold === 'SEVERE' ? 'badge-danger' : (sub.threshold === 'HIGH' ? 'badge-warning' : 'badge-info');
      const timeStr = sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Active";

      card.innerHTML = `
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <strong style="color:#fff; font-size:1.05rem;">${sub.locationName}</strong>
            <span class="threshold-badge ${thresholdColor}">${sub.threshold} THRESHOLD</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-dim);">
            <span>Coords: ${sub.lat}, ${sub.lon}</span> •
            <span>Contact: ${sub.contact}</span> •
            <span>Registered: ${timeStr}</span>
          </div>
        </div>
        <a href="/?lat=${sub.lat}&lon=${sub.lon}&name=${encodeURIComponent(sub.locationName)}" class="btn btn-sm btn-outline">
          Inspect Risk
        </a>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div style="color:#f87171;">⚠️ Could not load subscriptions.</div>`;
  }
}

function initSubscribeForm() {
  const form = document.getElementById("subscribePageForm");
  const btnGps = document.getElementById("btnGpsSub");

  if (btnGps) {
    btnGps.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("⚠️ Geolocation not supported by your browser.");
        return;
      }
      btnGps.textContent = "Detecting GPS...";
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          btnGps.innerHTML = "<span>📍</span> Coordinates Filled!";
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lon = Math.round(pos.coords.longitude * 10000) / 10000;
          document.getElementById("subLat").value = lat;
          document.getElementById("subLon").value = lon;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            if (res.ok) {
              const data = await res.json();
              if (data.display_name && !document.getElementById("subLocName").value) {
                document.getElementById("subLocName").value = data.display_name.split(',').slice(0, 3).join(', ');
              }
            }
          } catch (e) {}
        },
        () => {
          btnGps.innerHTML = "<span>📍</span> Auto-Fill with Device GPS";
          showToast("⚠️ Could not fetch GPS location.");
        }
      );
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if ("Notification" in window) {
      await Notification.requestPermission();
    }

    const payload = {
      locationName: document.getElementById("subLocName").value.trim(),
      lat: document.getElementById("subLat").value,
      lon: document.getElementById("subLon").value,
      threshold: document.getElementById("subThresholdSelect").value,
      contact: document.getElementById("subDeviceName").value.trim() || "Citizen Device"
    };

    try {
      showToast("Registering early warning subscription...");
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Subscription failed");

      showToast(`🔔 Early warning alerts active for "${payload.locationName}"!`);
      form.reset();
      loadSubscriptions();
    } catch (err) {
      showToast("⚠️ Could not activate alert subscription.");
    }
  });
}

function initCheckTrigger() {
  const btn = document.getElementById("btnTriggerCheck");
  const box = document.getElementById("checkResultsBox");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner" style="width:14px; height:14px; border-width:2px;"></div> Checking...`;
    showToast("Running automated weather and risk threshold verification...");

    try {
      const res = await fetch("/api/check-alerts", { method: "POST" });
      const json = await res.json();

      box.classList.remove("hidden");
      box.innerHTML = `
        <div style="color:#6ee7b7; font-weight:700; margin-bottom:0.35rem;">✓ Threshold Check Complete:</div>
        <div>Total monitored locations checked: <strong>${json.subscriptionsChecked}</strong></div>
        <div>Locations crossing alert threshold: <strong>${json.triggeredAlertsCount}</strong></div>
      `;

      if (json.triggeredAlerts && json.triggeredAlerts.length > 0) {
        const first = json.triggeredAlerts[0];
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🚨 BhumiRakshak Landslide Alert", {
            body: `CRITICAL: ${first.locationName} crossed threshold (${first.riskLevel}). ${first.summary}`,
            icon: "🏔️"
          });
        }
        showToast(`🚨 Alert triggered for ${first.locationName}! Check notification.`);
      } else {
        showToast("ℹ️ All monitored locations currently below alert thresholds.");
      }
    } catch (err) {
      showToast("⚠️ Threshold verification failed.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>🔄</span> Run Live Threshold Check Now`;
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 4500);
}
