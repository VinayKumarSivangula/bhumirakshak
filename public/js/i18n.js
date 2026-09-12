/**
 * BhumiRakshak — internationalisation
 *
 * Coverage is deliberately built around the belt where this tool is used:
 * the Himalayan and sub-Himalayan states (J&K, Ladakh, Himachal Pradesh,
 * Punjab, Haryana, Uttarakhand, Uttar Pradesh, Bihar, Rajasthan) plus the
 * classical/administrative languages tied to that region.
 *
 * Translation confidence: en, hi, ur, pa, ne, sa, ks and doi have been
 * translated with care. bho, mai, hne, gbm, kfy and mwr are close
 * Indo-Aryan relatives of Hindi and are provided as a good-faith regional
 * adaptation — flagged in the UI as "beta" and worth a native-speaker
 * review pass before relying on them in a life-safety context.
 */

const LANGUAGES = [
  { code: "en",  native: "English",       english: "English",    dir: "ltr" },
  { code: "hi",  native: "हिन्दी",          english: "Hindi",      dir: "ltr" },
  { code: "ur",  native: "اردو",           english: "Urdu",       dir: "rtl" },
  { code: "pa",  native: "ਪੰਜਾਬੀ",         english: "Punjabi",    dir: "ltr" },
  { code: "ks",  native: "کٲشُر",          english: "Kashmiri",   dir: "rtl" },
  { code: "doi", native: "डोगरी",          english: "Dogri",      dir: "ltr" },
  { code: "ne",  native: "नेपाली",         english: "Nepali",     dir: "ltr" },
  { code: "sa",  native: "संस्कृतम्",        english: "Sanskrit",   dir: "ltr" },
  { code: "hne", native: "हरियाणवी",        english: "Haryanvi",   dir: "ltr", beta: true },
  { code: "gbm", native: "गढ़वळि",          english: "Garhwali",   dir: "ltr", beta: true },
  { code: "kfy", native: "कुमाऊँनी",        english: "Kumaoni",    dir: "ltr", beta: true },
  { code: "bho", native: "भोजपुरी",         english: "Bhojpuri",   dir: "ltr", beta: true },
  { code: "mai", native: "मैथिली",          english: "Maithili",   dir: "ltr", beta: true },
  { code: "mwr", native: "मारवाड़ी",        english: "Marwari",    dir: "ltr", beta: true },
];

