const fs = require('fs');
const path = require('path');

// Local fallback database path
const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'local_firestore_db.json');

let firestoreInstance = null;
let isFirestoreAvailable = false;

// Attempt Firebase Firestore initialization if credentials exist
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    firestoreInstance = admin.firestore();
    isFirestoreAvailable = true;
    console.log('[Database] Connected to Google Cloud Firestore.');
  } else {
    console.log('[Database] No Firebase credentials detected. Using persistent local JSON store (Firestore compatible).');
  }
} catch (err) {
  console.warn('[Database] Firebase Admin not loaded or initialized:', err.message);
  console.log('[Database] Operating with local JSON store.');
}

// Initial seed users if database is empty or missing users collection
const DEFAULT_SEED_USERS = [
  {
    id: "usr-resident-01",
    name: "Rajesh Varma",
    email: "resident@bhumirakshak.in",
    password: "password123",
    phone: "+91 98470 12345",
    role: "Resident",
    homeLocation: {
      name: "Meppadi, Wayanad, Kerala",
      lat: 11.5500,
      lon: 76.1300
    },
    emergencyContact: {
      name: "Suresh Varma (Brother)",
      phone: "+91 98470 54321",
      relation: "Family"
    },
    alertPreferences: {
      minSeverity: "HIGH",
      smsAlerts: true,
      browserPush: true
    },
    savedLocations: [
      { id: "loc-1", name: "Meppadi (Home)", lat: 11.5500, lon: 76.1300, addedAt: "2026-09-12T08:00:00.000Z" },
      { id: "loc-2", name: "Chooralmala Tea Estate", lat: 11.5300, lon: 76.1550, addedAt: "2026-09-12T08:30:00.000Z" }
    ],
    createdAt: "2026-09-12T08:00:00.000Z"
  },
  {
    id: "usr-volunteer-02",
    name: "Pooja Sharma",
    email: "volunteer@bhumirakshak.in",
    password: "password123",
    phone: "+91 94180 98765",
    role: "Panchayat Volunteer",
    homeLocation: {
      name: "Summer Hill, Shimla, HP",
      lat: 31.1120,
      lon: 77.1350
    },
    emergencyContact: {
      name: "Shimla SDM Control Room",
      phone: "0177-2803055",
      relation: "Disaster Control"
    },
    alertPreferences: {
      minSeverity: "MODERATE",
      smsAlerts: true,
      browserPush: true
    },
    savedLocations: [
      { id: "loc-3", name: "Summer Hill Sector", lat: 31.1120, lon: 77.1350, addedAt: "2026-09-12T09:00:00.000Z" },
      { id: "loc-4", name: "Totu Railway Crossing", lat: 31.1090, lon: 77.1280, addedAt: "2026-09-12T09:15:00.000Z" }
    ],
    createdAt: "2026-09-12T09:00:00.000Z"
  },
  {
    id: "usr-responder-03",
    name: "Col. Vikram Rawat",
    email: "responder@bhumirakshak.in",
    password: "password123",
    phone: "+91 94120 11223",
    role: "Disaster Response Official",
    homeLocation: {
      name: "Joshimath, Chamoli, Uttarakhand",
      lat: 30.5564,
      lon: 79.5658
    },
    emergencyContact: {
      name: "Chamoli District Emergency Ops (DEOC)",
      phone: "01372-251077",
      relation: "Official Ops Center"
    },
    alertPreferences: {
      minSeverity: "MODERATE",
      smsAlerts: true,
      browserPush: true
    },
    savedLocations: [
      { id: "loc-5", name: "Joshimath Subsidence Zone", lat: 30.5564, lon: 79.5658, addedAt: "2026-09-12T07:00:00.000Z" },
      { id: "loc-6", name: "Lambagarh Ghat Stretch", lat: 30.6402, lon: 79.5183, addedAt: "2026-09-12T07:30:00.000Z" }
    ],
    createdAt: "2026-09-12T07:00:00.000Z"
  }
];

