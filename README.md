# 🏔️ BhumiRakshak (भूमि रक्षक) - Landslide Early Warning & Risk Assessment

A community-friendly, scientifically-grounded Landslide Risk Assessment and Early Warning website engineered to make disaster intelligence easily understandable for everyday citizens, local panchayats, tourists, and disaster managers.

---

## 🌟 Core Features

- **Live Meteorological Tracking (Open-Meteo)**:
  - Real-time 24-hour rainfall (mm) and 72-hour antecedent rainfall accumulation.
  - Multi-depth volumetric soil moisture (0–1cm, 1–3cm, 3–9cm) and soil saturation percentage.
  - Next 24-hour forecast rainfall.
- **ISRO Landslide Atlas of India (1998–2022)**:
  - Mapped inventory of historical landslides and district vulnerability rankings (Rudraprayag, Wayanad, Tehri Garhwal, Shimla, Chamoli, Darjeeling, Idukki, Nilgiris, etc.).
  - Proximity calculation to nearest historical landslide event and cluster density.
- **GSI / NDMA Susceptibility Zonation**:
  - Regional geological hazard zonation (North-Western Himalayas, North-Eastern Himalayas, Western Ghats).
- **Community Ground Signs & Sensor Warning**:
  - Crowdsourced reporting of early physical indicators: widening ground fissures, bulging retaining walls, sudden muddy spring water, leaning trees/poles.
  - Instant factor adjustment in the local risk calculation.
- **Ultra-Simple Citizen-Friendly UI**:
  - Large color-coded risk badge:
    - 🟢 **LOW RISK (Normal)**
    - 🟡 **MODERATE RISK (Watch)**
    - 🟠 **HIGH RISK (Warning)**
    - 🔴 **SEVERE RISK (Danger)**
  - **"In Plain Words"** 1-sentence breakdown without technical jargon.
  - **"What You Should Do Right Now"** actionable safety checklist.
  - **1-Click Location Actions**: GPS "Use My Location", autocomplete search bar, and 1-tap popular hill station chips.
  - **Interactive Leaflet Map**: Click anywhere to evaluate any remote road, village, or slope.
- **Early Warning Alert Subscriptions**:
  - Browser notification permission and automated threshold checking.
  - Test alert simulator to verify notifications.
- **Dual-Mode Database**:
  - Supports Google Cloud Firestore (`firebase-admin`) with automatic fallback to persistent local JSON storage for zero-setup execution.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18+)
- NPM

### 2. Running Locally
```bash
# Navigate to project directory
cd C:\Users\Admin\.gemini\antigravity\scratch\landslide-risk-monitor

# Install dependencies (already installed)
npm install

# Start the server
npm start
```
The website will be live at: **`http://localhost:3000`**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/risk?lat={lat}&lon={lon}&name={name}` | Calculates multi-factor landslide risk, returns weather & historical factors |
| `GET` | `/api/landslides/all` | Returns historical landslide points & high-risk districts for map overlays |
| `GET` | `/api/districts` | Returns list of top-ranked vulnerable districts |
| `GET` | `/api/reports` | Fetches recent community & sensor ground warning signs |
| `POST` | `/api/reports` | Submits a new ground warning sign report |
| `POST` | `/api/subscribe` | Registers an alert subscription for a coordinate zone |
| `POST` | `/api/check-alerts` | Background checker that evaluates risk against active subscription thresholds |
| `GET` | `/health` | Server health and database connection status |

---

## 🛡️ Disclaimers & Ethics

- **Not an Official Evacuation Directive**: This system provides an estimated risk indicator based on open scientific and meteorological data. It does not replace official evacuation orders issued by the National Disaster Management Authority (NDMA), State Disaster Management Authorities (SDMA), or District Magistrates.
- **Emergency Helplines**:
  - **112**: National Emergency Services
  - **1078**: NDMA Disaster Helpline