const TRANSLATIONS = {
  en: {
    brand_sub: "Landslide Early Warning",
    nav_checkRisk: "Check risk", nav_atlas: "Landslide atlas", nav_community: "Ground signs",
    nav_login: "Log in", nav_register: "Register",
    hero_title: "Know the slope before the slope moves.",
    hero_lede: "Live rainfall, soil saturation and 25 years of landslide records, turned into one plain-language warning for your village, road or campsite.",
    hero_cta: "Check a location",
    stat_locations: "locations assessed live", stat_districts: "high-risk districts tracked", stat_source: "data sources: Open-Meteo + ISRO Atlas",
    panel_title: "Risk check", panel_location: "Location", panel_locationPlaceholder: "Village, town or landmark",
    panel_useLocation: "Use my location", panel_check: "Check risk", panel_checking: "Checking…",
    score_label: "score",
    risk_low: "Low", risk_moderate: "Moderate", risk_high: "High", risk_severe: "Severe",
    ladder_title: "How risk is graded", ladder_lede: "Every assessment lands on this scale, built from live weather, soil moisture and historical slide data.",
    atlas_title: "Landslide atlas, 1998–2022", atlas_lede: "The most landslide-prone districts, from the ISRO Bhuvan inventory.",
    atlas_rank: "Rank", atlas_events: "recorded events", atlas_lastEvent: "last major event",
    community_title: "Ground signs from your area", community_lede: "Cracks, leaning trees, muddy springs — reported by residents and sensors nearby.",
    community_report: "Report a sign", community_empty: "No ground signs reported nearby yet.",
    subscribe_title: "Get alerted", subscribe_lede: "We'll check this spot against live conditions and notify you when risk crosses your threshold.",
    subscribe_location: "Location to watch", subscribe_threshold: "Alert me when risk reaches",
    subscribe_contact: "Name or contact", subscribe_button: "Subscribe", subscribe_success: "Subscribed. We'll watch this location for you.",
    footer_disclaimer: "This is an estimated risk indicator built on open scientific and meteorological data. It does not replace evacuation orders from the NDMA, your SDMA or District Magistrate.",
    footer_emergency: "Emergency helplines", footer_national: "National Emergency", footer_ndma: "NDMA Disaster Helpline",
    footer_rights: "Built for hill communities, panchayats and disaster managers.",
    login_title: "Log in", login_lede: "Return to your saved locations and alerts.",
    login_email: "Email", login_password: "Password", login_submit: "Log in",
    login_noAccount: "New here?", login_registerLink: "Create an account",
    register_title: "Create an account", register_lede: "Save your home village and get alerts that match how you'll actually receive them.",
    register_name: "Full name", register_phone: "Phone number", register_submit: "Create account",
    register_haveAccount: "Already registered?", register_loginLink: "Log in",
  },

  hi: {
    brand_sub: "भूस्खलन पूर्व चेतावनी",
    nav_checkRisk: "जोखिम जांचें", nav_atlas: "भूस्खलन एटलस", nav_community: "ज़मीनी संकेत",
    nav_login: "लॉग इन", nav_register: "पंजीकरण",
    hero_title: "ढलान खिसकने से पहले उसे पहचानें।",
    hero_lede: "लाइव वर्षा, मिट्टी की नमी और 25 वर्षों के भूस्खलन रिकॉर्ड — आपके गांव, सड़क या शिविर के लिए एक सीधी-सरल चेतावनी में।",
    hero_cta: "किसी स्थान की जांच करें",
    stat_locations: "स्थानों की लाइव जांच", stat_districts: "उच्च-जोखिम ज़िले ट्रैक किए गए", stat_source: "डेटा स्रोत: Open-Meteo + ISRO एटलस",
    panel_title: "जोखिम जांच", panel_location: "स्थान", panel_locationPlaceholder: "गांव, कस्बा या स्थल",
    panel_useLocation: "मेरा स्थान उपयोग करें", panel_check: "जोखिम जांचें", panel_checking: "जांच हो रही है…",
    score_label: "स्कोर",
    risk_low: "कम", risk_moderate: "मध्यम", risk_high: "अधिक", risk_severe: "गंभीर",
    ladder_title: "जोखिम कैसे तय होता है", ladder_lede: "हर आकलन इसी पैमाने पर आधारित है — लाइव मौसम, मिट्टी की नमी और ऐतिहासिक भूस्खलन डेटा से बना।",
    atlas_title: "भूस्खलन एटलस, 1998–2022", atlas_lede: "ISRO भुवन सूची के अनुसार सबसे अधिक भूस्खलन-प्रवण ज़िले।",
    atlas_rank: "क्रम", atlas_events: "दर्ज घटनाएं", atlas_lastEvent: "अंतिम बड़ी घटना",
    community_title: "आपके क्षेत्र से ज़मीनी संकेत", community_lede: "दरारें, झुके पेड़, गंदला पानी — आस-पास के निवासियों और सेंसर द्वारा रिपोर्ट किए गए।",
    community_report: "संकेत रिपोर्ट करें", community_empty: "अभी तक इस क्षेत्र से कोई संकेत रिपोर्ट नहीं हुआ।",
    subscribe_title: "अलर्ट पाएं", subscribe_lede: "हम इस स्थान की स्थिति लगातार जांचेंगे और सीमा पार होने पर आपको सूचित करेंगे।",
    subscribe_location: "निगरानी हेतु स्थान", subscribe_threshold: "इस स्तर पर सूचित करें",
    subscribe_contact: "नाम या संपर्क", subscribe_button: "सब्सक्राइब करें", subscribe_success: "सब्सक्राइब हो गया। हम इस स्थान पर नज़र रखेंगे।",
    footer_disclaimer: "यह खुले वैज्ञानिक व मौसम संबंधी डेटा पर आधारित एक अनुमानित जोखिम संकेतक है। यह NDMA, आपके SDMA या ज़िला मजिस्ट्रेट के निकासी आदेश का स्थान नहीं लेता।",
    footer_emergency: "आपातकालीन हेल्पलाइन", footer_national: "राष्ट्रीय आपातकालीन सेवा", footer_ndma: "NDMA आपदा हेल्पलाइन",
    footer_rights: "पहाड़ी समुदायों, पंचायतों और आपदा प्रबंधकों के लिए बनाया गया।",
    login_title: "लॉग इन", login_lede: "अपने सहेजे गए स्थानों और अलर्ट पर लौटें।",
    login_email: "ईमेल", login_password: "पासवर्ड", login_submit: "लॉग इन करें",
    login_noAccount: "नए हैं?", login_registerLink: "खाता बनाएं",
    register_title: "खाता बनाएं", register_lede: "अपना घर का गांव सहेजें और उसी तरह अलर्ट पाएं जैसे आपको सुविधाजनक हो।",
    register_name: "पूरा नाम", register_phone: "फ़ोन नंबर", register_submit: "खाता बनाएं",
    register_haveAccount: "पहले से पंजीकृत हैं?", register_loginLink: "लॉग इन करें",
  },

  ur: {
    brand_sub: "لینڈ سلائیڈ پیشگی انتباہ",
    nav_checkRisk: "خطرہ چیک کریں", nav_atlas: "لینڈ سلائیڈ اٹلس", nav_community: "زمینی علامات",
    nav_login: "لاگ ان", nav_register: "رجسٹر کریں",
    hero_title: "ڈھلان کے کھسکنے سے پہلے اسے پہچانیں۔",
    hero_lede: "لائیو بارش، مٹی کی نمی اور 25 سال کے لینڈ سلائیڈ ریکارڈ — آپ کے گاؤں، سڑک یا کیمپ کے لیے ایک سادہ زبان میں انتباہ۔",
    hero_cta: "کسی مقام کی جانچ کریں",
    stat_locations: "مقامات کا لائیو جائزہ", stat_districts: "ہائی رسک اضلاع ٹریک کیے گئے", stat_source: "ڈیٹا ماخذ: Open-Meteo + ISRO اٹلس",
    panel_title: "خطرے کی جانچ", panel_location: "مقام", panel_locationPlaceholder: "گاؤں، قصبہ یا نشان",
    panel_useLocation: "میرا مقام استعمال کریں", panel_check: "خطرہ چیک کریں", panel_checking: "جانچا جا رہا ہے…",
    score_label: "اسکور",
    risk_low: "کم", risk_moderate: "درمیانہ", risk_high: "زیادہ", risk_severe: "شدید",
    ladder_title: "خطرے کا درجہ کیسے طے ہوتا ہے", ladder_lede: "ہر جائزہ اسی پیمانے پر مبنی ہے — لائیو موسم، مٹی کی نمی اور تاریخی لینڈ سلائیڈ ڈیٹا سے۔",
    atlas_title: "لینڈ سلائیڈ اٹلس، 1998–2022", atlas_lede: "ISRO بھووَن فہرست کے مطابق سب سے زیادہ حساس اضلاع۔",
    atlas_rank: "درجہ", atlas_events: "درج شدہ واقعات", atlas_lastEvent: "آخری بڑا واقعہ",
    community_title: "آپ کے علاقے سے زمینی علامات", community_lede: "دراڑیں، جھکے درخت، گدلا پانی — قریبی رہائشیوں اور سینسرز کی رپورٹس۔",
    community_report: "علامت رپورٹ کریں", community_empty: "ابھی اس علاقے سے کوئی علامت رپورٹ نہیں ہوئی۔",
    subscribe_title: "الرٹ حاصل کریں", subscribe_lede: "ہم اس مقام کے حالات کی نگرانی کریں گے اور حد عبور ہونے پر آپ کو مطلع کریں گے۔",
    subscribe_location: "نگرانی کے لیے مقام", subscribe_threshold: "اس سطح پر مطلع کریں",
    subscribe_contact: "نام یا رابطہ", subscribe_button: "سبسکرائب کریں", subscribe_success: "سبسکرائب ہو گیا۔ ہم اس مقام پر نظر رکھیں گے۔",
    footer_disclaimer: "یہ کھلے سائنسی اور موسمیاتی ڈیٹا پر مبنی ایک تخمینی خطرہ اشاریہ ہے۔ یہ NDMA، آپ کے SDMA یا ضلعی مجسٹریٹ کے انخلاء کے احکامات کا متبادل نہیں۔",
    footer_emergency: "ہنگامی ہیلپ لائنز", footer_national: "قومی ہنگامی خدمات", footer_ndma: "NDMA آفات ہیلپ لائن",
    footer_rights: "پہاڑی برادریوں، پنچایتوں اور ڈیزاسٹر مینیجرز کے لیے بنایا گیا۔",
    login_title: "لاگ ان", login_lede: "اپنے محفوظ کردہ مقامات اور الرٹس پر واپس جائیں۔",
    login_email: "ای میل", login_password: "پاس ورڈ", login_submit: "لاگ ان کریں",
    login_noAccount: "نئے ہیں؟", login_registerLink: "اکاؤنٹ بنائیں",
    register_title: "اکاؤنٹ بنائیں", register_lede: "اپنا آبائی گاؤں محفوظ کریں اور اپنی سہولت کے مطابق الرٹ حاصل کریں۔",
    register_name: "پورا نام", register_phone: "فون نمبر", register_submit: "اکاؤنٹ بنائیں",
    register_haveAccount: "پہلے سے رجسٹرڈ ہیں؟", register_loginLink: "لاگ ان کریں",
  },

  pa: {
    brand_sub: "ਢਿੱਗਾਂ ਡਿੱਗਣ ਦੀ ਪੂਰਵ ਚੇਤਾਵਨੀ",
    nav_checkRisk: "ਖ਼ਤਰਾ ਜਾਂਚੋ", nav_atlas: "ਢਿੱਗ ਐਟਲਸ", nav_community: "ਜ਼ਮੀਨੀ ਸੰਕੇਤ",
    nav_login: "ਲੌਗ ਇਨ", nav_register: "ਰਜਿਸਟਰ ਕਰੋ",
    hero_title: "ਢਲਾਨ ਖਿਸਕਣ ਤੋਂ ਪਹਿਲਾਂ ਪਛਾਣੋ।",
    hero_lede: "ਲਾਈਵ ਬਾਰਿਸ਼, ਮਿੱਟੀ ਦੀ ਨਮੀ ਅਤੇ 25 ਸਾਲਾਂ ਦੇ ਢਿੱਗ ਰਿਕਾਰਡ — ਤੁਹਾਡੇ ਪਿੰਡ, ਸੜਕ ਜਾਂ ਕੈਂਪ ਲਈ ਸਿੱਧੀ-ਸਾਦੀ ਚੇਤਾਵਨੀ ਵਿੱਚ।",
    hero_cta: "ਕੋਈ ਥਾਂ ਜਾਂਚੋ",
    stat_locations: "ਥਾਵਾਂ ਦੀ ਲਾਈਵ ਜਾਂਚ", stat_districts: "ਉੱਚ-ਖ਼ਤਰੇ ਵਾਲੇ ਜ਼ਿਲ੍ਹੇ ਟਰੈਕ ਕੀਤੇ", stat_source: "ਡਾਟਾ ਸਰੋਤ: Open-Meteo + ISRO ਐਟਲਸ",
    panel_title: "ਖ਼ਤਰਾ ਜਾਂਚ", panel_location: "ਥਾਂ", panel_locationPlaceholder: "ਪਿੰਡ, ਕਸਬਾ ਜਾਂ ਨਿਸ਼ਾਨ",
    panel_useLocation: "ਮੇਰੀ ਥਾਂ ਵਰਤੋ", panel_check: "ਖ਼ਤਰਾ ਜਾਂਚੋ", panel_checking: "ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ…",
    score_label: "ਸਕੋਰ",
    risk_low: "ਘੱਟ", risk_moderate: "ਦਰਮਿਆਨਾ", risk_high: "ਵੱਧ", risk_severe: "ਗੰਭੀਰ",
    ladder_title: "ਖ਼ਤਰੇ ਦਾ ਪੱਧਰ ਕਿਵੇਂ ਤੈਅ ਹੁੰਦਾ ਹੈ", ladder_lede: "ਹਰ ਮੁਲਾਂਕਣ ਇਸੇ ਪੈਮਾਨੇ 'ਤੇ ਆਧਾਰਿਤ ਹੈ — ਲਾਈਵ ਮੌਸਮ, ਮਿੱਟੀ ਦੀ ਨਮੀ ਅਤੇ ਇਤਿਹਾਸਕ ਢਿੱਗ ਡਾਟੇ ਤੋਂ।",
    atlas_title: "ਢਿੱਗ ਐਟਲਸ, 1998–2022", atlas_lede: "ISRO ਭੁਵਨ ਸੂਚੀ ਮੁਤਾਬਕ ਸਭ ਤੋਂ ਵੱਧ ਢਿੱਗ-ਸੰਭਾਵੀ ਜ਼ਿਲ੍ਹੇ।",
    atlas_rank: "ਦਰਜਾ", atlas_events: "ਦਰਜ ਘਟਨਾਵਾਂ", atlas_lastEvent: "ਆਖ਼ਰੀ ਵੱਡੀ ਘਟਨਾ",
    community_title: "ਤੁਹਾਡੇ ਇਲਾਕੇ ਤੋਂ ਜ਼ਮੀਨੀ ਸੰਕੇਤ", community_lede: "ਤਰੇੜਾਂ, ਝੁਕੇ ਦਰੱਖਤ, ਗੰਧਲਾ ਪਾਣੀ — ਨੇੜਲੇ ਵਾਸੀਆਂ ਤੇ ਸੈਂਸਰਾਂ ਵੱਲੋਂ ਰਿਪੋਰਟ ਕੀਤੇ।",
    community_report: "ਸੰਕੇਤ ਰਿਪੋਰਟ ਕਰੋ", community_empty: "ਹਾਲੇ ਤੱਕ ਇਸ ਇਲਾਕੇ ਤੋਂ ਕੋਈ ਸੰਕੇਤ ਰਿਪੋਰਟ ਨਹੀਂ ਹੋਇਆ।",
    subscribe_title: "ਅਲਰਟ ਪਾਓ", subscribe_lede: "ਅਸੀਂ ਇਸ ਥਾਂ ਦੇ ਹਾਲਾਤ ਲਗਾਤਾਰ ਜਾਂਚਾਂਗੇ ਅਤੇ ਸੀਮਾ ਪਾਰ ਹੋਣ 'ਤੇ ਦੱਸਾਂਗੇ।",
    subscribe_location: "ਨਿਗਰਾਨੀ ਲਈ ਥਾਂ", subscribe_threshold: "ਇਸ ਪੱਧਰ 'ਤੇ ਸੂਚਿਤ ਕਰੋ",
    subscribe_contact: "ਨਾਮ ਜਾਂ ਸੰਪਰਕ", subscribe_button: "ਸਬਸਕ੍ਰਾਈਬ ਕਰੋ", subscribe_success: "ਸਬਸਕ੍ਰਾਈਬ ਹੋ ਗਿਆ। ਅਸੀਂ ਇਸ ਥਾਂ 'ਤੇ ਨਜ਼ਰ ਰੱਖਾਂਗੇ।",
    footer_disclaimer: "ਇਹ ਖੁੱਲ੍ਹੇ ਵਿਗਿਆਨਕ ਤੇ ਮੌਸਮੀ ਡਾਟੇ 'ਤੇ ਆਧਾਰਿਤ ਇੱਕ ਅਨੁਮਾਨਿਤ ਖ਼ਤਰਾ ਸੂਚਕ ਹੈ। ਇਹ NDMA, ਤੁਹਾਡੇ SDMA ਜਾਂ ਜ਼ਿਲ੍ਹਾ ਮੈਜਿਸਟ੍ਰੇਟ ਦੇ ਨਿਕਾਸੀ ਹੁਕਮਾਂ ਦੀ ਥਾਂ ਨਹੀਂ ਲੈਂਦਾ।",
    footer_emergency: "ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨਾਂ", footer_national: "ਰਾਸ਼ਟਰੀ ਐਮਰਜੈਂਸੀ ਸੇਵਾ", footer_ndma: "NDMA ਆਫ਼ਤ ਹੈਲਪਲਾਈਨ",
    footer_rights: "ਪਹਾੜੀ ਭਾਈਚਾਰਿਆਂ, ਪੰਚਾਇਤਾਂ ਤੇ ਆਫ਼ਤ ਪ੍ਰਬੰਧਕਾਂ ਲਈ ਬਣਾਇਆ ਗਿਆ।",
    login_title: "ਲੌਗ ਇਨ", login_lede: "ਆਪਣੀਆਂ ਸੰਭਾਲੀਆਂ ਥਾਵਾਂ ਤੇ ਅਲਰਟਾਂ 'ਤੇ ਵਾਪਸ ਜਾਓ।",
    login_email: "ਈਮੇਲ", login_password: "ਪਾਸਵਰਡ", login_submit: "ਲੌਗ ਇਨ ਕਰੋ",
    login_noAccount: "ਨਵੇਂ ਹੋ?", login_registerLink: "ਖਾਤਾ ਬਣਾਓ",
    register_title: "ਖਾਤਾ ਬਣਾਓ", register_lede: "ਆਪਣਾ ਘਰੇਲੂ ਪਿੰਡ ਸੰਭਾਲੋ ਤੇ ਆਪਣੀ ਸਹੂਲਤ ਮੁਤਾਬਕ ਅਲਰਟ ਪਾਓ।",
    register_name: "ਪੂਰਾ ਨਾਮ", register_phone: "ਫ਼ੋਨ ਨੰਬਰ", register_submit: "ਖਾਤਾ ਬਣਾਓ",
    register_haveAccount: "ਪਹਿਲਾਂ ਤੋਂ ਰਜਿਸਟਰਡ ਹੋ?", register_loginLink: "ਲੌਗ ਇਨ ਕਰੋ",
  },

  ks: {
    brand_sub: "زَمہِ کھسنُک پیشگی خبردار",
    nav_checkRisk: "خطرہ چیک کریو", nav_atlas: "زَمہِ کھسنٕک اٹلس", nav_community: "زمینی نشان",
    nav_login: "لاگ اِن", nav_register: "رجسٹر کریو",
    hero_title: "ژلان کھسنہٕ برونہٕ چھِ پژھانُن ضروری۔",
    hero_lede: "لائیو باران، مٹی چ نمی تہٕ 25 ورؠن ہٕند زَمہِ کھسنٕک ریکارڈ — توٚہنٛدِس گاٮ۬وٕن، سڑکس یا کیمپس خٲطرٕ سٟدھی زبانہٕ منٛز خبردار۔",
    hero_cta: "کانہہ جاے چیک کریو",
    stat_locations: "جایہ ہٕنٛز لائیو جانچ", stat_districts: "ذیادٕ خطرن ہٕنٛز ضِلع ٹریک", stat_source: "ڈیٹا مآخذ: Open-Meteo + ISRO اٹلس",
    panel_title: "خطرہ جانچ", panel_location: "جاے", panel_locationPlaceholder: "گاٮ۬وٕن، شہر یا نشان",
    panel_useLocation: "می جاے استعمال کریو", panel_check: "خطرہ چیک کریو", panel_checking: "جانچ ژٲریتھ چھُ…",
    score_label: "اسکور",
    risk_low: "کم", risk_moderate: "درمیانہ", risk_high: "زیادٕ", risk_severe: "شدید",
    ladder_title: "خطرہ کیوٚہہ طَے چھُ ژٟتھ", ladder_lede: "ہر جانچ چھِ اِس پیمانس پؠٹھ — لائیو موسم، مٹی چ نمی تہٕ تاریخی ڈیٹہٕ منٛز۔",
    atlas_title: "زَمہِ کھسنٕک اٹلس، 1998–2022", atlas_lede: "ISRO بھووَن فہرست موافق سٕٹھاہ خطرناک ضِلع۔",
    atlas_rank: "درجہ", atlas_events: "درج واقعات", atlas_lastEvent: "پؠٹھ بڑ واقعہ",
    community_title: "توٚہنٛدِس علاقس منٛز زمینی نشان", community_lede: "دَرارؠ، جھکہٕ کُل، مَٹی آو — نزدیک ہٕنٛز رہواسیو تہٕ سینسرو ہٕنٛدی رپورٹ۔",
    community_report: "نشان رپورٹ کریو", community_empty: "اَتھ علاقس منٛز چھُنہ اَتہ تام کانہہ نشان رپورٹ ژٲلہٕ۔",
    subscribe_title: "خبردار حاصل کریو", subscribe_lede: "اسہِ چھِ اَتھ جایہ ہُند حال جانچان تہٕ حد پار گژھنہٕ پؠٹھ توٚہے خبردار کران۔",
    subscribe_location: "نگرانی خٲطرٕ جاے", subscribe_threshold: "اتھ سطحس پؠٹھ خبردار کریو",
    subscribe_contact: "ناو یا رابطہ", subscribe_button: "سبسکرائب کریو", subscribe_success: "سبسکرائب ژٲلہٕ۔ اسہِ چھِ اَتھ جایہ پؠٹھ نظر تھاوان۔",
    footer_disclaimer: "یہٕ چھُ کُھلہٕ سائنسی تہٕ موسمی ڈیٹس پؠٹھ بنیاد اندازہٕ خطرہ اشاریہ۔ یہٕ چھُنہ NDMA، توٚہنٛدِس SDMA یا ضِلع مجسٹریٹ سٕنٛدِ انخلا حکمن ہُند بدل۔",
    footer_emergency: "ہنگامی مدد نمبر", footer_national: "قومی ہنگامی خدمت", footer_ndma: "NDMA آفات مدد نمبر",
    footer_rights: "کوہساری برادری، پنچایتو تہٕ آفت منتظمو خٲطرٕ بناوَمُت۔",
    login_title: "لاگ اِن", login_lede: "پننِس محفوظ جایو تہٕ خبردارِ ہِنٛز تام واپس گژھِو۔",
    login_email: "ای میل", login_password: "پاس ورڈ", login_submit: "لاگ اِن کریو",
    login_noAccount: "نوٚو چھِوَ؟", login_registerLink: "اکاؤنٹ بناوٕو",
    register_title: "اکاؤنٹ بناوٕو", register_lede: "پننٕن گاٮ۬وٕن محفوظ کریو تہٕ اَتھ طریقس منٛز خبردار حاصل کریو یُس توٚہے آسان اوس۔",
    register_name: "پورٕ ناو", register_phone: "فون نمبر", register_submit: "اکاؤنٹ بناوٕو",
    register_haveAccount: "پہلہٕکنہٕ رجسٹرڈ چھِوَ؟", register_loginLink: "لاگ اِن کریو",
  },

};

