/**
 * Multi-Factor Landslide Risk Assessment Engine
 * Synthesizes Open-Meteo weather, ISRO Landslide Atlas inventory, GSI susceptibility, and field reports.
 */

// Haversine formula to compute distance in kilometers between two coordinates
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function evaluateLandslideRisk({
  locationName = "Selected Location",
  lat,
  lon,
  weather,
  inventoryData,
  recentReports = []
}) {
  const reasons = [];
  let score = 0;

  // -------------------------------------------------------------
  // 1. RAINFALL TRIGGER (Max 35 points)
  // -------------------------------------------------------------
  let rainScore = 0;
  const rain24h = weather.rainLast24h || 0;
  const rain72h = weather.rainLast72h || 0;
  const forecastRain = weather.forecastNext24h || 0;

  if (rain24h >= 100 || rain72h >= 150) {
    rainScore = 35;
    reasons.push(`Torrential precipitation: ${rain24h}mm in last 24h (${rain72h}mm over 72h) exceeds critical slope failure thresholds.`);
  } else if (rain24h >= 60 || rain72h >= 100) {
    rainScore = 28;
    reasons.push(`Heavy continuous rainfall: ${rain24h}mm in 24h (${rain72h}mm 72h accumulation) puts immense pressure on montane slopes.`);
  } else if (rain24h >= 30 || rain72h >= 55) {
    rainScore = 18;
    reasons.push(`Moderate to steady rainfall: ${rain24h}mm recorded over the past 24 hours.`);
  } else if (rain24h >= 10 || rain72h >= 25) {
    rainScore = 10;
    reasons.push(`Light to moderate rain: ${rain24h}mm in the past 24 hours.`);
  } else if (rain24h > 0) {
    rainScore = 4;
    reasons.push(`Minimal light rain: ${rain24h}mm in 24h.`);
  } else {
    rainScore = 0;
    reasons.push(`No significant rainfall recorded in the past 24 hours.`);
  }

  // Forecast storm addition (up to 5 bonus points capped in rain total)
  if (forecastRain >= 50) {
    rainScore = Math.min(35, rainScore + 5);
    reasons.push(`Incoming heavy storm forecast: ${forecastRain}mm predicted over the next 24 hours.`);
  }

  score += rainScore;

  // -------------------------------------------------------------
  // 2. ESTIMATED SOIL MOISTURE SATURATION (Max 25 points)
  // -------------------------------------------------------------
  let moistureScore = 0;
  const saturation = weather.saturationPercent || 0;

  if (saturation >= 85) {
    moistureScore = 25;
    reasons.push(`Severe soil saturation (${saturation}%): Upper and root soil layers are near complete liquefaction/waterlogging.`);
  } else if (saturation >= 70) {
    moistureScore = 19;
    reasons.push(`High soil moisture (${saturation}%): Reduces shear resistance of hillside soil cover.`);
  } else if (saturation >= 50) {
    moistureScore = 11;
    reasons.push(`Moderate soil dampness (${saturation}%): Soil is moist but still retaining structural cohesion.`);
  } else {
    moistureScore = 3;
    reasons.push(`Dry or well-drained soil conditions (${saturation}% saturation).`);
  }

  score += moistureScore;

  // -------------------------------------------------------------
  // 3. ISRO LANDSLIDE ATLAS HISTORICAL EVIDENCE (Max 25 points)
  // -------------------------------------------------------------
  let historicalScore = 0;
  let nearestDistance = 999;
  let nearestEvent = null;
  const nearbyLandslides = [];

  const allEvents = inventoryData.historicalEvents || [];
  for (const ev of allEvents) {
    const dist = calculateDistanceKm(lat, lon, ev.lat, ev.lon);
    if (dist <= 45) {
      nearbyLandslides.push({ ...ev, distanceKm: dist });
    }
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestEvent = { ...ev, distanceKm: dist };
    }
  }

  // Sort nearby events by closest first
  nearbyLandslides.sort((a, b) => a.distanceKm - b.distanceKm);

  // Check if near top-ranked ISRO high risk district
  const highRiskDistricts = inventoryData.highRiskDistricts || [];
  let matchedDistrict = null;
  for (const d of highRiskDistricts) {
    const dDist = calculateDistanceKm(lat, lon, d.center.lat, d.center.lon);
    if (dDist <= 35) {
      matchedDistrict = d;
      break;
    }
  }

  if (nearestDistance <= 5) {
    historicalScore = 22;
    reasons.push(`Critical historical proximity: Located within ${nearestDistance}km of mapped historical landslide (${nearestEvent.name}).`);
  } else if (nearestDistance <= 15) {
    historicalScore = 16;
    reasons.push(`High historical density: ${nearbyLandslides.length} documented ISRO Landslide Atlas events within 15km (nearest: ${nearestEvent.name} at ${nearestDistance}km).`);
  } else if (nearestDistance <= 35) {
    historicalScore = 10;
    reasons.push(`Nearest historical landslide cluster mapped at ${nearestDistance}km (${nearestEvent.name}).`);
  } else if (matchedDistrict) {
    historicalScore = 8;
    reasons.push(`Located inside ${matchedDistrict.name} district, ranked #${matchedDistrict.atlasRank} in ISRO National Landslide Atlas (${matchedDistrict.totalMapped} mapped landslides).`);
  } else {
    historicalScore = 2;
    reasons.push(`No immediate historical landslide points mapped by ISRO within 35km.`);
  }

  if (matchedDistrict && historicalScore < 25) {
    historicalScore = Math.min(25, historicalScore + 3);
  }

  score += historicalScore;

  // -------------------------------------------------------------
  // 4. GSI GEOLOGICAL HAZARD ZONATION (Max 10 points)
  // -------------------------------------------------------------
  let gsiScore = 3;
  let gsiZoneName = "General / Low Susceptibility Zone";
  const zones = inventoryData.gsiSusceptibilityZones || [];

  for (const z of zones) {
    const b = z.bounds;
    if (lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon) {
      gsiZoneName = z.name;
      if (z.defaultSusceptibility === "Very High") {
        gsiScore = 10;
      } else if (z.defaultSusceptibility === "High") {
        gsiScore = 7;
      } else {
        gsiScore = 5;
      }
      break;
    }
  }
  reasons.push(`GSI Hazard Zonation: ${gsiZoneName} (${gsiScore >= 8 ? 'Very High slope gradient & fragile rock' : 'Moderate slope gradient'}).`);
  score += gsiScore;

  // -------------------------------------------------------------
  // 5. CROWD-SOURCED WARNING SIGNS / FIELD SENSORS (Max 10 points)
  // -------------------------------------------------------------
  let fieldSignScore = 0;
  const relevantReports = [];

  for (const rep of recentReports) {
    const rDist = calculateDistanceKm(lat, lon, rep.lat, rep.lon);
    if (rDist <= 20) {
      relevantReports.push({ ...rep, distanceKm: rDist });
    }
  }

  if (relevantReports.length > 0) {
    fieldSignScore = Math.min(10, relevantReports.length * 4);
    const firstRep = relevantReports[0];
    reasons.push(`Field Ground Sign Alert: Local observation of "${firstRep.signTitle}" reported ${firstRep.distanceKm}km away.`);
  }
  score += fieldSignScore;

  // Normalize final score to 0 - 100 range
  const totalScore = Math.min(100, Math.max(0, Math.round(score)));

  // Determine Level and Action Advice
  let level = "LOW";
  let badgeColor = "#22c55e"; // Green
  let badgeLabel = "Low Estimated Risk (Normal)";
  let shortAdvice = "No urgent hazard signs detected. Regular hillside travel is normal.";
  let actionList = [];

  if (totalScore >= 75) {
    level = "SEVERE";
    badgeColor = "#ef4444"; // Red
    badgeLabel = "Severe Estimated Risk (Danger)";
    shortAdvice = "High danger of slope failures and debris flow. Remain alert and prepare for safety.";
    actionList = [
      "Avoid staying near steep hill cuts, river gullies, or unstable retaining structures.",
      "If you notice sudden cracking in walls, door frames sticking, or muddy water from slopes, move immediately to higher, stable ground.",
      "Keep an emergency grab kit (torch, drinking water, phone power bank, essential medicines) ready.",
      "Dial 112 (National Emergency) or 1078 (Disaster Management) for local rescue assistance.",
      "Do not drive or travel along ghat roads or narrow hillside routes until heavy downpours subside."
    ];
  } else if (totalScore >= 50) {
    level = "HIGH";
    badgeColor = "#f97316"; // Orange
    badgeLabel = "High Estimated Risk (Warning)";
    shortAdvice = "Elevated landslide threat due to saturated slopes and recent rainfall.";
    actionList = [
      "Stay vigilant if living on or directly below steep mountain terraces.",
      "Inspect surroundings for new ground fissures, leaning poles, or tilted trees.",
      "Avoid unnecessary mountain travel during nighttime or during heavy rainfall spells.",
      "Identify your nearest community shelter or evacuation meeting point.",
      "Report any signs of hillside movement immediately to local panchayat or helpline 112."
    ];
  } else if (totalScore >= 25) {
    level = "MODERATE";
    badgeColor = "#eab308"; // Yellow
    badgeLabel = "Moderate Estimated Risk (Watch)";
    shortAdvice = "Moderate risk conditions. Wet ground and steady rain warrant awareness.";
    actionList = [
      "Keep drains and culverts around your property clear of mud and debris.",
      "Observe hillside drainage: sudden muddying of clear springs indicates underground movement.",
      "Drive with caution on mountain bends and watch for small fallen pebbles.",
      "Follow local weather updates and district administration advisories."
    ];
  } else {
    level = "LOW";
    badgeColor = "#22c55e"; // Green
    badgeLabel = "Low Estimated Risk (Safe)";
    shortAdvice = "Ground is stable under current dry to mild weather conditions.";
    actionList = [
      "Normal conditions. Maintain proper roof runoff and slope drainage channels.",
      "Familiarize your family with local landslide safety guidelines before monsoon peaks.",
      "Stay connected to local weather forecasts during changes in season."
    ];
  }

  // Generate plain-language summary for ordinary citizen
  const plainEnglish = generatePlainSummary({
    level,
    locationName,
    rain24h,
    rainCategory: weather.rainfallCategory,
    saturation,
    nearestDistance,
    nearestEventName: nearestEvent ? nearestEvent.name : null,
    reportCount: relevantReports.length
  });

  return {
    location: {
      name: locationName,
      lat: Number(lat),
      lon: Number(lon),
      district: matchedDistrict ? matchedDistrict.name : "Regional Zone",
      gsiZone: gsiZoneName
    },
    risk: {
      score: totalScore,
      level,
      badgeColor,
      badgeLabel,
      confidence: totalScore >= 50 ? "High" : "Moderate",
      shortAdvice,
      plainEnglishSummary: plainEnglish,
      safetyChecklist: actionList
    },
    factorScores: {
      rainfall: { score: rainScore, max: 35, rain24h, rain72h, forecast24h: forecastRain },
      soilMoisture: { score: moistureScore, max: 25, saturationPercent: saturation, volumetric: weather.volumetricMoisture },
      historicalLandslides: { score: historicalScore, max: 25, nearestDistanceKm: nearestDistance, countWithin25km: nearbyLandslides.length },
      susceptibility: { score: gsiScore, max: 10, zone: gsiZoneName },
      fieldSigns: { score: fieldSignScore, max: 10, count: relevantReports.length }
    },
    reasons,
    nearbyLandslides: nearbyLandslides.slice(0, 10),
    nearbyReports: relevantReports,
    disclaimer: "This location currently has an estimated landslide risk based on rainfall, historical landslides, susceptibility data, and available warning indicators. It is not an official emergency warning unless authorized by NDMA/SDMA.",
    timestamp: new Date().toISOString()
  };
}

function generatePlainSummary({ level, locationName, rain24h, rainCategory, saturation, nearestDistance, nearestEventName, reportCount }) {
  if (level === "SEVERE") {
    return `In ${locationName}, dangerous conditions exist: torrential rain (${rain24h}mm) has heavily soaked the soil (${saturation}% saturated) near fragile slopes with past landslides. Everyone in this vicinity should be extremely alert and stay away from steep slopes.`;
  }
  if (level === "HIGH") {
    return `In ${locationName}, current conditions show elevated risk: continuous rain (${rain24h}mm) has softened the hillside soil (${saturation}% saturation). Because this area has historical landslide occurrences nearby (${nearestDistance}km away), vigilance is strongly advised.`;
  }
  if (level === "MODERATE") {
    return `In ${locationName}, conditions are at a moderate watch level. Rainfall is active and soil is somewhat damp (${saturation}% saturation). While there is no immediate collapse sign, mountain slopes require caution.`;
  }
  return `In ${locationName}, hillside conditions are currently stable. Low rainfall (${rain24h}mm) and firm soil (${saturation}% saturation) mean normal safety conditions prevail right now.`;
}

module.exports = {
  evaluateLandslideRisk,
  calculateDistanceKm
};
