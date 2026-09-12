/**
 * BhumiRakshak Multi-Language Localization System
 * Covers 10 Northern Indian Languages & Himalayan Mountain Dialects
 */

const translations = {
  // 1. English
  en: {
    navEmergency: "🚨 Official Helplines: 112 (National Emergency) | 1078 (NDMA Disaster Helpline)",
    brandTitle: "BhumiRakshak",
    brandSubtitle: "Himalayan Landslide Early Warning System",
    navHome: "Assessment",
    navMap: "Interactive Map",
    navGuide: "Visual Field Guide",
    navReports: "Community Signs",
    navAlerts: "Alert Center",
    navAbout: "Data Sources",
    navSignIn: "Sign In",
    navMyProfile: "Safety Profile",
    navSavedLocs: "Saved Locations",
    navSignOut: "Sign Out",

    heroTitle: "Himalayan Landslide Early Warning & Terrain Risk",
    heroDesc: "Fusing live Open-Meteo rainfall and soil saturation with ISRO's Landslide Atlas of India (80,000 historical events) and GSI terrain susceptibility.",
    searchPlaceholder: "Search Himalayan town, village, or route (e.g. Wayanad, Joshimath, Shimla, Darjeeling...)",
    btnCheckRisk: "Check Risk",
    btnUseGps: "Use My Location",
    popularLabel: "Vulnerable Hill Centers:",

    riskTitle: "Current Estimated Risk",
    riskScoreLabel: "Risk Index",
    riskLow: "Low Risk (Safe)",
    riskMod: "Moderate Risk (Watch)",
    riskHigh: "High Risk (Warning)",
    riskSevere: "Severe Risk (Danger)",
    plainWordsTitle: "In Everyday Words",
    factorsTitle: "Key Physical Factors:",
    actionTitle: "🛡️ What You Should Do Right Now:",
    btnSaveLoc: "⭐ Save to My Monitored",

    pillarRain: "Rainfall Impact",
    pillarRainSub: "Past 24 Hours",
    pillarSoil: "Soil Saturation",
    pillarSoilSub: "Estimated Pore Saturation",
    pillarHistory: "Historical Evidence",
    pillarHistorySub: "Nearest ISRO Mapped Slide",
    pillarSigns: "Field Warning Signs",
    pillarSignsSub: "Nearby Ground Signs",

    viewOnMapBtn: "Explore on Full Map →",
    reportSignBtn: "📢 Report Ground Sign",
    getAlertsBtn: "🔔 Get Alerts for My Area",
    
    disclaimerTitle: "Data Citations & Advisory Disclaimer",
    disclaimerText: "This website provides estimated risk indicators by combining Open-Meteo live weather data, ISRO Landslide Atlas historical records, and GSI macro-zonation. It is not an official government evacuation order. For evacuations, follow official notices from NDMA and local district authorities."
  },

  // 2. हिन्दी (Hindi)
  hi: {
    navEmergency: "🚨 आपातकालीन हेल्पलाइन: 112 (राष्ट्रीय आपातकाल) | 1078 (एनडीएमए आपदा हेल्पलाइन)",
    brandTitle: "भूमि रक्षक",
    brandSubtitle: "हिमालयी भूस्खलन पूर्व चेतावनी प्रणाली",
    navHome: "जोखिम आकलन",
    navMap: "नक्शा एक्सप्लोरर",
    navGuide: "फोटो गाइड व लक्षण",
    navReports: "क्षेत्रीय रिपोर्ट",
    navAlerts: "अलर्ट केंद्र",
    navAbout: "डेटा स्रोत",
    navSignIn: "लॉग इन / रजिस्टर",
    navMyProfile: "सुरक्षा प्रोफाइल",
    navSavedLocs: "सहेजे गए स्थान",
    navSignOut: "लॉग आउट",

    heroTitle: "हिमालयी भूस्खलन पूर्व चेतावनी एवं ढलान जोखिम आकलन",
    heroDesc: "ओपन-मेटियो की लाइव वर्षा व मिट्टी नमी, इसरो (ISRO) लैंडस्लाइड एटलस के 80,000 ऐतिहासिक घटनाओं और भारतीय भूवैज्ञानिक सर्वेक्षण (GSI) के आंकड़ों का संयोजन।",
    searchPlaceholder: "शहर, गांव या पहाड़ी मार्ग खोजें (जैसे: जोशीमठ, शिमला, दार्जिलिंग, वायनाड...)",
    btnCheckRisk: "जोखिम जांचें",
    btnUseGps: "मेरा वर्तमान स्थान",
    popularLabel: "संवेदनशील पहाड़ी क्षेत्र:",

    riskTitle: "वर्तमान अनुमानित जोखिम",
    riskScoreLabel: "जोखिम स्कोर",
    riskLow: "कम जोखिम (सुरक्षित)",
    riskMod: "मध्यम जोखिम (सतर्क रहें)",
    riskHigh: "उच्च जोखिम (चेतावनी)",
    riskSevere: "गंभीर जोखिम (खतरा)",
    plainWordsTitle: "सरल शब्दों में स्थिति",
    factorsTitle: "प्रमुख जमीनी कारक:",
    actionTitle: "🛡️ आपको अभी क्या कदम उठाने चाहिए:",
    btnSaveLoc: "⭐ इस स्थान को सहेजें",

    pillarRain: "वर्षा का प्रभाव",
    pillarRainSub: "पिछले 24 घंटे में",
    pillarSoil: "मिट्टी का गीलापन (नमी)",
    pillarSoilSub: "अनुमानित जल संतृप्ति",
    pillarHistory: "ऐतिहासिक घटनाएं",
    pillarHistorySub: "निकटतम इसरो दर्ज भूस्खलन",
    pillarSigns: "जमीनी खतरे के संकेत",
    pillarSignsSub: "पास में दर्ज लक्षण",

    viewOnMapBtn: "पूरे नक्शे पर देखें →",
    reportSignBtn: "📢 खतरे का संकेत दर्ज करें",
    getAlertsBtn: "🔔 मेरे क्षेत्र के अलर्ट चालू करें",

    disclaimerTitle: "डेटा स्रोत एवं आधिकारिक दिशानिर्देश",
    disclaimerText: "यह वेबसाइट ओपन-मेटियो मौसम डेटा, इसरो लैंडस्लाइड एटलस और जीएसआई संवेदनशीलता के आधार पर अनुमानित जोखिम दर्शाती है। यह कोई आधिकारिक निकासी आदेश नहीं है। आधिकारिक निर्देशों के लिए हमेशा एनडीएमए (NDMA) व स्थानीय प्रशासन का पालन करें।"
  },

  // 3. ਪੰਜਾਬੀ (Punjabi)
  pa: {
    navEmergency: "🚨 ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ: 112 (ਰਾਸ਼ਟਰੀ ਐਮਰਜੈਂਸੀ) | 1078 (NDMA ਆਫ਼ਤ ਹੈਲਪਲਾਈਨ)",
    brandTitle: "ਭੂਮੀ ਰੱਖਿਅਕ",
    brandSubtitle: "ਹਿਮਾਲੀਅਨ ਜ਼ਮੀਨ ਖਿਸਕਣ ਚੇਤਾਵਨੀ ਪ੍ਰਣਾਲੀ",
    navHome: "ਜੋਖਮ ਮੁਲਾਂਕਣ",
    navMap: "ਨਕਸ਼ਾ",
    navGuide: "ਫੋਟੋ ਗਾਈਡ",
    navReports: "ਲੋਕਲ ਰਿਪੋਰਟਾਂ",
    navAlerts: "ਅਲਰਟ ਸੈਂਟਰ",
    navAbout: "ਡਾਟਾ ਸਰੋਤ",
    navSignIn: "ਸਾਈਨ ਇਨ",
    navMyProfile: "ਪ੍ਰੋਫਾਈਲ",
    navSavedLocs: "ਸੰਭਾਲੇ ਸਥਾਨ",
    navSignOut: "ਲਾਗ ਆਊਟ",

    heroTitle: "ਪਹਾੜੀ ਜ਼ਮੀਨ ਖਿਸਕਣ ਦੀ ਅਗੇਤੀ ਚੇਤਾਵਨੀ ਅਤੇ ਜੋਖਮ ਜਾਂਚ",
    heroDesc: "Open-Meteo ਮੀਂਹ ਦੇ ਅੰਕੜੇ, ਇਸਰੋ (ISRO) ਲੈਂਡਸਲਾਈਡ ਐਟਲਸ ਅਤੇ GSI ਡਾਟਾ ਦਾ ਸਾਂਝਾ ਵਿਸ਼ਲੇਸ਼ਣ।",
    searchPlaceholder: "ਕੋਈ ਸ਼ਹਿਰ, ਪਿੰਡ ਜਾਂ ਰਸਤਾ ਲੱਭੋ (ਜਿਵੇਂ: ਸ਼ਿਮਲਾ, ਚਮੋਲੀ, ਕੁੱਲੂ...)",
    btnCheckRisk: "ਜੋਖਮ ਦੇਖੋ",
    btnUseGps: "ਮੇਰੀ ਲੋਕੇਸ਼ਨ",
    popularLabel: "ਖ਼ਤਰੇ ਵਾਲੇ ਪਹਾੜੀ ਇਲਾਕੇ:",

    riskTitle: "ਮੌਜੂਦਾ ਅੰਦਾਜ਼ਨ ਜੋਖਮ",
    riskScoreLabel: "ਜੋਖਮ ਸਕੋਰ",
    riskLow: "ਘੱਟ ਖ਼ਤਰਾ (ਸੁਰੱਖਿਅਤ)",
    riskMod: "ਦਰਮਿਆਨਾ ਖ਼ਤਰਾ (ਧਿਆਨ ਰੱਖੋ)",
    riskHigh: "ਵੱਡਾ ਖ਼ਤਰਾ (ਚੇਤਾਵਨੀ)",
    riskSevere: "ਬਹੁਤ ਗੰਭੀਰ (ਖ਼ਤਰਾ)",
    plainWordsTitle: "ਸੌਖੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਹਾਲਤ",
    factorsTitle: "ਮੁੱਖ ਜ਼ਮੀਨੀ ਕਾਰਨ:",
    actionTitle: "🛡️ ਤੁਹਾਨੂੰ ਇਸ ਵੇਲੇ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ:",
    btnSaveLoc: "⭐ ਇਹ ਸਥਾਨ ਸੰਭਾਲੋ",

    pillarRain: "ਮੀਂਹ ਦਾ ਅਸਰ",
    pillarRainSub: "ਪਿਛਲੇ 24 ਘੰਟੇ",
    pillarSoil: "ਮਿੱਟੀ ਦੀ ਗਿੱਲ",
    pillarSoilSub: "ਨਮੀ ਦੀ ਮਾਤਰਾ",
    pillarHistory: "ਪਿਛਲੀਆਂ ਘਟਨਾਵਾਂ",
    pillarHistorySub: "ਨੇੜਲਾ ਇਸਰੋ ਰਿਕਾਰਡ",
    pillarSigns: "ਜ਼ਮੀਨੀ ਚੇਤਾਵਨੀ ਨਿਸ਼ਾਨ",
    pillarSignsSub: "ਨੇੜਲੇ ਨਿਰੀਖਣ",

    viewOnMapBtn: "ਪੂਰੇ ਨਕਸ਼ੇ 'ਤੇ ਵੇਖੋ →",
    reportSignBtn: "📢 ਤ੍ਰੇੜਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ",
    getAlertsBtn: "🔔 ਅਲਰਟ ਪ੍ਰਾਪਤ ਕਰੋ",

    disclaimerTitle: "ਸਰੋਤ ਅਤੇ ਸੁਰੱਖਿਆ ਸਲਾਹ",
    disclaimerText: "ਇਹ ਵੈਬਸਾਈਟ ਅੰਦਾਜ਼ਨ ਜੋਖਮ ਦੱਸਦੀ ਹੈ। ਇਹ ਕੋਈ ਸਰਕਾਰੀ ਖਾਲੀ ਕਰਨ ਦਾ ਹੁਕਮ ਨਹੀਂ ਹੈ। ਸਰਕਾਰੀ ਹਦਾਇਤਾਂ ਲਈ ਜ਼ਿਲ੍ਹਾ ਪ੍ਰਸ਼ਾਸਨ ਅਤੇ NDMA ਦੀ ਪਾਲਣਾ ਕਰੋ।"
  },

  // 4. डोगरी (Dogri - Jammu & Kashmir Hills)
  doi: {
    navEmergency: "🚨 आपातकालीन हेल्पलाइन: 112 (राष्ट्रीय आपातकाल) | 1078 (एनडीएमए हेल्पलाइन)",
    brandTitle: "भूमि रक्खक",
    brandSubtitle: "पहाड़ी त्रेहड़-खिसकने दी पैहली चेतावनी",
    navHome: "जोखमे दा पता",
    navMap: "नक्शा",
    navGuide: "फोटो गाइड ते लक्छण",
    navReports: "जमीनी खबरां",
    navAlerts: "चेतावनी केंद्र",
    navAbout: "डेटा स्रोत",
    navSignIn: "लॉग इन",
    navMyProfile: "सुरक्खा प्रोफाइल",
    navSavedLocs: "सांबे गे दे थां",
    navSignOut: "लॉग आउट",

    heroTitle: "पहाड़ खिसकने दी पैहली चेतावनी ते ढलान दा जोखिम",
    heroDesc: "मौसम विभाग दी बरसाती ते मिट्टी गीली होन दी जानकारी कन्नै इसरो दे पुराने रिकार्ड दा हिसाब-किताब।",
    searchPlaceholder: "पिंड, शहर या सड़क खोजो (जिंयां: डोडा, राजौरी, रामबन, रियासी...)",
    btnCheckRisk: "जोखिम दस्सो",
    btnUseGps: "मेरी मौजूदा थां",
    popularLabel: "जम्मू-कश्मीर दे संवेदनशील इलाके:",

    riskTitle: "इस बेले दा अनुमानित जोखिम",
    riskScoreLabel: "खतरे दा अंक",
    riskLow: "घट्ट खतरा (सुरक्खत)",
    riskMod: "मध्यम खतरा (होशियार रओ)",
    riskHigh: "बड्डा खतरा (चेतावनी)",
    riskSevere: "बड़ा भारी खतरा",
    plainWordsTitle: "सीधे ते सादे लब्ज़ें च",
    factorsTitle: "खास जमीनी बज्हा:",
    actionTitle: "🛡️ इस बेले तुसेंगी केह् करना चाहिदा:",
    btnSaveLoc: "⭐ इस थां गी सांबो",

    pillarRain: "मींह दा असर",
    pillarRainSub: "पिछले 24 घैंटे च",
    pillarSoil: "मिट्टी च नमी",
    pillarSoilSub: "गीलापन प्रतिशत",
    pillarHistory: "पुराने रिकार्ड",
    pillarHistorySub: "नेड़ला खिसकन रिकार्ड",
    pillarSigns: "जमीनी लक्छण",
    pillarSignsSub: "दिखे गे दे संकेत",

    viewOnMapBtn: "नक्शे पर तफ्सील दिखो →",
    reportSignBtn: "📢 त्रेड़ें दी रिपोर्ट करो",
    getAlertsBtn: "🔔 अपने इलाके लेई घंटी लाओ",

    disclaimerTitle: "सरकारी सलाह ते डेटा",
    disclaimerText: "एह प्रणाली सिर्फ मौसमी आंकड़े ते अंदाजे पर आधारित ऐ। सरकारी हुक्म लेई हमेशा एनडीएमए ते डिप्टी कमिश्नर दे दफ़्तर दा ध्यान रक्खो।"
  },

  // 5. गढ़वळि (Garhwali - Uttarakhand: Chamoli, Rudraprayag, Tehri, Pauri)
  gbm: {
    navEmergency: "🚨 आपदा हेल्पलाइन: 112 (राष्ट्रीय आपातकाल) | 1078 (आपदा प्रबंधन हेल्पलाइन)",
    brandTitle: "भूमि रक्षक",
    brandSubtitle: "उत्तराखंड पहाड़ खिसकण पैली सूचना प्रणाली",
    navHome: "खतरा जांच",
    navMap: "नक्शा",
    navGuide: "फोटो गाइड व लक्षण",
    navReports: "गाँव की सूचना",
    navAlerts: "अलर्ट सेंटर",
    navAbout: "डेटा स्रोत",
    navSignIn: "लॉग इन",
    navMyProfile: "सुरक्षा प्रोफाइल",
    navSavedLocs: "सहेजे स्थान",
    navSignOut: "लॉग आउट",

    heroTitle: "गढ़वाल हिमालय भूस्खलन पैली चेतावनी व ढाळ खतरा जांच",
    heroDesc: "ओपन-मेटियो बगत की बर्खा, इसरो लैंडस्लाइड एटलस का 80,000 पुरणा रिकार्ड अर जीएसआई की पहाड़ जांच पर आधारित।",
    searchPlaceholder: "अपणो गाँव, चट्टी या सड़क खोजा (जगा: जोशीमठ, गोपेश्वर, कर्णप्रयाग, रुद्रप्रयाग...)",
    btnCheckRisk: "खतरा जांचा",
    btnUseGps: "हमरो गाँव / स्थान",
    popularLabel: "गढ़वाल का मुख्य संवेदनशील इलाका:",

    riskTitle: "अभी को अनुमानित ढाळ खतरा",
    riskScoreLabel: "खतरा स्कोर",
    riskLow: "कम खतरा (ढलान स्थिर)",
    riskMod: "मध्यम खतरा (होशियार रवां)",
    riskHigh: "भारी खतरा (चेतावनी)",
    riskSevere: "अति गंभीर खतरा (तुरंत बचाओ)",
    plainWordsTitle: "सीधी पहाड़ी बोली मा",
    factorsTitle: "जमीनी कारण:",
    actionTitle: "🛡️ अभी सब लोगूं तैं क्या करण चइये:",
    btnSaveLoc: "⭐ अपणा गाँव सहेजा",

    pillarRain: "बर्खा को असर",
    pillarRainSub: "पिछला 24 घंटा मा",
    pillarSoil: "माटी को गीलापण",
    pillarSoilSub: "अंदर की नमी",
    pillarHistory: "पुरणा भूस्खलन",
    pillarHistorySub: "नजीक को पुरणो खिसकाव",
    pillarSigns: "जमीनी दरार लक्षण",
    pillarSignsSub: "गाँव मा दिखी दरार",

    viewOnMapBtn: "पूरा नक्शा मा देखा →",
    reportSignBtn: "📢 जमीन मा दरार की सूचना द्या",
    getAlertsBtn: "🔔 गाँव खातिर अलर्ट लगावा",

    disclaimerTitle: "सरकारी सूचना अर दिशानिर्देश",
    disclaimerText: "यो अनुमानित खतरा छ। सरकारी खाली करण आदेश खातिर हमेशा एसडीएम, डीएम अर एनडीएमए (NDMA) का आदेश मान्या।"
  },

  // 6. कुमाऊँनी (Kumaoni - Uttarakhand: Nainital, Almora, Pithoragarh, Bageshwar)
  kfy: {
    navEmergency: "🚨 आपातकालीन नंबर: 112 (राष्ट्रीय आपातकाल) | 1078 (एनडीएमए आपदा हेल्पलाइन)",
    brandTitle: "भूमि रक्षक",
    brandSubtitle: "कुमाऊं पहाड़ खिसकन पैली सूचना",
    navHome: "खतरा जांच",
    navMap: "नक्शा",
    navGuide: "फोटो गाइड",
    navReports: "इलाकाई रिपोर्ट",
    navAlerts: "अलर्ट सेवा",
    navAbout: "डेटा स्रोत",
    navSignIn: "लॉग इन",
    navMyProfile: "सुरक्षा प्रोफाइल",
    navSavedLocs: "सहेजे जां",
    navSignOut: "लॉग आउट",

    heroTitle: "कुमाऊं पहाड़ी भूस्खलन पूर्व चेतावनी और ढाळ जांच",
    heroDesc: "मौसम की ताज़ा बारिश, इसरो लैंडस्लाइड एटलस का ऐतिहासिक आंकड़ और मिट्टी की नमी का सटीक मेल।",
    searchPlaceholder: "अपण शहर, गाँव या डाना खोजो (जस: नैनीताल, अल्मोड़ा, पिथौरागढ़, मुनस्यारी...)",
    btnCheckRisk: "जोखिम देखो",
    btnUseGps: "म्हारो स्थान",
    popularLabel: "कुमाऊं का संवेदनशील क्षेत्र:",

    riskTitle: "ऐल को अनुमानित खतरा",
    riskScoreLabel: "खतरा स्कोर",
    riskLow: "कम खतरा (शांति)",
    riskMod: "मध्यम खतरा (सतर्क रहो)",
    riskHigh: "भारी खतरा (सावधान)",
    riskSevere: "गंभीर खतरा (भागो/सुरक्षित रहो)",
    plainWordsTitle: "सरल पहाड़ी बोली में",
    factorsTitle: "मुख्य जमीनी बात:",
    actionTitle: "🛡️ सबुकैं ऐल के करनो चाई:",
    btnSaveLoc: "⭐ यो स्थान सहेजो",

    pillarRain: "बरसात को जोर",
    pillarRainSub: "पिछल 24 घंटा में",
    pillarSoil: "माटी की नमी",
    pillarSoilSub: "गीलापन की जांच",
    pillarHistory: "पुरण भूस्खलन",
    pillarHistorySub: "नजीक को इसरो आंकड़",
    pillarSigns: "जमीनी दरार",
    pillarSignsSub: "स्थानीय लक्षण",

    viewOnMapBtn: "नक्शा में देखो →",
    reportSignBtn: "📢 दरार या गाड़ की सूचना द्या",
    getAlertsBtn: "🔔 अलर्ट चालू करो",

    disclaimerTitle: "डेटा स्रोत और सलाह",
    disclaimerText: "यो अनुमानित संकेत छू। सरकारी बचाव और राहत आदेश खातिर हमेशा जिला प्रशासन और एनडीएमए (NDMA) का निर्देश मानो।"
  },

  // 7. पहाड़ी / कांगड़ी (Himachali / Pahari - Shimla, Mandi, Kullu, Kangra)
  him: {
    navEmergency: "🚨 आपदा हेल्पलाइन: 112 (आपातकाल) | 1078 (आपदा प्रबंधन)",
    brandTitle: "भूमि रक्षक",
    brandSubtitle: "हिमाचल पहाड़ दरड़कने दी अगेती चेतावनी",
    navHome: "जोखिम जांच",
    navMap: "नक्शा",
    navGuide: "फोटो गाइड",
    navReports: "जमीनी रिपोर्टां",
    navAlerts: "अलर्ट सेंटर",
    navAbout: "डेटा स्रोत",
    navSignIn: "लॉग इन",
    navMyProfile: "सुरक्षा प्रोफाइल",
    navSavedLocs: "रखे स्थान",
    navSignOut: "लॉग आउट",

    heroTitle: "हिमाचल पहाड़ दरड़कने दी अगेती चेतावनी ते ढाळ खतरा",
    heroDesc: "ओपन-मेटियो दी लाइव बारिश, इसरो लैंडस्लाइड एटलस दे पुराने रिकार्ड ते जीएसआई दे पहाड़ी आंकड़े।",
    searchPlaceholder: "अपणा पिंड, शहर या सड़क टोहवा (जिद्दान: शिमला, मंडी, कुल्लू, मनाली, डलहौज़ी...)",
    btnCheckRisk: "खतरा दस्सा",
    btnUseGps: "असां दी मौजूदा जगह",
    popularLabel: "हिमाचल दे खतरे आले पहाड़ी क्षेत्र:",

    riskTitle: "इस वेले दा अंदाज़न खतरा",
    riskScoreLabel: "खतरे दा स्कोर",
    riskLow: "घट्ट खतरा (सुआह)",
    riskMod: "मझला खतरा (चौकन्ने रओ)",
    riskHigh: "वड़ा खतरा (चेतावनी)",
    riskSevere: "भारी खतरा (सुरक्षित जगह चलो)",
    plainWordsTitle: "पहाड़ी भाषा च गल्ल",
    factorsTitle: "खास जमीनी गल्लां:",
    actionTitle: "🛡️ इस वेले तुसां जो केह करना चाहिदा:",
    btnSaveLoc: "⭐ इस जगह जो साम्भो",

    pillarRain: "झड़ी दा असर",
    pillarRainSub: "पिछले 24 घेंटे",
    pillarSoil: "मिट्टी दा गिल्लापन",
    pillarSoilSub: "नमी दी मात्रा",
    pillarHistory: "पुराने दरड़ाक",
    pillarHistorySub: "नेड़े दा इसरो रिकार्ड",
    pillarSigns: "जमीनी दरार लक्षण",
    pillarSignsSub: "पिंडे च दिखे लक्षण",

    viewOnMapBtn: "पूरे नक्शे पर दिखा →",
    reportSignBtn: "📢 त्रेड़ दिखे तां दस्सो",
    getAlertsBtn: "🔔 इलाके लेई अलर्ट लवा",

    disclaimerTitle: "सरकारी सूचना ते सलाह",
    disclaimerText: "एह वैज्ञानिक आंकड़े दे आधार पर अंदाज़न खतरा ऐ। किसी भी खाली करने दे हुक्म लेई हमेशा जिला प्रशासन ते NDMA दियां हिदायतां मन्नो।"
  },

  // 8. नेपाली (Nepali - Sikkim, Darjeeling, Kalimpong, Border Hills)
  ne: {
    navEmergency: "🚨 आपतकालीन हेल्पलाइन: 112 (राष्ट्रिय आपतकाल) | 1078 (NDMA विपद् हेल्पलाइन)",
    brandTitle: "भूमि रक्षक",
    brandSubtitle: "हिमाली पहिरो पूर्व चेतावनी प्रणाली",
    navHome: "जोखिम मूल्याङ्कन",
    navMap: "नक्शा",
    navGuide: "फोटो गाइड र लक्षण",
    navReports: "स्थानीय प्रतिवेदन",
    navAlerts: "चेतावनी केन्द्र",
    navAbout: "डाटा स्रोत",
    navSignIn: "साइन इन",
    navMyProfile: "सुरक्षा प्रोफाइल",
    navSavedLocs: "सुरक्षित स्थानहरू",
    navSignOut: "लग आउट",

    heroTitle: "हिमाली पहिरो पूर्व चेतावनी तथा भिरालो जमिनको जोखिम",
    heroDesc: "Open-Meteo वर्षाको वास्तविक तथ्याङ्क, इसरो (ISRO) पहिरो एटलसको ८०,००० पुराना रेकर्ड र GSI भूवैज्ञानिक डाटाको संयोजन।",
    searchPlaceholder: "सहर, गाउँ वा बाटो खोज्नुहोस् (जस्तै: गान्तोक, दार्जिलिङ, कालिम्पोङ, नाम्ची...)",
    btnCheckRisk: "जोखिम जाँच",
    btnUseGps: "मेरो वर्तमान स्थान",
    popularLabel: "जोखिमयुक्त हिमाली क्षेत्रहरू:",

    riskTitle: "हालको अनुमानित पहिरो जोखिम",
    riskScoreLabel: "जोखिम अङ्क",
    riskLow: "न्यून जोखिम (सुरक्षित)",
    riskMod: "मध्यम जोखिम (सजग रहनुहोस्)",
    riskHigh: "उच्च जोखिम (सतर्कता सूचना)",
    riskSevere: "अति गम्भीर जोखिम (खतरा)",
    plainWordsTitle: "सरल भाषामा अवस्था",
    factorsTitle: "प्रमुख जमीनी कारकहरू:",
    actionTitle: "🛡️ तपाईंले तुरुन्तै गर्नुपर्ने सुरक्षार्थ कार्यहरू:",
    btnSaveLoc: "⭐ यो स्थान सुरक्षित गर्नुहोस्",

    pillarRain: "वर्षाको प्रभाव",
    pillarRainSub: "विगत २४ घण्टामा",
    pillarSoil: "माटोको ओसिलोपन",
    pillarSoilSub: "अनुमानित जल सन्तृप्ति",
    pillarHistory: "ऐतिहासिक पहिरो",
    pillarHistorySub: "नजिकैको इसरो अभिलेख",
    pillarSigns: "जमीनी पूर्व चेतावनी",
    pillarSignsSub: "देखीएका दरारहरू",

    viewOnMapBtn: "पूर्ण नक्सामा हेर्नुहोस् →",
    reportSignBtn: "📢 पहिरोको लक्षण रिपोर्ट गर्नुहोस्",
    getAlertsBtn: "🔔 मेरो क्षेत्रको सूचना सुरु गर्नुहोस्",

    disclaimerTitle: "डाटा स्रोत र आधिकारिक सुझाव",
    disclaimerText: "यो वेबसाइटले मौसम र पुराना तथ्याङ्कको आधारमा अनुमानित जोखिम प्रस्तुत गर्दछ। सरकारी उद्धार तथा स्थानान्तरणका लागि सधैं NDMA र स्थानीय प्रशासनको निर्देशन पालना गर्नुहोस्।"
  },

  // 9. اردو (Urdu - J&K, Northern India)
  ur: {
    navEmergency: "🚨 ایمرجنسی ہیلپ لائن: 112 (قومی ایمرجنسی) | 1078 (این ڈی ایم اے ہیلپ لائن)",
    brandTitle: "بھومی رکشک",
    brandSubtitle: "ہمالیائی لینڈ سلائیڈنگ قبل از وقت وارننگ سسٹم",
    navHome: "خطرہ جانچیں",
    navMap: "نقشہ",
    navGuide: "فوٹو گائیڈ",
    navReports: "مقامی رپورٹس",
    navAlerts: "انتباہ مرکز",
    navAbout: "معلومات کا ذریعہ",
    navSignIn: "لاگ ان",
    navMyProfile: "حفاظتی پروفائل",
    navSavedLocs: "محفوظ مقامات",
    navSignOut: "لاگ آؤٹ",

    heroTitle: "ہمالیائی پہاڑی تودے گرنے کی قبل از وقت اطلاع اور خطرے کا اندازہ",
    heroDesc: "لائیو بارش، مٹی کی نمی، اسرو کے 80,000 تاریخی ریکارڈز اور جیولوجیکل سروے آف انڈیا کے ڈیٹا کا مجموعہ۔",
    searchPlaceholder: "شہر، گاؤں یا سڑک تلاش کریں (مثلاً: پونچھ، راجوری، اننت ناگ، بارہمولہ...)",
    btnCheckRisk: "خطرہ چیک کریں",
    btnUseGps: "موجودہ مقام",
    popularLabel: "حساس پہاڑی علاقے:",

    riskTitle: "موجودہ متوقع خطرہ",
    riskScoreLabel: "خطرے کا اسکور",
    riskLow: "کم خطرہ (محفوظ)",
    riskMod: "معتدل خطرہ (ہوشیار رہیں)",
    riskHigh: "زیادہ خطرہ (وارننگ)",
    riskSevere: "انتہائی شدید خطرہ",
    plainWordsTitle: "آسان الفاظ میں صورتحال",
    factorsTitle: "اہم زمینی وجوہات:",
    actionTitle: "🛡️ فوری حفاظتی اقدامات:",
    btnSaveLoc: "⭐ اس مقام کو محفوظ کریں",

    pillarRain: "بارش کا اثر",
    pillarRainSub: "گزشتہ 24 گھنٹے میں",
    pillarSoil: "مٹی میں نمی کا تناسب",
    pillarSoilSub: "پانی کا دباؤ",
    pillarHistory: "پرانے لینڈ سلائیڈز",
    pillarHistorySub: "قریبی اسرو ریکارڈ",
    pillarSigns: "زمینی دراڑیں اور علامات",
    pillarSignsSub: "دیکھی گئی نشانیاں",

    viewOnMapBtn: "مکمل نقشے پر دیکھیں ←",
    reportSignBtn: "📢 زمینی دراڑ کی اطلاع دیں",
    getAlertsBtn: "🔔 انتباہات فعال کریں",

    disclaimerTitle: "سرکاری ہدایات اور ذرائع",
    disclaimerText: "یہ نظام موسمیاتی تغیرات پر مبنی متوقع خطرہ دکھاتا ہے۔ انخلائی احکامات کے لیے ہمیشہ متعلقہ ضلعی انتظامیہ اور NDMA کے اعلانات کی پیروی کریں۔"
  },

  // 10. বাংলা (Bengali - Darjeeling, Kalimpong, North Bengal Hills)
  bn: {
    navEmergency: "🚨 জরুরী হেল্পলাইন: 112 (জাতীয় জরুরী সেবা) | 1078 (NDMA বিপর্যয় হেল্পলাইন)",
    brandTitle: "ভূমি রক্ষক",
    brandSubtitle: "হিমালয় ভূমিধস প্রাক-সতর্কবার্তা ব্যবস্থা",
    navHome: "ঝুঁকি পরিমাপ",
    navMap: "মানচিত্র",
    navGuide: "ছবি ও নির্দেশিকা",
    navReports: "জনগণের রিপোর্ট",
    navAlerts: "সতর্কতা কেন্দ্র",
    navAbout: "উৎসসমূহ",
    navSignIn: "লগ ইন",
    navMyProfile: "সুরক্ষা প্রোফাইল",
    navSavedLocs: "সংরক্ষিত স্থান",
    navSignOut: "লগ আউট",

    heroTitle: "হিমালয় পর্বত অঞ্চলে ভূমিধসের প্রাক-সতর্কতা ও ঢাল ঝুঁকি বিশ্লেষণ",
    heroDesc: "Open-Meteo থেকে লাইভ বৃষ্টিপাত ও মাটির আর্দ্রতা, ইসরোর (ISRO) ৮০,০০০ ঐতিহাসিক ভূমিধসের রেকর্ড এবং GSI তথ্যের সমন্বয়।",
    searchPlaceholder: "পাহাড়ি শহর, গ্রাম বা রাস্তা অনুসন্ধান করুন (যেমন: দার্জিলিং, কালিম্পং, কার্শিয়াং...)",
    btnCheckRisk: "ঝুঁকি যাচাই",
    btnUseGps: "আমার বর্তমান অবস্থান",
    popularLabel: "উত্তরবঙ্গের সংবেদনশীল পাহাড়ি অঞ্চল:",

    riskTitle: "বর্তমান আনুমানিক ঝুঁকি",
    riskScoreLabel: "ঝুঁকি সূচক",
    riskLow: "কম ঝুঁকি (নিরাপদ)",
    riskMod: "মাঝারি ঝুঁকি (নজর রাখুন)",
    riskHigh: "উচ্চ ঝুঁকি (সতর্কবার্তা)",
    riskSevere: "চরম বিপদ (জরুরী সতর্কতা)",
    plainWordsTitle: "সহজ কথায় বর্তমান পরিস্থিতি",
    factorsTitle: "প্রধান কারণসমূহ:",
    actionTitle: "🛡️ এই মুহূর্তে আপনার করণীয়:",
    btnSaveLoc: "⭐ এই স্থানটি সংরক্ষণ করুন",

    pillarRain: "বৃষ্টিপাতের প্রভাব",
    pillarRainSub: "বিগত ২৪ ঘণ্টায়",
    pillarSoil: "মাটির আর্দ্রতা",
    pillarSoilSub: "আনুমানিক সম্পৃক্ততা",
    pillarHistory: "পূর্ববর্তী ভূমিধস",
    pillarHistorySub: "নিকটবর্তী ইসরো রেকর্ড",
    pillarSigns: "মাঠ পর্যায়ের লক্ষণ",
    pillarSignsSub: "স্থানীয় পর্যবেক্ষণ",

    viewOnMapBtn: "সম্পূর্ণ মানচিত্রে দেখুন →",
    reportSignBtn: "📢 ফাটল বা ধসের খবর জানান",
    getAlertsBtn: "🔔 আমার অঞ্চলের জন্য সতর্কতা পান",

    disclaimerTitle: "তথ্যের উৎস ও নির্দেশিকা",
    disclaimerText: "এই ওয়েবসাইটটি বৈজ্ঞানিক আবহাওয়া ও অতীতের রেকর্ডের ভিত্তিতে আনুমানিক ঝুঁকি নির্দেশ করে। সরকারী স্থানান্তর বা সতর্কতার জন্য সর্বদা NDMA ও স্থানীয় জেলা প্রশাসনের নির্দেশ অনুসরণ করুন।"
  }
};