// Dogri written in Devanagari (its official script since 2003)
TRANSLATIONS.doi = {
  brand_sub: "भूस्खलन पैह्ली चेतावनी",
  nav_checkRisk: "खतरा जाँचो", nav_atlas: "भूस्खलन एटलस", nav_community: "जमीनी निशान",
  nav_login: "लॉग इन", nav_register: "रजिस्टर करो",
  hero_title: "ढलान खिसकने थमां पैह्ले पछेणो।",
  hero_lede: "लाइव बरखा, मिट्टी दी नमी ते 25 सालें दा भूस्खलन रिकार्ड — तुंदे गांऽ, सड़क जां कैंप आस्तै इक सिद्धी चेतावनी च।",
  hero_cta: "कोई जगह जाँचो",
  stat_locations: "जगहें दी लाइव जाँच", stat_districts: "उच्च-खतरे आले जिले ट्रैक कीते", stat_source: "डेटा स्रोत: Open-Meteo + ISRO एटलस",
  panel_title: "खतरा जाँच", panel_location: "जगह", panel_locationPlaceholder: "गांऽ, कस्बा जां निशान",
  panel_useLocation: "मेरी जगह इस्तेमाल करो", panel_check: "खतरा जाँचो", panel_checking: "जाँच होआ करदी ऐ…",
  score_label: "स्कोर",
  risk_low: "घट्ट", risk_moderate: "मध्यम", risk_high: "बद्धा", risk_severe: "गंभीर",
  ladder_title: "खतरा किन्जे तय होंदा ऐ", ladder_lede: "हर आकलन इसी पैमाने पर आधारत ऐ — लाइव मौसम, मिट्टी दी नमी ते इतिहासक भूस्खलन डेटे थमां बणेआ।",
  atlas_title: "भूस्खलन एटलस, 1998–2022", atlas_lede: "ISRO भुवन सूची मताबक सबतो बद्धा भूस्खलन-प्रवण जिले।",
  atlas_rank: "क्रम", atlas_events: "दर्ज घटनां", atlas_lastEvent: "आखरी बड्डी घटना",
  community_title: "तुंदे इलाके थमां जमीनी निशान", community_lede: "दरारां, झुकी दरखत, गंदला पानी — लागें दे बसनेआं ते सेंसरें आसेआं रिपोर्ट कीते।",
  community_report: "निशान रिपोर्ट करो", community_empty: "हाल्ले तिकर इस इलाके थमां कोई निशान रिपोर्ट नेईं होआ।",
  subscribe_title: "अलर्ट लैओ", subscribe_lede: "अस इस जगह दे हालात लगातार जाँचगे ते सीमा पार होने पर तुसें दस्सगे।",
  subscribe_location: "निगरानी आस्तै जगह", subscribe_threshold: "इस स्तर पर सूचित करो",
  subscribe_contact: "नां जां संपर्क", subscribe_button: "सब्सक्राइब करो", subscribe_success: "सब्सक्राइब होई गेआ। अस इस जगह पर नजर रखगे।",
  footer_disclaimer: "एह् खुल्ले वैज्ञानिक ते मौसमी डेटे पर आधारत इक अनुमानत खतरा संकेतक ऐ। एह् NDMA, तुंदे SDMA जां जिला मजिस्ट्रेट दे निकासी हुक्में दी जगह नेईं लैंदा।",
  footer_emergency: "आपातकालीन हेल्पलाइनां", footer_national: "राष्ट्रीय आपातकालीन सेवा", footer_ndma: "NDMA आपदा हेल्पलाइन",
  footer_rights: "पहाड़ी भाईचारेआं, पंचायतें ते आपदा प्रबंधकें आस्तै बणाया गेआ।",
  login_title: "लॉग इन", login_lede: "अपनी सुरक्षत जगहें ते अलर्टें पर बापस जाओ।",
  login_email: "ईमेल", login_password: "पासवर्ड", login_submit: "लॉग इन करो",
  login_noAccount: "नमें ओ?", login_registerLink: "खाता बनाओ",
  register_title: "खाता बनाओ", register_lede: "अपना घरेलू गांऽ सुरक्षत करो ते अपनी सुविधा मताबक अलर्ट लैओ।",
  register_name: "पूरा नां", register_phone: "फोन नंबर", register_submit: "खाता बनाओ",
  register_haveAccount: "पैह्लें थमां रजिस्टर्ड ओ?", register_loginLink: "लॉग इन करो",
};

