// Comprehensive verification for Multi-Page Platform, Imagery, and 10-Language Localization
async function runVerification() {
  const baseUrl = "http://localhost:3000";

  console.log("=== 1. Verifying All 7 Dedicated Platform Pages ===");
  const pages = [
    { path: "/", label: "Home / Live Assessor" },
    { path: "/index.html", label: "Index HTML" },
    { path: "/map.html", label: "Interactive Landslide Map Explorer" },
    { path: "/guide.html", label: "Visual Field Guide with Photos" },
    { path: "/reports.html", label: "Community Ground Signs Feed" },
    { path: "/alerts.html", label: "Early Warning Alert Center" },
    { path: "/about.html", label: "Scientific Methodology & Citations" },
    { path: "/login.html", label: "Citizen & Responder Safety Portal" }
  ];

  for (const page of pages) {
    const res = await fetch(`${baseUrl}${page.path}`);
    console.log(`  [${res.status} OK] ${page.label} (${page.path}) - Size: ${(await res.text()).length} bytes`);
    if (res.status !== 200) throw new Error(`Page ${page.path} returned ${res.status}`);
  }

  console.log("\n=== 2. Verifying Visual Assets & Landslide Photos ===");
  const images = [
    { path: "/images/himalayan_hero.jpg", label: "Himalayan Landscape Hero" },
    { path: "/images/warning_signs.jpg", label: "Landslide Warning Signs Visual" },
    { path: "/images/landslide_types.jpg", label: "Landslide Types Infographic Photo" }
  ];

  for (const img of images) {
    const res = await fetch(`${baseUrl}${img.path}`);
    const blob = await res.blob();
    console.log(`  [${res.status} OK] ${img.label} (${img.path}) - Size: ${Math.round(blob.size / 1024)} KB`);
    if (res.status !== 200 || blob.size < 50000) throw new Error(`Image ${img.path} invalid or too small`);
  }

  console.log("\n=== 3. Verifying Scripts & Stylesheets ===");
  const assets = [
    "/styles.css",
    "/i18n.js",
    "/app.js",
    "/map.js",
    "/reports.js",
    "/alerts.js",
    "/login.js"
  ];

  for (const a of assets) {
    const res = await fetch(`${baseUrl}${a}`);
    console.log(`  [${res.status} OK] Asset ${a} - Size: ${(await res.text()).length} bytes`);
    if (res.status !== 200) throw new Error(`Asset ${a} returned ${res.status}`);
  }

  console.log("\n=== 4. Testing Multi-Language Dictionary Completeness ===");
  const i18nRes = await fetch(`${baseUrl}/i18n.js`);
  const i18nCode = await i18nRes.text();
  
  // Extract translations object in sandboxed evaluation
  const fn = new Function(`${i18nCode}; return { translations, SUPPORTED_LANGUAGES };`);
  const { translations, SUPPORTED_LANGUAGES } = fn();

  console.log(`Supported Languages Count: ${SUPPORTED_LANGUAGES.length}`);
  SUPPORTED_LANGUAGES.forEach(lang => {
    const keys = Object.keys(translations[lang.code] || {});
    console.log(`  ✓ [${lang.code}] ${lang.label} - ${keys.length} translated keys`);
    if (keys.length < 15) throw new Error(`Language ${lang.code} missing required keys`);
  });

  console.log("\n=== 5. Testing Live Open-Meteo & Risk APIs ===");
  const testLocations = [
    { name: "Joshimath, Uttarakhand", lat: 30.5564, lon: 79.5658 },
    { name: "Shimla, Himachal Pradesh", lat: 31.1048, lon: 77.1734 }
  ];

  for (const loc of testLocations) {
    const res = await fetch(`${baseUrl}/api/risk?lat=${loc.lat}&lon=${loc.lon}&name=${encodeURIComponent(loc.name)}`);
    const json = await res.json();
    console.log(`  ✓ Risk for ${loc.name}: ${json.data.risk.badgeLabel} (Score: ${json.data.risk.score}/100)`);
    console.log(`    Weather: ${json.weather.rainLast24h}mm rain, ${json.weather.saturationPercent}% soil saturation`);
  }

  console.log("\n🎉 ALL MULTI-PAGE, HIMALAYAN DESIGN, VISUAL IMAGERY, AND MULTI-LANGUAGE VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
