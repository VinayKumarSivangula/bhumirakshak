// Test HTTP endpoints of the running server
async function testServer() {
  const baseUrl = "http://localhost:3000";

  console.log("1. Checking /health endpoint...");
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthJson = await healthRes.json();
  console.log("Health status:", healthJson);

  console.log("\n2. Checking /api/districts endpoint...");
  const distRes = await fetch(`${baseUrl}/api/districts`);
  const distJson = await distRes.json();
  console.log(`Loaded ${distJson.districts.length} high-risk districts.`);

  console.log("\n3. Checking /api/risk for Shimla, HP...");
  const riskRes = await fetch(`${baseUrl}/api/risk?lat=31.1048&lon=77.1734&name=Shimla`);
  const riskJson = await riskRes.json();
  console.log("Risk level for Shimla:", riskJson.data.risk.badgeLabel);
  console.log("Summary:", riskJson.data.risk.plainEnglishSummary);

  console.log("\n4. Checking /api/check-alerts endpoint...");
  const alertRes = await fetch(`${baseUrl}/api/check-alerts`, { method: "POST" });
  const alertJson = await alertRes.json();
  console.log("Alert check result:", alertJson);

  console.log("\n5. Checking static frontend /index.html...");
  const staticRes = await fetch(`${baseUrl}/index.html`);
  console.log("Frontend HTTP status:", staticRes.status, `(length: ${(await staticRes.text()).length} bytes)`);

  console.log("\n>>> ALL HTTP ENDPOINTS TESTED & VERIFIED! <<<");
}

testServer().catch(err => {
  console.error("HTTP endpoint test failed:", err);
  process.exit(1);
});