TRANSLATIONS.ne = {
  brand_sub: "पहिरो पूर्व चेतावनी",
  nav_checkRisk: "जोखिम जाँच", nav_atlas: "पहिरो एटलस", nav_community: "जमिनी संकेतहरू",
  nav_login: "लग इन", nav_register: "दर्ता गर्नुहोस्",
  hero_title: "भिरालो चट्टान चल्नुअघि नै चिन्नुहोस्।",
  hero_lede: "प्रत्यक्ष वर्षा, माटोको ओसिलोपन र २५ वर्षको पहिरो अभिलेख — तपाईंको गाउँ, सडक वा शिविरका लागि सरल भाषामा चेतावनी।",
  hero_cta: "स्थान जाँच गर्नुहोस्",
  stat_locations: "प्रत्यक्ष जाँचिएका स्थानहरू", stat_districts: "उच्च-जोखिम जिल्लाहरू ट्र्याक", stat_source: "डेटा स्रोत: Open-Meteo + ISRO एटलस",
  panel_title: "जोखिम जाँच", panel_location: "स्थान", panel_locationPlaceholder: "गाउँ, सहर वा चिनारी स्थान",
  panel_useLocation: "मेरो स्थान प्रयोग गर्नुहोस्", panel_check: "जोखिम जाँच गर्नुहोस्", panel_checking: "जाँच हुँदैछ…",
  score_label: "स्कोर",
  risk_low: "कम", risk_moderate: "मध्यम", risk_high: "उच्च", risk_severe: "गम्भीर",
  ladder_title: "जोखिम कसरी तय हुन्छ", ladder_lede: "हरेक मूल्याङ्कन यही मापदण्डमा आधारित छ — प्रत्यक्ष मौसम, माटोको ओसिलोपन र ऐतिहासिक पहिरो डेटाबाट।",
  atlas_title: "पहिरो एटलस, १९९८–२०२२", atlas_lede: "ISRO भुवन सूची अनुसार सबैभन्दा पहिरो-प्रवण जिल्लाहरू।",
  atlas_rank: "स्थान", atlas_events: "दर्ता घटनाहरू", atlas_lastEvent: "अन्तिम ठूलो घटना",
  community_title: "तपाईंको क्षेत्रबाट जमिनी संकेतहरू", community_lede: "चिराहरू, झुकेका रुखहरू, धमिलो पानी — नजिकका बासिन्दा र सेन्सरहरूबाट रिपोर्ट गरिएको।",
  community_report: "संकेत रिपोर्ट गर्नुहोस्", community_empty: "अहिलेसम्म यस क्षेत्रबाट कुनै संकेत रिपोर्ट भएको छैन।",
  subscribe_title: "अलर्ट पाउनुहोस्", subscribe_lede: "हामी यो स्थानको अवस्था लगातार जाँच्नेछौं र सीमा नाघेमा तपाईंलाई सूचित गर्नेछौं।",
  subscribe_location: "निगरानीका लागि स्थान", subscribe_threshold: "यो स्तरमा सूचित गर्नुहोस्",
  subscribe_contact: "नाम वा सम्पर्क", subscribe_button: "सदस्यता लिनुहोस्", subscribe_success: "सदस्यता लिइयो। हामी यो स्थानमा नजर राख्नेछौं।",
  footer_disclaimer: "यो खुला वैज्ञानिक र मौसम सम्बन्धी डेटामा आधारित अनुमानित जोखिम सूचक हो। यसले NDMA, तपाईंको SDMA वा जिल्ला म्यागिस्ट्रेटको निकासी आदेशको ठाउँ लिँदैन।",
  footer_emergency: "आपतकालीन हेल्पलाइनहरू", footer_national: "राष्ट्रिय आपतकालीन सेवा", footer_ndma: "NDMA विपद् हेल्पलाइन",
  footer_rights: "पहाडी समुदाय, गाउँ पञ्चायत र विपद् व्यवस्थापकहरूका लागि बनाइएको।",
  login_title: "लग इन", login_lede: "आफ्ना सुरक्षित स्थान र अलर्टमा फर्कनुहोस्।",
  login_email: "इमेल", login_password: "पासवर्ड", login_submit: "लग इन गर्नुहोस्",
  login_noAccount: "नयाँ हुनुहुन्छ?", login_registerLink: "खाता बनाउनुहोस्",
  register_title: "खाता बनाउनुहोस्", register_lede: "आफ्नो गृह गाउँ सुरक्षित गर्नुहोस् र तपाईंलाई सजिलो हुने गरी अलर्ट पाउनुहोस्।",
  register_name: "पूरा नाम", register_phone: "फोन नम्बर", register_submit: "खाता बनाउनुहोस्",
  register_haveAccount: "पहिल्यै दर्ता हुनुहुन्छ?", register_loginLink: "लग इन गर्नुहोस्",
};

