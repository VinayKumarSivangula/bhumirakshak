(function () {
  const langPicker = document.getElementById("lang-picker");
  if (langPicker) initLanguageSwitcher(langPicker);

  const loginView = document.getElementById("login-view");
  const registerView = document.getElementById("register-view");
  document.getElementById("show-register")?.addEventListener("click", (e) => {
    e.preventDefault();
    loginView.style.display = "none";
    registerView.style.display = "block";
  });
  document.getElementById("show-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    registerView.style.display = "none";
    loginView.style.display = "block";
  });

  function showError(boxId, message) {
    const box = document.getElementById(boxId);
    box.textContent = message;
    box.classList.add("is-visible");
  }
  function hideError(boxId) {
    document.getElementById(boxId).classList.remove("is-visible");
  }

  // ---- Login ----
  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError("login-error");
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");

      localStorage.setItem("bhumirakshak_token", json.token);
      localStorage.setItem("bhumirakshak_user", JSON.stringify(json.user));
      window.location.href = "/";
    } catch (err) {
      showError("login-error", err.message);
    }
  });

  // ---- Register ----
  const registerForm = document.getElementById("register-form");
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError("register-error");

    const payload = {
      name: document.getElementById("reg-name").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
      phone: document.getElementById("reg-phone").value,
      homeLocation: {
        name: document.getElementById("reg-home-name").value,
        lat: parseFloat(document.getElementById("reg-home-lat").value) || null,
        lon: parseFloat(document.getElementById("reg-home-lon").value) || null
      }
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");

      localStorage.setItem("bhumirakshak_token", json.token);
      localStorage.setItem("bhumirakshak_user", JSON.stringify(json.user));
      window.location.href = "/";
    } catch (err) {
      showError("register-error", err.message);
    }
  });
})();
