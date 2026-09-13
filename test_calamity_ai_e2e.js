const http = require('http');
const fs = require('fs');
const path = require('path');

function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = { 'Content-Type': 'application/json', ...headers };
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method,
      headers: defaultHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING AI CALAMITY & VERIFIED NOTIFICATION E2E SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ? PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ? FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log('[1] Checking Server Health...');
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'online', 'Server is online');

    console.log('\n[2] Testing AI Visual Calamity Diagnostic API (/api/analyze-image)...');
    const diagPayload = {
      photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      signType: 'ground_cracks',
      locationName: 'Joshimath Upper Ridge',
      description: 'Extensive 4-inch tension cracks opening along road shoulder.',
      lat: 30.5564,
      lon: 79.5658
    };

    const diagRes = await request('POST', '/api/analyze-image', diagPayload);
    assert(diagRes.status === 200, 'POST /api/analyze-image responded with status 200');
    assert(diagRes.body.success === true, 'Response indicates success');

    const diag = diagRes.body.diagnosis;
    assert(Boolean(diag), 'Diagnosis object is present');
    assert(diag.calamityType && diag.calamityType.includes('Slump'), `Identified Calamity Type: "${diag.calamityType}"`);
    assert(diag.hazardCode === 'GSI-SLUMP-TENSILE', `Hazard code mapped to GSI standards: "${diag.hazardCode}"`);
    assert(diag.threatSeverity === 'HIGH_WARNING', `Threat severity classified: "${diag.threatSeverity}"`);
    assert(diag.confidenceScore >= 80, `Confidence score generated: ${diag.confidenceScore}%`);

    assert(Boolean(diag.rangeOfEffect), 'Range of effect structure present');
    assert(Boolean(diag.rangeOfEffect.downslopeRunoutMeters), `Downslope runout calculated: "${diag.rangeOfEffect.downslopeRunoutMeters}"`);
    assert(Boolean(diag.rangeOfEffect.propagationSpeed), `Propagation velocity calculated: "${diag.rangeOfEffect.propagationSpeed}"`);
    assert(Array.isArray(diag.rangeOfEffect.threatenedAssets) && diag.rangeOfEffect.threatenedAssets.length > 0,
      `Identified ${diag.rangeOfEffect.threatenedAssets.length} threatened asset categories`);

    assert(Array.isArray(diag.survivalMeasures) && diag.survivalMeasures.length >= 3,
      `Life-safety survival measures generated (${diag.survivalMeasures.length} actions)`);
    assert(Array.isArray(diag.evacuationMeasures) && diag.evacuationMeasures.length >= 2,
      `Designated evacuation measures generated (${diag.evacuationMeasures.length} guidance rules)`);

    assert(Array.isArray(diagRes.body.nearbySafeShelters) && diagRes.body.nearbySafeShelters.length > 0,
      `Mapped ${diagRes.body.nearbySafeShelters.length} vetted safe shelters nearby (closest: ${diagRes.body.nearbySafeShelters[0].name})`);

    console.log('\n[3] Testing Calamity Archetype: Muddy Spring / Pore-Pressure Piping...');
    const springDiag = await request('POST', '/api/analyze-image', {
      signType: 'muddy_spring',
      description: 'Turbid mud water boiling rapidly out of slope drain.',
      lat: 11.535,
      lon: 76.152
    });
    assert(springDiag.body.diagnosis.hazardCode === 'GSI-PIPING-FLOW', 'Correctly classified as GSI-PIPING-FLOW');
    assert(springDiag.body.diagnosis.threatSeverity === 'CRITICAL_IMMINENT', 'Classified as CRITICAL_IMMINENT threat');

    console.log('\n[4] Testing Report Submission with Automated Calamity Analysis...');
    const reportPayload = {
      locationName: 'Chamoli Sector 4',
      lat: 30.551,
      lon: 79.56,
      signType: 'debris_flow',
      signTitle: 'Fast Mudflow in Tributary Gully',
      description: 'Saturated mud slurry dislodging boulders near main bridge.',
      severity: 'Severe',
      photoUrl: 'images/warning_signs.jpg',
      isVerified: true
    };
    const repRes = await request('POST', '/api/reports', reportPayload);
    assert(repRes.status === 201, 'POST /api/reports created with 201');
    assert(Boolean(repRes.body.report.calamityAnalysis), 'Calamity analysis automatically appended to new report');
    assert(repRes.body.report.calamityAnalysis.hazardCode === 'GSI-DEBRIS-AVALANCHE', 'Debris flow hazard code accurately generated');
    assert(repRes.body.report.isVerified === true, 'Report verified flag set to true');

    console.log('\n[5] Testing Verified Field Ground Sign Alert on Main Assessment (/api/risk)...');
    const riskRes = await request('GET', '/api/risk?lat=30.551&lon=79.56&name=Chamoli%20Bypass');
    assert(riskRes.status === 200, 'GET /api/risk responded with status 200');
    assert(Boolean(riskRes.body.verifiedFieldNotification), 'verifiedFieldNotification is returned in assessment response');

    const notif = riskRes.body.verifiedFieldNotification;
    assert(notif.isVerified === true, 'Notification confirmed to be from a verified field sign');
    assert(notif.distanceKm <= 5, `Verified ground sign distance calculated: ${notif.distanceKm} km`);
    assert(Boolean(notif.calamityAnalysis), 'Calamity analysis attached to verified alert notification');
    assert(Array.isArray(notif.nearbyShelters) && notif.nearbyShelters.length > 0,
      `Attached ${notif.nearbyShelters.length} nearest safe evacuation shelters to notification`);

    console.log('\n[6] Checking UI Frontend File Integrity...');
    const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
    assert(indexHtml.includes('id="verifiedAlertBanner"'), 'index.html includes #verifiedAlertBanner');
    assert(indexHtml.includes('id="photoScannerCard"'), 'index.html includes #photoScannerCard');
    assert(indexHtml.includes('id="calamityModal"'), 'index.html includes #calamityModal');
    assert(indexHtml.includes('id="modalRunoutFootprint"'), 'index.html includes #modalRunoutFootprint');

    const appJs = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf-8');
    assert(appJs.includes('renderVerifiedNotification'), 'app.js includes renderVerifiedNotification()');
    assert(appJs.includes('openCalamityModal'), 'app.js includes openCalamityModal()');
    assert(appJs.includes('initPhotoScanner'), 'app.js includes initPhotoScanner()');

    const reportsHtml = fs.readFileSync(path.join(__dirname, 'public', 'reports.html'), 'utf-8');
    assert(reportsHtml.includes('id="photoDiagnosisPreview"'), 'reports.html includes #photoDiagnosisPreview');
    assert(reportsHtml.includes('id="calamityModal"'), 'reports.html includes #calamityModal');

    const stylesCss = fs.readFileSync(path.join(__dirname, 'public', 'styles.css'), 'utf-8');
    assert(stylesCss.includes('.field-alert-banner'), 'styles.css includes .field-alert-banner');
    assert(stylesCss.includes('.pulse-radar-tag'), 'styles.css includes .pulse-radar-tag');
    assert(stylesCss.includes('.calamity-grid-top'), 'styles.css includes .calamity-grid-top');

    console.log(`\n=== E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution failed with unhandled error:', err);
    process.exit(1);
  }
}

runTests();