TRANSLATIONS.sa = {
  brand_sub: "भूस्खलन पूर्व सूचना",
  nav_checkRisk: "जोखिमं परीक्ष्यताम्", nav_atlas: "भूस्खलन-मानचित्रम्", nav_community: "भूमि-सङ्केताः",
  nav_login: "प्रवेशः", nav_register: "पञ्जीकरणम्",
  hero_title: "ढलानस्य चलनात् पूर्वमेव तत् जानीत।",
  hero_lede: "प्रत्यक्ष-वृष्टिः, मृदा-आर्द्रता, पञ्चविंशति-वर्षाणां भूस्खलन-अभिलेखाः च — भवतां ग्रामाय मार्गाय शिबिराय वा सरल-भाषायां सूचना रूपेण।",
  hero_cta: "स्थानं परीक्ष्यताम्",
  stat_locations: "प्रत्यक्षतः परीक्षितानि स्थानानि", stat_districts: "उच्च-जोखिम-जनपदाः अनुसृताः", stat_source: "आधार-स्रोतः: Open-Meteo + ISRO मानचित्रम्",
  panel_title: "जोखिम-परीक्षा", panel_location: "स्थानम्", panel_locationPlaceholder: "ग्रामः, नगरं वा चिह्नम्",
  panel_useLocation: "मम स्थानं प्रयुज्यताम्", panel_check: "जोखिमं परीक्ष्यताम्", panel_checking: "परीक्षा क्रियमाणा अस्ति…",
  score_label: "अङ्कः",
  risk_low: "अल्पम्", risk_moderate: "मध्यमम्", risk_high: "अधिकम्", risk_severe: "गुरुतरम्",
  ladder_title: "जोखिमस्य निर्धारणं कथम्", ladder_lede: "प्रत्येकं मूल्याङ्कनम् अस्मिन् एव मानदण्डे स्थितं — प्रत्यक्ष-हवामानात्, मृदा-आर्द्रतायाः, ऐतिहासिक-दत्तांशात् च निर्मितम्।",
  atlas_title: "भूस्खलन-मानचित्रम्, १९९८–२०२२", atlas_lede: "ISRO भुवन-सूच्यनुसारं सर्वाधिक-भूस्खलन-प्रवणाः जनपदाः।",
  atlas_rank: "क्रमः", atlas_events: "अभिलिखिताः घटनाः", atlas_lastEvent: "अन्तिमा गुरुतरा घटना",
  community_title: "भवतः क्षेत्रात् भूमि-सङ्केताः", community_lede: "दराः, नमन्तः वृक्षाः, मलिनं जलं च — समीपस्थैः निवासिभिः यन्त्रैः च सूचिताः।",
  community_report: "सङ्केतं सूचयतु", community_empty: "अद्यापि अस्मात् क्षेत्रात् कोऽपि सङ्केतः न सूचितः।",
  subscribe_title: "सूचना प्राप्नोतु", subscribe_lede: "वयम् एतत् स्थानं निरन्तरं परीक्षिष्यामः, सीमातिक्रमे च भवन्तं सूचयिष्यामः।",
  subscribe_location: "निरीक्षणार्थं स्थानम्", subscribe_threshold: "अस्मिन् स्तरे सूचयतु",
  subscribe_contact: "नाम अथवा सम्पर्कः", subscribe_button: "सदस्यतां स्वीकुर्वन्तु", subscribe_success: "सदस्यता स्वीकृता। वयम् एतत् स्थानं निरीक्षिष्यामः।",
  footer_disclaimer: "इदम् मुक्त-वैज्ञानिक-मौसम-दत्तांशाधारितम् अनुमानित-जोखिम-सूचकम् अस्ति। एतत् NDMA, भवतः SDMA अथवा जनपद-मजिस्ट्रेटस्य निष्क्रमण-आदेशस्य स्थानं न गृह्णाति।",
  footer_emergency: "आपत्कालीन-सहायता-सङ्ख्याः", footer_national: "राष्ट्रिय-आपत्कालीन-सेवा", footer_ndma: "NDMA आपदा-सहायता-सङ्ख्या",
  footer_rights: "पर्वतीय-समुदायेभ्यः, पञ्चायतेभ्यः, आपदा-प्रबन्धकेभ्यः च निर्मितम्।",
  login_title: "प्रवेशः", login_lede: "स्व-रक्षित-स्थानानि सूचनाः च पुनः पश्यन्तु।",
  login_email: "विपत्रम्", login_password: "गुप्तशब्दः", login_submit: "प्रविश्यताम्",
  login_noAccount: "नूतनः स्थ?", login_registerLink: "खातां रचयतु",
  register_title: "खातां रचयतु", register_lede: "स्व-गृह-ग्रामं रक्षतु, स्व-सौकर्यानुसारं च सूचनाः प्राप्नोतु।",
  register_name: "पूर्णनाम", register_phone: "दूरभाष-सङ्ख्या", register_submit: "खातां रचयतु",
  register_haveAccount: "पूर्वमेव पञ्जीकृतः स्थ?", register_loginLink: "प्रविश्यताम्",
};

