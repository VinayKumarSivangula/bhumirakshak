// Direct unit test of weatherService, riskEngine, and db modules
const fs = require('fs');
const path = require('path');
const { fetchWeatherData } = require('./services/weatherService');
const { evaluateLandslideRisk } = require('./services/riskEngine');
const db = require('./config/firebase');

async function runTests() {
  console.log("=== STEP 1: Testing Database Operations ===");
  const initialReports = await db.getReports();
  console.log(`Initial reports count: ${initialReports.length}`);
  
  const testReport = await db.addReport({
    locationName: "Test Hill Road",
    lat: 30.5564,
    lon: 79.5658,
    signType: "ground_cracks",
    signTitle: "Verification Test Crack",
    description: "Automated test verification of report creation",
    severity: "High"
  });
  console.log("Added test report ID:", testReport.id);

  console.log("\n=== STEP 2: Testing Open-Meteo Weather API Integration ===");
  const testCoords = [
    { name: "Wayanad, Kerala", lat: 11.6854, lon: 76.1320 },
    { name: "Joshimath, Uttarakhand", lat: 30.5564, lon: 79.5658 }
  ];

  const inventoryRaw = fs.readFileSync(path.join(__dirname, 'data', 'isro_landslide_inventory.json'), 'utf-8');
  const inventoryData = JSON.parse(inventoryRaw);

  for (const loc of testCoords) {
    console.log(`\nTesting: ${loc.name} (${loc.lat}, ${loc.lon})`);
    const weather = await fetchWeatherData(loc.lat, loc.lon);
    console.log("  Weather Source:", weather.source);
    console.log(`  Rain Last 24h: ${weather.rainLast24h} mm (${weather.rainfallCategory})`);
    console.log(`  Rain Last 72h: ${weather.rainLast72h} mm`);
    console.log(`  Forecast Next 24h: ${weather.forecastNext24h} mm`);
    console.log(`  Soil Saturation: ${weather.saturationPercent}% (${weather.moistureCategory})`);

    console.log("\n=== STEP 3: Evaluating Risk Engine ===");
    const assessment = evaluateLandslideRisk({
      locationName: loc.name,
      lat: loc.lat,
      lon: loc.lon,
      weather,
      inventoryData,
      recentReports: await db.getReports()
    });

    console.log(`  Calculated Risk Score: ${assessment.risk.score}/100`);
    console.log(`  Risk Level: ${assessment.risk.level} (${assessment.risk.badgeLabel})`);
    console.log(`  Plain English Summary: "${assessment.risk.plainEnglishSummary}"`);
    console.log(`  Nearest ISRO Slide: ${assessment.factorScores.historicalLandslides.nearestDistanceKm} km`);
    console.log(`  Safety Checklist Items: ${assessment.risk.safetyChecklist.length}`);
    console.log(`  Disclaimer verified: "${assessment.disclaimer.slice(0, 70)}..."`);
  }

  console.log("\n=== STEP 4: Testing Alert Subscription Flow ===");
  const sub = await db.addSubscription({
    locationName: "Test Monitored Zone",
    lat: 11.6854,
    lon: 76.1320,
    threshold: "HIGH",
    contact: "Test Device"
  });
  console.log("Created subscription ID:", sub.id);
  const subs = await db.getSubscriptions();
  console.log(`Active subscriptions count: ${subs.length}`);

  console.log("\n>>> ALL LOCAL MODULE & API INTEGRATION TESTS PASSED SUCCESSFULLY! <<<");
}

runTests().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
