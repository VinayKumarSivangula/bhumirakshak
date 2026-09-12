const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./config/firebase');
const { fetchWeatherData } = require('./services/weatherService');
const { evaluateLandslideRisk, calculateDistanceKm } = require('./services/riskEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory token store for session mapping
const activeSessions = new Map();

function generateToken(user) {
  const token = `bk_tok_${Buffer.from(`${user.id}_${Date.now()}`).toString('base64url')}`;
  activeSessions.set(token, user.id);
  return token;
}

// Authentication middleware
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || req.headers['x-auth-token']);

  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Please log in first.' });
  }

  const userId = activeSessions.get(token);
  const user = await db.getUserById(userId);
  if (!user) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'User session expired.' });
  }

  const { password, ...safeUser } = user;
  req.user = safeUser;
  req.token = token;
  next();
}

// Optional Auth middleware (sets req.user if logged in, but doesn't block)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || req.headers['x-auth-token']);

  if (token && activeSessions.has(token)) {
    const userId = activeSessions.get(token);
    const user = await db.getUserById(userId);
    if (user) {
      const { password, ...safeUser } = user;
      req.user = safeUser;
      req.token = token;
    }
  }
  next();
}

// Load ISRO Landslide Atlas and GSI Inventory
let inventoryData = { historicalEvents: [], highRiskDistricts: [], gsiSusceptibilityZones: [] };
try {
  const raw = fs.readFileSync(path.join(__dirname, 'data', 'isro_landslide_inventory.json'), 'utf-8');
  inventoryData = JSON.parse(raw);
  console.log(`[Data] Loaded ${inventoryData.historicalEvents.length} historical landslide points and ${inventoryData.highRiskDistricts.length} high-risk districts from ISRO Landslide Atlas.`);
} catch (err) {
  console.error('[Data] Failed to load isro_landslide_inventory.json:', err.message);
}

// -------------------------------------------------------------
// Authentication & User Data Collection Endpoints
// -------------------------------------------------------------