// Close regional relatives of Hindi — regional lexical adaptation, beta quality.
TRANSLATIONS.hne = {
  ...TRANSLATIONS.hi,
  brand_sub: "पहाड़ खिसकण की पैह्ली चेतावनी",
  hero_title: "टीबा खिसकण तै पैह्ले पिच्छाणो।",
  hero_lede: "लाइव बरखा, माट्टी की सीलण अर 25 साल का भूस्खलन का रिकॉर्ड — थारे गाम, सड़क या पड़ाव खात्तर सीध्धी भाषा म्ह चेतावनी।",
  panel_useLocation: "मेरी जगहां काम म्ह ल्यो", panel_checking: "जाँच हो री सै…",
  risk_low: "घाट", risk_high: "ज्यादा",
  community_lede: "दरारां, टेढ़े रुक्ख, गंधळा पाणी — धोरै रहवासियां अर सेंसर तै रिपोर्ट होया।",
};

TRANSLATIONS.gbm = {
  ...TRANSLATIONS.hi,
  brand_sub: "पाड़ खिसकण री पैली चेतावनी",
  hero_title: "टील्यू खिसकणस पैली पछ्याणा।",
  hero_lede: "लाइव बरखा, माट्टि की सींच अर 25 बरखों का भूस्खलन रिकॉर्ड — तुमरा गौं, बाटा या पड़ाव खुण सीधी भाषा मा चेतावनी।",
  panel_useLocation: "मेरि जगा उपयोग करा", panel_checking: "जाँच हूणि च…",
  community_lede: "दराड़ि, टेढ़ा रूख, गंदुल पाणि — लग्यां बटि रहणवाळों अर सेंसरों बटि रिपोर्ट।",
};