// Initial seed active SOS distress records
const DEFAULT_SEED_SOS = [
  {
    id: "sos-seed-01",
    name: "Sunil Joshi & Family",
    phone: "+91 94120 77889",
    locationName: "Joshimath Lower Terrace, near Ravine",
    lat: 30.5580,
    lon: 79.5630,
    peopleCount: 4,
    urgency: "HIGH_VULNERABLE",
    hazardType: "Slope Cracking & Road Cutoff",
    notes: "New ground fissures through backyard. Road blocked by mud. Elderly mother cannot walk steep uphill slope.",
    status: "PENDING",
    assignedTeam: null,
    nearestShelter: {
      id: "shl-joshimath-01",
      name: "Joshimath Govt Inter College High-Ground Camp",
      distanceKm: 0.9
    },
    timestamp: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: "sos-seed-02",
    name: "Arun Verma (Student Group)",
    phone: "+91 94182 33445",
    locationName: "Summer Hill, Shimla (Lower Hostel)",
    lat: 31.1135,
    lon: 77.1330,
    peopleCount: 2,
    urgency: "CRITICAL_TRAPPED",
    hazardType: "Mud Slurry Inundation",
    notes: "Muddy runoff entering lower ground floor. Retaining wall behind building bulging outward.",
    status: "DISPATCHED",
    assignedTeam: "SDRF Shimla Rapid Unit 2 (En Route - ETA 12m)",
    nearestShelter: {
      id: "shl-shimla-01",
      name: "Shimla Ridge Helipad Safe Assembly Enclosure",
      distanceKm: 4.1
    },
    timestamp: new Date(Date.now() - 40 * 60000).toISOString()
  },
  {
    id: "sos-seed-03",
    name: "Suresh & Tea Estate Harvesters",
    phone: "+91 98471 22334",
    locationName: "Chooralmala Upper Tea Sector, Wayanad",
    lat: 11.5420,
    lon: 76.1410,
    peopleCount: 5,
    urgency: "CRITICAL_TRAPPED",
    hazardType: "Stream Overflow & Culvert Collapse",
    notes: "Culvert bridge washed out. Stranded on elevated tea plateau with 3 children. Safe from water but isolated.",
    status: "PENDING",
    assignedTeam: null,
    nearestShelter: {
      id: "shl-wayanad-01",
      name: "Meppadi St. Joseph Community High-Ground Relief Center",
      distanceKm: 2.3
    },
    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
  }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

// Local JSON helper functions
function readLocalDb() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const initial = { reports: [], subscriptions: [], users: DEFAULT_SEED_USERS, activeSos: DEFAULT_SEED_SOS };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    let modified = false;
    if (!data.users || data.users.length === 0) {
      data.users = DEFAULT_SEED_USERS;
      modified = true;
    }
    if (!data.activeSos || data.activeSos.length === 0) {
      data.activeSos = DEFAULT_SEED_SOS;
      modified = true;
    }
    if (modified) {
      writeLocalDb(data);
    }
    return data;
  } catch (err) {
    console.error('Error reading local db:', err);
    return { reports: [], subscriptions: [], users: DEFAULT_SEED_USERS, activeSos: DEFAULT_SEED_SOS };
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local db:', err);
  }
}