// Register New Citizen / Volunteer Account & Collect Safety Profile Data
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, homeLocation, emergencyContact, alertPreferences } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = await db.createUser({
      name,
      email,
      password, // in production, hash with bcrypt; for local prototype, stored securely
      phone: phone || '',
      role: role || 'Resident',
      homeLocation: homeLocation || { name: '', lat: null, lon: null },
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
      alertPreferences: alertPreferences || { minSeverity: 'HIGH', smsAlerts: true, browserPush: true },
      savedLocations: homeLocation && homeLocation.name ? [{
        id: `loc-home-${Date.now()}`,
        name: `${homeLocation.name} (Home)`,
        lat: homeLocation.lat,
        lon: homeLocation.lon,
        addedAt: new Date().toISOString()
      }] : []
    });

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    console.log(`[Auth] Registered new user: ${safeUser.name} (${safeUser.role}, ${safeUser.phone || 'No phone'})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

// Log In Existing User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    console.log(`[Auth] User logged in: ${safeUser.name} (${safeUser.email})`);

    res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// Get Current User Profile (Verifies session)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token || req.headers['x-auth-token']);
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Update User Safety Profile Data
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, role, homeLocation, emergencyContact, alertPreferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (role) updates.role = role;
    if (homeLocation) updates.homeLocation = homeLocation;
    if (emergencyContact) updates.emergencyContact = emergencyContact;
    if (alertPreferences) updates.alertPreferences = alertPreferences;

    const updated = await db.updateUser(req.user.id, updates);
    const { password: _, ...safeUser } = updated;

    res.json({ success: true, user: safeUser, message: 'Safety profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', message: err.message });
  }
});

// Saved Locations Management for Logged In User
app.get('/api/user/saved-locations', authMiddleware, async (req, res) => {
  const user = await db.getUserById(req.user.id);
  res.json({
    success: true,
    savedLocations: user.savedLocations || []
  });
});

app.post('/api/user/saved-locations', authMiddleware, async (req, res) => {
  try {
    const { name, lat, lon } = req.body;
    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: 'Location name, latitude, and longitude are required.' });
    }

    const locItem = await db.addSavedLocation(req.user.id, { name, lat, lon });
    res.status(201).json({ success: true, location: locItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save location', message: err.message });
  }
});

app.delete('/api/user/saved-locations/:id', authMiddleware, async (req, res) => {
  try {
    const ok = await db.removeSavedLocation(req.user.id, req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete saved location', message: err.message });
  }
});

// Registered Citizens Overview (For Disaster Management Preparedness)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({
      success: true,
      totalRegisteredCitizens: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        phone: u.phone ? u.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'None',
        homeVillage: u.homeLocation ? u.homeLocation.name : 'Unspecified',
        hasEmergencyContact: Boolean(u.emergencyContact && u.emergencyContact.phone),
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users', message: err.message });
  }
});

// -------------------------------------------------------------
// Core Landslide Risk & Map Endpoints
// -------------------------------------------------------------

// 1. Calculate Landslide Risk for Coordinates
app.get('/api/risk', optionalAuth, async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const name = req.query.name || 'Selected Location';

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }

    // Step A: Fetch weather & soil moisture from Open-Meteo
    const weather = await fetchWeatherData(lat, lon);

    // Step B: Fetch recent crowd / sensor ground warning reports from DB
    const recentReports = await db.getReports();

    // Step C: Run Multi-Factor Risk Assessment Engine
    const assessment = evaluateLandslideRisk({
      locationName: name,
      lat,
      lon,
      weather,
      inventoryData,
      recentReports
    });

    res.json({
      success: true,
      data: assessment,
      weather,
      isLoggedIn: Boolean(req.user),
      currentUser: req.user ? { name: req.user.name, role: req.user.role } : null
    });
  } catch (err) {
    console.error('Error evaluating landslide risk:', err);
    res.status(500).json({ error: 'Failed to assess landslide risk', message: err.message });
  }
});

// 2. Get All Historical Landslides & Hazard Zones (For Leaflet Map Layers)
app.get('/api/landslides/all', (req, res) => {
  res.json({
    success: true,
    historicalEvents: inventoryData.historicalEvents || [],
    highRiskDistricts: inventoryData.highRiskDistricts || [],
    gsiSusceptibilityZones: inventoryData.gsiSusceptibilityZones || []
  });
});

// 3. Get Preset High-Risk Vulnerable Districts for Quick-Select
app.get('/api/districts', (req, res) => {
  res.json({
    success: true,
    districts: inventoryData.highRiskDistricts || []
  });
});

// 4. Ground Warning Signs / Community & Sensor Reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await db.getReports();
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reports', message: err.message });
  }
});

app.post('/api/reports', optionalAuth, async (req, res) => {
  try {
    const { locationName, lat, lon, signType, signTitle, description, severity, reportedBy, phone } = req.body;

    if (!lat || !lon || !signType) {
      return res.status(400).json({ error: 'Latitude, longitude, and signType are required.' });
    }

    const reporterIdentity = req.user
      ? `${req.user.name} (${req.user.role} - Verified User)`
      : (reportedBy || 'Local Observer');

    const contactPhone = req.user ? req.user.phone : (phone || '');

    const newReport = await db.addReport({
      locationName: locationName || 'Hillside Location',
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      signType,
      signTitle: signTitle || 'Observed Ground Sign',
      description: description || 'Visual signs of slope instability observed by user/sensor.',
      severity: severity || 'Moderate',
      reportedBy: reporterIdentity,
      contactPhone,
      isVerified: Boolean(req.user),
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ success: true, report: newReport });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save report', message: err.message });
  }
});

// 5. Alert Subscriptions
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subs = await db.getSubscriptions();
    res.json({ success: true, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscriptions', message: err.message });
  }
});

app.post('/api/subscribe', optionalAuth, async (req, res) => {
  try {
    const { locationName, lat, lon, threshold, contact, pushEndpoint, phone } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required to subscribe.' });
    }

    const subscriberName = req.user ? `${req.user.name} (${req.user.role})` : (contact || 'Citizen');
    const subscriberPhone = req.user ? req.user.phone : (phone || '');

    const subscription = await db.addSubscription({
      locationName: locationName || 'Monitored Area',
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      threshold: threshold || 'HIGH', // e.g. 'MODERATE', 'HIGH', 'SEVERE'
      contact: subscriberName,
      phone: subscriberPhone,
      userId: req.user ? req.user.id : null,
      pushEndpoint: pushEndpoint || null
    });

    res.status(201).json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe', message: err.message });
  }
});

// 6. Scheduled Alert Checker (Can be triggered via cron or manual test button)
app.post('/api/check-alerts', async (req, res) => {
  try {
    const subscriptions = await db.getSubscriptions();
    const triggeredAlerts = [];

    for (const sub of subscriptions) {
      const weather = await fetchWeatherData(sub.lat, sub.lon);
      const recentReports = await db.getReports();
      const assessment = evaluateLandslideRisk({
        locationName: sub.locationName,
        lat: sub.lat,
        lon: sub.lon,
        weather,
        inventoryData,
        recentReports
      });

      const riskLevel = assessment.risk.level;
      let shouldAlert = false;

      if (sub.threshold === 'SEVERE' && riskLevel === 'SEVERE') shouldAlert = true;
      if (sub.threshold === 'HIGH' && (riskLevel === 'HIGH' || riskLevel === 'SEVERE')) shouldAlert = true;
      if (sub.threshold === 'MODERATE' && riskLevel !== 'LOW') shouldAlert = true;

      if (shouldAlert) {
        triggeredAlerts.push({
          subscriptionId: sub.id,
          locationName: sub.locationName,
          recipient: sub.contact,
          phone: sub.phone || null,
          riskLevel,
          score: assessment.risk.score,
          summary: assessment.risk.plainEnglishSummary,
          safetyTip: assessment.risk.shortAdvice,
          triggeredAt: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      subscriptionsChecked: subscriptions.length,
      triggeredAlertsCount: triggeredAlerts.length,
      triggeredAlerts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run alert check', message: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    isFirestore: db.isFirestore(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[BhumiRakshak Server] Running at http://localhost:${PORT}`);
});