TRANSLATIONS.kfy = {
  ...TRANSLATIONS.hi,
  brand_sub: "पहाड़ खसण कि पैली चेतावनी",
  hero_title: "टीला खसण ल्है पैली चिन्न।",
  hero_lede: "लाइव झड़ी, माटा कि सींच अर 25 सालों को भूस्खलन रिकॉर्ड — त्यार गौं, बाटा या पड़ाव ल्है सीधी भाषा में चेतावनी।",
  panel_useLocation: "म्यर ठौर उपयोग करा", panel_checking: "जाँच है रौछ…",
  community_lede: "दराड़ि, टेढ़ा रुख, गंदव पाणि — लगक बटि रहणवालों अर सेंसरों बटि रिपोर्ट।",
};

TRANSLATIONS.bho = {
  ...TRANSLATIONS.hi,
  brand_sub: "पहाड़ी ढहान के पहिले के चेतावनी",
  hero_title: "ढलान खिसके से पहिले पहचानीं।",
  hero_lede: "लाइव बरखा, माटी के गीलापन अउर 25 बरिस के भूस्खलन रिकॉर्ड — रउरा गाँव, सड़क भा कैंप खातिर सीधा भाषा में चेतावनी।",
  panel_useLocation: "हमार जगह इस्तेमाल करीं", panel_checking: "जाँच हो रहल बा…",
  community_lede: "दरार, झुकल गाछ, गंदगी पानी — लगे के रहवासी अउर सेंसर से रिपोर्ट भइल।",
};