// Available languages metadata for the dropdown
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'doi', label: 'डोगरी (Dogri - J&K)' },
  { code: 'gbm', label: 'गढ़वळि (Garhwali - UK)' },
  { code: 'kfy', label: 'कुमाऊँनी (Kumaoni - UK)' },
  { code: 'him', label: 'पहाड़ी (Himachali - HP)' },
  { code: 'ne', label: 'नेपाली (Nepali)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'bn', label: 'বাংলা (Bengali - WB)' }
];

let currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('bk_lang')) ? localStorage.getItem('bk_lang') : 'en';

function t(key, fallback = '') {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || fallback;
}

function setLanguage(langCode) {
  if (!translations[langCode]) langCode = 'en';
  currentLang = langCode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('bk_lang', langCode);
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = langCode;
    document.documentElement.dir = (langCode === 'ur') ? 'rtl' : 'ltr';
    applyLanguage();
  }

  // Dispatch event so other components or maps can update dynamically
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));
  }
}

function applyLanguage() {
  if (typeof document === 'undefined') return;
  const dict = translations[currentLang] || translations.en;

  // Replace text for elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Replace placeholder for inputs with data-i18n-ph attribute
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Sync any language selector dropdown on the page
  document.querySelectorAll('.lang-select').forEach(select => {
    select.value = currentLang;
  });
}

// Initialize on load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Populate all language select elements
    document.querySelectorAll('.lang-select').forEach(select => {
      select.innerHTML = '';
      SUPPORTED_LANGUAGES.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.code;
        opt.textContent = item.label;
        if (item.code === currentLang) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    });

    applyLanguage();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translations, SUPPORTED_LANGUAGES, t, setLanguage };
}