// Unified Database Service (Firestore / Local Fallback)
const db = {
  isFirestore: () => isFirestoreAvailable,

  // -------------------------------------------------------------
  // Reports
  // -------------------------------------------------------------
  async getReports() {
    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const snapshot = await firestoreInstance.collection('landslide_reports')
          .orderBy('timestamp', 'desc')
          .limit(50)
          .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('Firestore getReports failed, falling back to local:', err.message);
      }
    }
    const data = readLocalDb();
    return (data.reports || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async addReport(report) {
    const enriched = {
      ...report,
      id: report.id || `rep-${Date.now()}`,
      timestamp: report.timestamp || new Date().toISOString()
    };

    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const res = await firestoreInstance.collection('landslide_reports').add(enriched);
        return { id: res.id, ...enriched };
      } catch (err) {
        console.warn('Firestore addReport failed, saving locally:', err.message);
      }
    }

    const data = readLocalDb();
    if (!data.reports) data.reports = [];
    data.reports.unshift(enriched);
    writeLocalDb(data);
    return enriched;
  },

  // -------------------------------------------------------------
  // Subscriptions
  // -------------------------------------------------------------
  async getSubscriptions() {
    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const snapshot = await firestoreInstance.collection('alert_subscriptions').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('Firestore getSubscriptions failed, falling back to local:', err.message);
      }
    }
    const data = readLocalDb();
    return data.subscriptions || [];
  },

  async addSubscription(subscription) {
    const record = {
      ...subscription,
      id: subscription.id || `sub-${Date.now()}`,
      subscribedAt: new Date().toISOString()
    };

    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const res = await firestoreInstance.collection('alert_subscriptions').add(record);
        return { id: res.id, ...record };
      } catch (err) {
        console.warn('Firestore addSubscription failed, saving locally:', err.message);
      }
    }

    const data = readLocalDb();
    if (!data.subscriptions) data.subscriptions = [];
    data.subscriptions.push(record);
    writeLocalDb(data);
    return record;
  },

  // -------------------------------------------------------------
  // User Management & Safety Profile Data
  // -------------------------------------------------------------
  async getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const snapshot = await firestoreInstance.collection('users')
          .where('email', '==', cleanEmail)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn('Firestore getUserByEmail failed, checking local:', err.message);
      }
    }

    const data = readLocalDb();
    return (data.users || []).find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id) {
    if (!id) return null;

    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const doc = await firestoreInstance.collection('users').doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn('Firestore getUserById failed, checking local:', err.message);
      }
    }

    const data = readLocalDb();
    return (data.users || []).find(u => u.id === id) || null;
  },

  async createUser(userData) {
    const newUser = {
      id: userData.id || `usr-${Date.now()}`,
      name: userData.name || "Citizen User",
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      phone: userData.phone || "",
      role: userData.role || "Resident",
      homeLocation: userData.homeLocation || { name: "", lat: null, lon: null },
      emergencyContact: userData.emergencyContact || { name: "", phone: "", relation: "" },
      alertPreferences: userData.alertPreferences || { minSeverity: "HIGH", smsAlerts: true, browserPush: true },
      savedLocations: userData.savedLocations || [],
      createdAt: new Date().toISOString()
    };

    if (isFirestoreAvailable && firestoreInstance) {
      try {
        await firestoreInstance.collection('users').doc(newUser.id).set(newUser);
        return newUser;
      } catch (err) {
        console.warn('Firestore createUser failed, writing locally:', err.message);
      }
    }

    const data = readLocalDb();
    if (!data.users) data.users = [];
    data.users.push(newUser);
    writeLocalDb(data);
    return newUser;
  },

  async updateUser(id, updates) {
    if (isFirestoreAvailable && firestoreInstance) {
      try {
        await firestoreInstance.collection('users').doc(id).update(updates);
      } catch (err) {
        console.warn('Firestore updateUser failed:', err.message);
      }
    }

    const data = readLocalDb();
    const idx = (data.users || []).findIndex(u => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates };
      writeLocalDb(data);
      return data.users[idx];
    }
    return null;
  },

  async addSavedLocation(userId, location) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const locItem = {
      id: `loc-${Date.now()}`,
      name: location.name,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      addedAt: new Date().toISOString()
    };

    const savedLocations = user.savedLocations || [];
    // Avoid duplicates
    if (!savedLocations.some(l => Math.abs(l.lat - locItem.lat) < 0.01 && Math.abs(l.lon - locItem.lon) < 0.01)) {
      savedLocations.push(locItem);
      await this.updateUser(userId, { savedLocations });
    }
    return locItem;
  },

  async removeSavedLocation(userId, locationId) {
    const user = await this.getUserById(userId);
    if (!user) return false;

    const savedLocations = (user.savedLocations || []).filter(l => l.id !== locationId);
    await this.updateUser(userId, { savedLocations });
    return true;
  },

  async getAllUsers() {
    const data = readLocalDb();
    // Return sanitized users (without password)
    return (data.users || []).map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
  },

  // -------------------------------------------------------------
  // Safe Shelters & Evacuation Centers
  // -------------------------------------------------------------
  getShelters({ lat, lon, radiusKm } = {}) {
    let shelters = [];
    try {
      const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'safe_shelters.json'), 'utf-8');
      shelters = JSON.parse(raw);
    } catch (e) {
      console.error('Error reading safe_shelters.json:', e.message);
    }

    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      shelters = shelters.map(s => {
        const distanceKm = calculateDistanceKm(lat, lon, s.lat, s.lon);
        return { ...s, distanceKm };
      });
      shelters.sort((a, b) => a.distanceKm - b.distanceKm);

      if (radiusKm && !isNaN(radiusKm)) {
        shelters = shelters.filter(s => s.distanceKm <= radiusKm);
      }
    }
    return shelters;
  },

  // -------------------------------------------------------------
  // Live Citizen SOS Distress Beacons & Location Sharing
  // -------------------------------------------------------------
  async getActiveSos() {
    if (isFirestoreAvailable && firestoreInstance) {
      try {
        const snapshot = await firestoreInstance.collection('active_sos')
          .orderBy('timestamp', 'desc')
          .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('Firestore getActiveSos failed, falling back to local:', err.message);
      }
    }
    const data = readLocalDb();
    return (data.activeSos || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async createSos(sosData) {
    // Find closest shelter automatically if lat/lon provided
    let nearestShelter = null;
    if (sosData.lat && sosData.lon) {
      const allShelters = this.getShelters({ lat: parseFloat(sosData.lat), lon: parseFloat(sosData.lon) });
      if (allShelters.length > 0) {
        nearestShelter = {
          id: allShelters[0].id,
          name: allShelters[0].name,
          distanceKm: allShelters[0].distanceKm,
          phone: allShelters[0].contactPhone
        };
      }
    }

    const record = {
      id: sosData.id || `sos-${Date.now()}`,
      name: sosData.name || 'Anonymous Citizen',
      phone: sosData.phone || '',
      locationName: sosData.locationName || 'Unspecified Slope',
      lat: parseFloat(sosData.lat),
      lon: parseFloat(sosData.lon),
      peopleCount: parseInt(sosData.peopleCount, 10) || 1,
      urgency: sosData.urgency || 'HIGH_VULNERABLE',
      hazardType: sosData.hazardType || 'Slope Instability',
      notes: sosData.notes || '',
      status: sosData.status || 'PENDING',
      assignedTeam: sosData.assignedTeam || null,
      nearestShelter: sosData.nearestShelter || nearestShelter,
      timestamp: new Date().toISOString()
    };

    if (isFirestoreAvailable && firestoreInstance) {
      try {
        await firestoreInstance.collection('active_sos').doc(record.id).set(record);
        return record;
      } catch (err) {
        console.warn('Firestore createSos failed, writing locally:', err.message);
      }
    }

    const data = readLocalDb();
    if (!data.activeSos) data.activeSos = [];
    data.activeSos.unshift(record);
    writeLocalDb(data);
    return record;
  },

  async updateSosStatus(id, updates) {
    if (isFirestoreAvailable && firestoreInstance) {
      try {
        await firestoreInstance.collection('active_sos').doc(id).update(updates);
      } catch (err) {
        console.warn('Firestore updateSosStatus failed:', err.message);
      }
    }

    const data = readLocalDb();
    const idx = (data.activeSos || []).findIndex(s => s.id === id);
    if (idx !== -1) {
      data.activeSos[idx] = { ...data.activeSos[idx], ...updates, updatedAt: new Date().toISOString() };
      writeLocalDb(data);
      return data.activeSos[idx];
    }
    return null;
  },

  async cancelSos(id) {
    if (isFirestoreAvailable && firestoreInstance) {
      try {
        await firestoreInstance.collection('active_sos').doc(id).delete();
      } catch (err) {
        console.warn('Firestore cancelSos failed:', err.message);
      }
    }

    const data = readLocalDb();
    data.activeSos = (data.activeSos || []).filter(s => s.id !== id);
    writeLocalDb(data);
    return true;
  }
};

module.exports = db;