TRANSLATIONS.mai = {
  ...TRANSLATIONS.hi,
  brand_sub: "पहाड़ी भूस्खलनक पूर्व चेतावनी",
  hero_title: "ढलान खसबाक पहिने पहिचानू।",
  hero_lede: "लाइव वर्षा, माटिक नमी आ 25 वर्षक भूस्खलन अभिलेख — अपन गाम, सड़क वा शिविर लेल सोझ भाषामे चेतावनी।",
  panel_useLocation: "हमर स्थान उपयोग करू", panel_checking: "जाँच भऽ रहल अछि…",
  community_lede: "दरार, झुकल गाछ, गंदगी पानि — लगक रहवासी आ सेंसर सँ रिपोर्ट कएल गेल।",
};

TRANSLATIONS.mwr = {
  ...TRANSLATIONS.hi,
  brand_sub: "पहाड़ी माटी खिसकण री पैली चेतावणी",
  hero_title: "ढाळ खिसकण सूं पैली पिछाणो।",
  hero_lede: "लाइव बरखा, माटी री सीळप अर 25 बरसां रो भूस्खलन रिकॉर्ड — थांरै गांव, सड़क या पड़ाव सारू सीधी भासा में चेतावणी।",
  panel_useLocation: "म्हारो ठिकाणो काम में लेवो", panel_checking: "जाँच होय रही है…",
  community_lede: "तिड़कां, झुकिया झाड़, गंदो पाणी — नेड़ला बासिन्दां अर सेंसरां सूं रिपोर्ट।",
};

function getTranslation(code){
  return TRANSLATIONS[code] || TRANSLATIONS.en;
}

function applyLanguage(code){
  const meta = LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
  const dict = getTranslation(meta.code);
  const fallback = TRANSLATIONS.en;

  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const text = dict[key] || fallback[key];
    if (text !== undefined) el.textContent = text;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const text = dict[key] || fallback[key];
    if (text !== undefined) el.setAttribute("placeholder", text);
  });

  localStorage.setItem("bhumirakshak_lang", meta.code);
  window.__bhumirakshakDict = dict;
}

function initLanguageSwitcher(selectEl){
  LANGUAGES.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.code;
    opt.textContent = l.beta ? `${l.native} · ${l.english} (beta)` : `${l.native} · ${l.english}`;
    selectEl.appendChild(opt);
  });

  const saved = localStorage.getItem("bhumirakshak_lang") || "en";
  selectEl.value = saved;
  applyLanguage(saved);

  selectEl.addEventListener("change", () => applyLanguage(selectEl.value));
}
