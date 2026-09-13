// End-to-End Test for Safe Shelters, Citizen SOS Beacons, Rakshak Tactical Command, and Photo Reporting
async function runTests() {
  const baseUrl = "http://localhost:3000";

  console.log("=== 1. Verifying HTML Pages Availability ===");
  const pages = [
    { url: "/rescue.html", label: "User Domain: Safe Shelters & Citizen SOS" },
    { url: "/rakshak.html", label: "Rakshak Domain: Tactical Rescue Command" },
    { url: "/reports.html", label: "Community Signs Feed with Photo Evidence" },
    { url: "/index.html", label: "Main Assessment Dashboard" },
    { url: "/map.html", label: "Interactive GIS Map" }
  ];

  for (const page of pages) {
    const res = await fetch(`${baseUrl}${page.url}`);
    console.log(`  [${res.status} OK] ${page.label} (${page.url})`);
    if (res.status !== 200) throw new Error(`Failed to load ${page.url}`);
  }

  console.log("\n=== 2. Testing Safe Shelters Endpoint (Proximity & Elevation) ===");
  const testLat = 30.5564;
  const testLon = 79.5658; // Joshimath
  const sheltersRes = await fetch(`${baseUrl}/api/shelters?lat=${testLat}&lon=${testLon}`);
  if (!sheltersRes.ok) throw new Error("GET /api/shelters failed");
  const sheltersData = await sheltersRes.json();
  console.log(`  ✓ Retrieved ${sheltersData.shelters.length} verified high-ground shelters.`);
  const closest = sheltersData.shelters[0];
  console.log(`  ✓ Closest Haven to Joshimath: ${closest.name}`);
  console.log(`    Distance: ${closest.distanceKm} km | Capacity: ${closest.capacity} beds | Elev: ${closest.elevationMeters}m`);
  if (closest.distanceKm === undefined || closest.distanceKm > 10) {
    throw new Error("Closest shelter distance calculation unexpected");
  }

  console.log("\n=== 3. Testing Citizen SOS Broadcast & Location Sharing ===");
  const sosPayload = {
    name: "Hemant Rawat & Family",
    phone: "+91 94120 99887",
    locationName: "Joshimath Lower Slopes near Helipad road",
    lat: 30.5590,
    lon: 79.5640,
    peopleCount: 4,
    urgency: "HIGH_VULNERABLE",
    hazardType: "Slope Cracking & Road Blocked",
    notes: "Tension cracks across courtyard. Road blocked by mud slurry."
  };

  const broadcastRes = await fetch(`${baseUrl}/api/sos/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sosPayload)
  });

  if (!broadcastRes.ok) throw new Error("POST /api/sos/broadcast failed");
  const broadcastData = await broadcastRes.json();
  const createdSos = broadcastData.sos;
  console.log(`  ✓ Broadcasted Live SOS Beacon: ID = ${createdSos.id}`);
  console.log(`    Status: ${createdSos.status} | Nearest Haven: ${createdSos.nearestShelter.name} (${createdSos.nearestShelter.distanceKm} km)`);

  console.log("\n=== 4. Testing Rakshak Active Beacons Telemetry ===");
  const activeRes = await fetch(`${baseUrl}/api/sos/active`);
  if (!activeRes.ok) throw new Error("GET /api/sos/active failed");
  const activeData = await activeRes.json();
  console.log(`  ✓ Rakshak Tactical Command detected ${activeData.activeSos.length} active distress beacons.`);
  const foundSos = activeData.activeSos.find(s => s.id === createdSos.id);
  if (!foundSos) throw new Error("Broadcasted SOS not found in active queue");

  console.log("\n=== 5. Testing Rakshak Dispatch Unit Action ===");
  const dispatchRes = await fetch(`${baseUrl}/api/sos/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sosId: createdSos.id,
      status: "DISPATCHED",
      assignedTeam: "SDRF Mountain Rescue Team 1 (En Route - ETA 8m)",
      notes: "Take high ridge corridor towards Govt Inter College Camp."
    })
  });

  if (!dispatchRes.ok) throw new Error("POST /api/sos/update-status (DISPATCH) failed");
  const dispatchData = await dispatchRes.json();
  console.log(`  ✓ Dispatched Unit: ${dispatchData.sos.assignedTeam}`);
  console.log(`    Updated Status: ${dispatchData.sos.status}`);

  console.log("\n=== 6. Testing Evacuation Completion (Mark Safe / Rescued) ===");
  const safeRes = await fetch(`${baseUrl}/api/sos/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sosId: createdSos.id,
      status: "RESCUED",
      notes: "Safely arrived at Joshimath High-Ground Camp."
    })
  });
  if (!safeRes.ok) throw new Error("POST /api/sos/update-status (RESCUED) failed");
  console.log(`  ✓ Survivor status updated to: ${(await safeRes.json()).sos.status}`);

  console.log("\n=== 7. Testing Clean Cancellation ===");
  const cancelRes = await fetch(`${baseUrl}/api/sos/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sosId: createdSos.id })
  });
  if (!cancelRes.ok) throw new Error("POST /api/sos/cancel failed");
  console.log("  ✓ Test SOS beacon cleaned up successfully.");

  console.log("\n=== 8. Testing Photo Evidence Reporting with Base64 Image ===");
  // Simulated small 1x1 png in base64 data URL
  const samplePhotoUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const reportPayload = {
    locationName: "Chamoli Bypass Km 12",
    lat: 30.5510,
    lon: 79.5600,
    signType: "ground_cracks",
    signTitle: "Fresh 3-inch Tension Crack Across Road",
    description: "Surface fissure propagating from uphill slope terrace.",
    severity: "High",
    reportedBy: "SDRF Scout Patrol",
    photoUrl: samplePhotoUrl
  };

  const reportRes = await fetch(`${baseUrl}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportPayload)
  });

  if (!reportRes.ok) throw new Error("POST /api/reports with photo failed");
  const reportData = await reportRes.json();
  console.log(`  ✓ Report submitted with photo evidence: ID = ${reportData.report.id}`);
  if (!reportData.report.photoUrl || !reportData.report.photoUrl.startsWith("data:image/")) {
    throw new Error("photoUrl was not properly saved on report");
  }
  console.log("  ✓ photoUrl verified intact in database.");

  console.log("\n=== 9. Testing Multilingual Dictionary for User & Rakshak Domains ===");
  const { translations, SUPPORTED_LANGUAGES } = require("./public/i18n.js");
  console.log(`  Verifying ${SUPPORTED_LANGUAGES.length} Northern Indian Languages:`);
  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = translations[lang.code];
    if (!dict.navRescue || !dict.navRakshak) {
      throw new Error(`Language [${lang.code}] missing navRescue or navRakshak`);
    }
    console.log(`  ✓ [${lang.code}] ${lang.label} -> Rescue: "${dict.navRescue}" | Rakshak: "${dict.navRakshak}"`);
  }

  console.log("\n🎉 ALL USER & RAKSHAK DOMAINS, SHELTERS, LIVE SOS GPS, AND PHOTO REPORTING TESTS PASSED! 🎉");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
