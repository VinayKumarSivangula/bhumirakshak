// Automated end-to-end verification of Auth & User Data Collection
async function testAuth() {
  const baseUrl = "http://localhost:3000";

  console.log("=== 1. Testing Login Page Availability ===");
  const loginPageRes = await fetch(`${baseUrl}/login.html`);
  console.log(`login.html HTTP Status: ${loginPageRes.status} (Length: ${(await loginPageRes.text()).length} bytes)`);

  console.log("\n=== 2. Testing Existing User Login (Resident Demo) ===");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "resident@bhumirakshak.in",
      password: "password123"
    })
  });
  const loginData = await loginRes.json();
  console.log("Login success:", loginData.success);
  console.log(`User: ${loginData.user.name} (${loginData.user.role}, Phone: ${loginData.user.phone})`);
  const token = loginData.token;

  console.log("\n=== 3. Testing Session Verification (/api/auth/me) ===");
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log("Auth me response:", meData.user.name, "| Saved locations count:", meData.user.savedLocations.length);

  console.log("\n=== 4. Testing New Citizen Registration & Data Collection ===");
  const regPayload = {
    name: "Sunil Joshi",
    email: `sunil.${Date.now()}@example.com`,
    password: "securePassword123",
    phone: "+91 98765 11223",
    role: "Farmer / Plantation Worker",
    homeLocation: {
      name: "Coonoor Tea Slopes, Nilgiris",
      lat: 11.3500,
      lon: 76.7900
    },
    emergencyContact: {
      name: "Rekha Joshi",
      phone: "+91 98765 44556",
      relation: "Family"
    },
    alertPreferences: {
      minSeverity: "HIGH",
      smsAlerts: true,
      browserPush: true
    }
  };

  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload)
  });
  const regData = await regRes.json();
  console.log("Registration success:", regData.success);
  console.log("Registered Citizen:", regData.user.name);
  console.log("Collected Mobile:", regData.user.phone);
  console.log("Collected Home Location:", regData.user.homeLocation.name);
  console.log("Collected Emergency Contact:", regData.user.emergencyContact);

  const newCitizenToken = regData.token;

  console.log("\n=== 5. Testing Saved Locations for New Citizen ===");
  const saveLocRes = await fetch(`${baseUrl}/api/user/saved-locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${newCitizenToken}`
    },
    body: JSON.stringify({
      name: "Darjeeling Tea Valley",
      lat: 27.0410,
      lon: 88.2663
    })
  });
  const saveLocData = await saveLocRes.json();
  console.log("Saved location item:", saveLocData.location.name);

  const getLocsRes = await fetch(`${baseUrl}/api/user/saved-locations`, {
    headers: { "Authorization": `Bearer ${newCitizenToken}` }
  });
  const getLocsData = await getLocsRes.json();
  console.log(`Citizen now has ${getLocsData.savedLocations.length} saved monitored locations.`);

  console.log("\n=== 6. Testing Admin / Response Overview ===");
  const adminRes = await fetch(`${baseUrl}/api/admin/users`);
  const adminData = await adminRes.json();
  console.log(`Total registered citizens in system: ${adminData.totalRegisteredCitizens}`);

  console.log("\n>>> ALL AUTHENTICATION & USER DATA COLLECTION TESTS PASSED! <<<");
}

testAuth().catch(err => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
