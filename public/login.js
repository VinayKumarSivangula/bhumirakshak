/**
 * Login & Safety Registration Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initLoginForm();
  initRegisterForm();
  initDemoButtons();
  initGpsDetection();
});

// Tab Switching
function initTabs() {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const formLogin = document.getElementById("formLoginContainer");
  const formRegister = document.getElementById("formRegisterContainer");

  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.classList.remove("hidden");
    formRegister.classList.add("hidden");
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    formRegister.classList.remove("hidden");
    formLogin.classList.add("hidden");
  });
}

// 1-Click Demo Logins
function initDemoButtons() {
  document.getElementById("btnDemoResident").addEventListener("click", () => {
    executeLogin("resident@bhumirakshak.in", "password123");
  });

  document.getElementById("btnDemoVolunteer").addEventListener("click", () => {
    executeLogin("volunteer@bhumirakshak.in", "password123");
  });

  document.getElementById("btnDemoResponder").addEventListener("click", () => {
    executeLogin("responder@bhumirakshak.in", "password123");
  });
}

// Login Form Submission
function initLoginForm() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    await executeLogin(email, password);
  });
}

async function executeLogin(email, password) {
  try {
    showToast("Signing in...");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Save token and user details in localStorage
    localStorage.setItem("bk_auth_token", data.token);
    localStorage.setItem("bk_user", JSON.stringify(data.user));

    showToast(`✅ Welcome back, ${data.user.name}! Redirecting...`);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
}

// Register Form Submission (Collects User Data)
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const phone = document.getElementById("regPhone").value.trim();
    const role = document.getElementById("regRole").value;

    const homeVillage = document.getElementById("regHomeLocation").value.trim();
    const lat = parseFloat(document.getElementById("regLat").value);
    const lon = parseFloat(document.getElementById("regLon").value);

    const contactName = document.getElementById("regContactName").value.trim();
    const contactPhone = document.getElementById("regContactPhone").value.trim();
    const contactRelation = document.getElementById("regContactRelation").value;
    const threshold = document.getElementById("regAlertThreshold").value;

    if (!name || !email || !password || !phone) {
      showToast("⚠️ Please fill in all required personal details.");
      return;
    }

    const payload = {
      name,
      email,
      password,
      phone,
      role,
      homeLocation: {
        name: homeVillage,
        lat: isNaN(lat) ? null : lat,
        lon: isNaN(lon) ? null : lon
      },
      emergencyContact: {
        name: contactName,
        phone: contactPhone,
        relation: contactRelation
      },
      alertPreferences: {
        minSeverity: threshold,
        smsAlerts: true,
        browserPush: true
      }
    };

    try {
      showToast("Saving your safety profile...");
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("bk_auth_token", data.token);
      localStorage.setItem("bk_user", JSON.stringify(data.user));

      showToast(`✅ Profile registered! Welcome, ${data.user.name}.`);
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });
}

// GPS Location Auto-Detection for Home Village
function initGpsDetection() {
  const btnGps = document.getElementById("btnDetectHomeGPS");
  btnGps.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("⚠️ Geolocation is not supported by your browser.");
      return;
    }

    btnGps.textContent = "Detecting GPS...";
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        btnGps.innerHTML = "<span>📍</span> GPS Coordinates Filled!";
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        document.getElementById("regLat").value = lat;
        document.getElementById("regLon").value = lon;

        // Try reverse geocoding to fill village name
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          if (res.ok) {
            const data = await res.json();
            if (data.display_name && !document.getElementById("regHomeLocation").value) {
              document.getElementById("regHomeLocation").value = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch (e) {
          // ignore
        }
      },
      () => {
        btnGps.innerHTML = "<span>📍</span> Auto-Fill with Current GPS Location";
        showToast("⚠️ Could not fetch GPS location. Please type coordinates manually.");
      },
      { timeout: 8000 }
    );
  });
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}
