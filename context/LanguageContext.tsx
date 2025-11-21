
import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'en' | 'hi' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isIndic: boolean; // To help with font switching
}

const translations = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.analyze": "Analyze",
    "nav.profile": "My Profile",
    "nav.login": "Log In",
    "nav.signup": "Sign Up",
    "nav.logout": "Sign Out",
    
    // Home Hero
    "hero.badge": "AI-Powered Crop Protection",
    "hero.title.1": "Your Pocket",
    "hero.title.2": "Agronomist.",
    "hero.subtitle": "Diagnose crop diseases, get weather-smart treatments, and protect your yield—all from a single photo.",
    "hero.cta.detect": "Detect Disease Now",
    "hero.cta.demo": "Watch Demo",
    "hero.stat.accuracy": "Accuracy",
    "hero.stat.farmers": "Farmers",
    "hero.stat.access": "Access",
    
    // Home Features
    "feat.detect": "Smart Pest Detection",
    "feat.weather": "Weather-Based Treatments",
    "feat.protect": "Protect Your Yield",
    
    // Home New Sections (Marketing)
    "why.title": "Why Farmers Choose CropShield?",
    "why.subtitle": "Farming is hard. We make the science easy, accessible, and local.",
    "why.1.title": "Speaks Your Language",
    "why.1.desc": "No English needed. Use the app in Hindi, Bengali, or regional languages. Ask questions by voice.",
    "why.2.title": "Works Offline",
    "why.2.desc": "Low network in the field? No problem. Our lightweight mode works on slow internet.",
    "why.3.title": "Zero Cost Advice",
    "why.3.desc": "Expert agronomist advice is expensive. CropShield is free for small farmers.",
    "why.4.title": "Find Genuine Medicine",
    "why.4.desc": "Don't get tricked by fake products. We guide you to verified local shops.",

    // Testimonials
    "trust.title": "Trusted by the Community",
    "trust.1.name": "Rajesh Kumar",
    "trust.1.loc": "Potato Farmer, UP",
    "trust.1.quote": "Earlier I used to spray wrong medicines and lose money. Now I take a photo, and CropShield tells me exactly what to buy. My yield increased by 30%.",
    "trust.2.name": "Anjali Devi",
    "trust.2.loc": "Rice Farmer, West Bengal",
    "trust.2.quote": "The voice feature is a blessing. I cannot read English well, but Kisan Sahayak speaks to me in Bengali and explains everything clearly.",
    "trust.3.name": "Vikram Singh",
    "trust.3.loc": "Cotton Farmer, Punjab",
    "trust.3.quote": "It not only finds the pest but also tells me if rain is coming so I don't waste fertilizer. Best app for modern farming.",

    // Steps
    "step.snap": "Snap",
    "step.snap.desc": "Take a clear photo of the affected plant part.",
    "step.scan": "Scan",
    "step.scan.desc": "AI analyzes the image for pests and diseases.",
    "step.solve": "Solve",
    "step.solve.desc": "Get a custom treatment plan instantly.",

    // Detect Page
    "detect.title": "Farmer's Assistant",
    "detect.subtitle": "Upload a photo or take a picture. Get advice in your language.",
    "detect.drop": "Drop image here",
    "detect.upload": "Upload Crop Photo",
    "detect.drag": "Drag & drop or choose an option below",
    "detect.btn.file": "Select File",
    "detect.btn.camera": "Take Photo",
    "detect.btn.remove": "Remove Photo",
    "detect.btn.analyze": "Analyze Crop",
    "detect.btn.analyzing": "Identifying...",
    "detect.btn.consulting": "Consulting Expert...",
    "detect.btn.again": "Analyze Again",
    "detect.error.img": "Please upload a valid image file.",
    "detect.error.id": "Could not identify crop. Please ensure the photo is clear.",
    "detect.promo.save": "Save your Farm History",
    "detect.promo.desc": "Create a free account to track diseases and treatments over time.",
    "detect.promo.btn": "Sign Up Free",

    // Result Card
    "result.conf": "Confidence",
    "result.diag": "Diagnosis & Advice",
    "result.audio.gen": "Generate Audio Advice",
    "result.audio.play": "Play Audio",
    "result.audio.pause": "Pause",
    "result.sev": "Severity",
    "result.risk": "Weather Risk",
    "result.organic": "Gharelu Upay (Organic)",
    "result.organic.rec": "Recommended First",
    "result.cost.low": "Low Cost / Free",
    "result.chem": "Chemical Treatment",
    "result.chem.name": "Chemical Name",
    "result.chem.brand": "Recommended Brands",
    "result.chem.dosage": "Dosage",
    "result.chem.cost": "Est. Cost",
    "result.shop.find": "Find Shops Nearby",
    "result.shop.locating": "Locating Shops...",
    "result.shop.hide": "Hide Nearby Shops",
    "result.shop.show": "Show Nearby Shops",
    "result.safe": "Savdhani (Caution)",
    "result.chat.title": "Kisan Sahayak",
    "result.chat.subtitle": "Ask follow-up questions",
    "result.chat.placeholder": "Ask about prices, usage, etc...",
    "result.chat.connected": "Web Connected",

    // Auth
    "auth.welcome": "Welcome Back",
    "auth.login.subtitle": "Log in to access your farm dashboard",
    "auth.join": "Join CropShield",
    "auth.join.subtitle": "Start protecting your harvest today",
    "auth.name": "Full Name",
    "auth.email": "Email Address",
    "auth.pass": "Password",
    "auth.loc": "Farm Location",
    "auth.size": "Size (Acres)",
    "auth.crops": "Main Crops",
    "auth.btn.login": "Log In",
    "auth.btn.signup": "Create Account",
    "auth.have_acct": "Already have an account?",
    "auth.no_acct": "Don't have an account?",
    "auth.link.login": "Log in here",
    "auth.link.signup": "Sign up free",

    // Profile
    "profile.scans": "Total Scans",
    "profile.issues": "Issues Detected",
    "profile.healthy": "Healthy Crops",
    "profile.history": "Recent Analysis History",
    "profile.no_history": "No history yet",
    "profile.start": "Start Your First Scan",
    "profile.view": "View Report",
    
    // FAQ
    "faq.title": "Common Questions",
    "faq.1.q": "Is this app really free?",
    "faq.1.a": "Yes, identifying pests and getting basic treatment advice is 100% free for farmers.",
    "faq.2.q": "Does it work without internet?",
    "faq.2.a": "You need internet to analyze the photo, but you can view saved reports offline.",
    "faq.3.q": "What crops does it support?",
    "faq.3.a": "We support all major Indian crops including Wheat, Rice, Corn, Potato, Tomato, and Cotton."
  },
  hi: {
    // Nav
    "nav.home": "होम",
    "nav.analyze": "फसल जांच",
    "nav.profile": "मेरी प्रोफाइल",
    "nav.login": "लॉग इन",
    "nav.signup": "साइन अप",
    "nav.logout": "लॉग आउट",

    // Home
    "hero.badge": "एआई-संचालित फसल सुरक्षा",
    "hero.title.1": "आपका डिजिटल",
    "hero.title.2": "कृषि मित्र",
    "hero.subtitle": "फसल रोगों की पहचान करें, मौसम-आधारित उपचार प्राप्त करें और अपनी पैदावार बचाएं—सिर्फ एक फोटो से।",
    "hero.cta.detect": "बीमारी का पता लगाएं",
    "hero.cta.demo": "डेमो देखें",
    "hero.stat.accuracy": "सटीकता",
    "hero.stat.farmers": "किसान",
    "hero.stat.access": "उपयोग",

    // Features
    "feat.detect": "स्मार्ट कीट पहचान",
    "feat.weather": "मौसम-आधारित उपचार",
    "feat.protect": "अपनी फसल बचाएं",
    
    // Home New Sections
    "why.title": "किसान CropShield क्यों चुनते हैं?",
    "why.subtitle": "खेती कठिन है। हम विज्ञान को आसान और सुलभ बनाते हैं।",
    "why.1.title": "आपकी भाषा बोलता है",
    "why.1.desc": "अंग्रेजी की जरूरत नहीं। ऐप का उपयोग हिंदी, बंगाली या क्षेत्रीय भाषाओं में करें। बोलकर सवाल पूछें।",
    "why.2.title": "कम नेटवर्क में काम करता है",
    "why.2.desc": "खेत में नेटवर्क कम है? कोई समस्या नहीं। हमारा ऐप 2G/3G स्पीड पर भी काम करता है।",
    "why.3.title": "मुफ्त विशेषज्ञ सलाह",
    "why.3.desc": "विशेषज्ञ की सलाह महंगी होती है। छोटे किसानों के लिए CropShield पूरी तरह मुफ्त है।",
    "why.4.title": "सही दवा खोजें",
    "why.4.desc": "नकली उत्पादों से बचें। हम आपको प्रमाणित स्थानीय दुकानों का रास्ता दिखाते हैं।",

    // Testimonials
    "trust.title": "समुदाय का भरोसा",
    "trust.1.name": "राजेश कुमार",
    "trust.1.loc": "आलू किसान, उत्तर प्रदेश",
    "trust.1.quote": "पहले मैं गलत दवाएं छिड़कता था और पैसा बर्बाद करता था। अब मैं फोटो लेता हूं और ऐप मुझे बताता है कि क्या खरीदना है। मेरी पैदावार 30% बढ़ी है।",
    "trust.2.name": "अंजलि देवी",
    "trust.2.loc": "धान किसान, पश्चिम बंगाल",
    "trust.2.quote": "आवाज की सुविधा एक वरदान है। मैं अंग्रेजी नहीं पढ़ सकती, लेकिन किसान सहायक मुझसे बात करता है और सब कुछ स्पष्ट रूप से समझाता है।",
    "trust.3.name": "विक्रम सिंह",
    "trust.3.loc": "कपास किसान, पंजाब",
    "trust.3.quote": "यह न केवल कीट ढूंढता है बल्कि मुझे बारिश के बारे में भी बताता है ताकि मैं खाद बर्बाद न करूं। आधुनिक खेती के लिए सबसे अच्छा ऐप।",


    // Steps
    "step.snap": "फोटो लें",
    "step.snap.desc": "प्रभावित पौधे के हिस्से की साफ तस्वीर लें।",
    "step.scan": "स्कैन करें",
    "step.scan.desc": "एआई कीटों और बीमारियों के लिए छवि का विश्लेषण करता है।",
    "step.solve": "समाधान",
    "step.solve.desc": "तुरंत उपचार योजना प्राप्त करें।",

    // Detect
    "detect.title": "किसान सहायक",
    "detect.subtitle": "फोटो अपलोड करें या तस्वीर लें। अपनी भाषा में सलाह प्राप्त करें।",
    "detect.drop": "यहाँ इमेज डालें",
    "detect.upload": "फसल की फोटो अपलोड करें",
    "detect.drag": "ड्रैग करें या नीचे विकल्प चुनें",
    "detect.btn.file": "फ़ाइल चुनें",
    "detect.btn.camera": "फोटो खींचें",
    "detect.btn.remove": "फोटो हटाएं",
    "detect.btn.analyze": "फसल की जाँच करें",
    "detect.btn.analyzing": "पहचान की जा रही है...",
    "detect.btn.consulting": "विशेषज्ञ से सलाह ले रहे हैं...",
    "detect.btn.again": "फिर से जाँच करें",
    "detect.error.img": "कृपया एक मान्य छवि फ़ाइल अपलोड करें।",
    "detect.error.id": "फसल की पहचान नहीं हो सकी। कृपया सुनिश्चित करें कि फोटो साफ है।",
    "detect.promo.save": "अपना फार्म इतिहास सहेजें",
    "detect.promo.desc": "समय के साथ बीमारियों और उपचारों को ट्रैक करने के लिए मुफ्त खाता बनाएं।",
    "detect.promo.btn": "मुफ्त साइन अप करें",

    // Result Card
    "result.conf": "विश्वास स्तर",
    "result.diag": "निदान और सलाह",
    "result.audio.gen": "ऑडियो सलाह सुनें",
    "result.audio.play": "ऑडियो चलाएं",
    "result.audio.pause": "रोकें",
    "result.sev": "गंभीरता",
    "result.risk": "मौसम जोखिम",
    "result.organic": "घरेलू उपाय (जैविक)",
    "result.organic.rec": "पहली सिफारिश",
    "result.cost.low": "कम लागत / मुफ्त",
    "result.chem": "रासायनिक उपचार",
    "result.chem.name": "रसायन का नाम",
    "result.chem.brand": "सुझाए गए ब्रांड",
    "result.chem.dosage": "मात्रा",
    "result.chem.cost": "अनुमानित लागत",
    "result.shop.find": "आसपास की दुकानें खोजें",
    "result.shop.locating": "दुकानें खोज रहे हैं...",
    "result.shop.hide": "दुकानें छिपाएं",
    "result.shop.show": "दुकानें देखें",
    "result.safe": "सावधानी",
    "result.chat.title": "किसान सहायक",
    "result.chat.subtitle": "और सवाल पूछें",
    "result.chat.placeholder": "कीमत, उपयोग आदि के बारे में पूछें...",
    "result.chat.connected": "इंटरनेट कनेक्टेड",

    // Auth
    "auth.welcome": "वापसी पर स्वागत है",
    "auth.login.subtitle": "अपने फार्म डैशबोर्ड तक पहुँचने के लिए लॉग इन करें",
    "auth.join": "CropShield से जुड़ें",
    "auth.join.subtitle": "आज ही अपनी फसल की सुरक्षा शुरू करें",
    "auth.name": "पूरा नाम",
    "auth.email": "ईमेल पता",
    "auth.pass": "पासवर्ड",
    "auth.loc": "खेत का स्थान",
    "auth.size": "आकार (एकड़)",
    "auth.crops": "मुख्य फसलें",
    "auth.btn.login": "लॉग इन करें",
    "auth.btn.signup": "खाता बनाएं",
    "auth.have_acct": "क्या आपके पास पहले से एक खाता है?",
    "auth.no_acct": "क्या आपके पास खाता नहीं है?",
    "auth.link.login": "यहाँ लॉग इन करें",
    "auth.link.signup": "मुफ्त साइन अप करें",

    // Profile
    "profile.scans": "कुल स्कैन",
    "profile.issues": "पाई गई समस्याएं",
    "profile.healthy": "स्वस्थ फसलें",
    "profile.history": "हाल का विश्लेषण इतिहास",
    "profile.no_history": "अभी तक कोई इतिहास नहीं",
    "profile.start": "अपना पहला स्कैन शुरू करें",
    "profile.view": "रिपोर्ट देखें",
    
    // FAQ
    "faq.title": "सामान्य सवाल",
    "faq.1.q": "क्या यह ऐप वास्तव में मुफ्त है?",
    "faq.1.a": "हां, कीटों की पहचान करना और बुनियादी उपचार सलाह प्राप्त करना किसानों के लिए 100% मुफ्त है।",
    "faq.2.q": "क्या यह बिना इंटरनेट के काम करता है?",
    "faq.2.a": "फोटो का विश्लेषण करने के लिए आपको इंटरनेट की आवश्यकता है, लेकिन आप सहेजी गई रिपोर्ट ऑफ़लाइन देख सकते हैं।",
    "faq.3.q": "यह किन फसलों का समर्थन करता है?",
    "faq.3.a": "हम गेहूं, चावल, मक्का, आलू, टमाटर और कपास सहित सभी प्रमुख भारतीय फसलों का समर्थन करते हैं।"
  },
  bn: {
    // Nav
    "nav.home": "হোম",
    "nav.analyze": "ফসল যাচাই",
    "nav.profile": "প্রোফাইল",
    "nav.login": "লগ ইন",
    "nav.signup": "সাইন আপ",
    "nav.logout": "লগ আউট",

    // Home
    "hero.badge": "এআই-চালিত শস্য সুরক্ষা",
    "hero.title.1": "আপনার পকেটে",
    "hero.title.2": "কৃষি বিশেষজ্ঞ",
    "hero.subtitle": "ফসলের রোগ নির্ণয় করুন, আবহাওয়া-ভিত্তিক চিকিৎসা পান এবং আপনার ফলন রক্ষা করুন—শুধুমাত্র একটি ছবি দিয়ে।",
    "hero.cta.detect": "রোগ শনাক্ত করুন",
    "hero.cta.demo": "ডেমো দেখুন",
    "hero.stat.accuracy": "নির্ভুলতা",
    "hero.stat.farmers": "কৃষক",
    "hero.stat.access": "অ্যাক্সেস",

    // Features
    "feat.detect": "স্মার্ট পোকা শনাক্তকরণ",
    "feat.weather": "আবহাওয়া ভিত্তিক চিকিৎসা",
    "feat.protect": "আপনার ফলন রক্ষা করুন",
    
    // Home New Sections
    "why.title": "কেন কৃষকরা CropShield বেছে নেন?",
    "why.subtitle": "চাষাবাদ কঠিন। আমরা বিজ্ঞানকে সহজ এবং সহজলভ্য করি।",
    "why.1.title": "আপনার ভাষায় কথা বলে",
    "why.1.desc": "ইংরেজির দরকার নেই। হিন্দি, বাংলা বা আঞ্চলিক ভাষায় অ্যাপটি ব্যবহার করুন। মুখে বলে প্রশ্ন করুন।",
    "why.2.title": "অফলাইনে কাজ করে",
    "why.2.desc": "মাঠে নেটওয়ার্ক কম? সমস্যা নেই। আমাদের অ্যাপ 2G/3G স্পিডেও কাজ করে।",
    "why.3.title": "বিনামূল্যে বিশেষজ্ঞ পরামর্শ",
    "why.3.desc": "বিশেষজ্ঞ পরামর্শ ব্যয়বহুল। ছোট কৃষকদের জন্য CropShield সম্পূর্ণ বিনামূল্যে।",
    "why.4.title": "সঠিক ওষুধ খুঁজুন",
    "why.4.desc": "নকল পণ্য থেকে সাবধান। আমরা আপনাকে যাচাইকৃত স্থানীয় দোকানের সন্ধান দিই।",

    // Testimonials
    "trust.title": "সম্প্রদায়ের বিশ্বাস",
    "trust.1.name": "রাজেশ কুমার",
    "trust.1.loc": "আলু চাষী, উত্তর প্রদেশ",
    "trust.1.quote": "আগে আমি ভুল ওষুধ স্প্রে করতাম এবং টাকা নষ্ট করতাম। এখন আমি ছবি তুলি এবং অ্যাপ আমাকে বলে কী কিনতে হবে। আমার ফলন ৩০% বেড়েছে।",
    "trust.2.name": "অঞ্জলি দেবী",
    "trust.2.loc": "ধান চাষী, পশ্চিমবঙ্গ",
    "trust.2.quote": "ভয়েস ফিচারটি একটি আশীর্বাদ। আমি ইংরেজি পড়তে পারি না, কিন্তু কৃষক সহায়ক আমার সাথে বাংলায় কথা বলে এবং সব কিছু পরিষ্কারভাবে বুঝিয়ে দেয়।",
    "trust.3.name": "বিক্রম সিং",
    "trust.3.loc": "তুলা চাষী, পাঞ্জাব",
    "trust.3.quote": "এটি কেবল পোকা খুঁজে পায় না, বৃষ্টির পূর্বাভাসও দেয় যাতে আমি সার নষ্ট না করি। আধুনিক চাষাবাদের জন্য সেরা অ্যাপ।",


    // Steps
    "step.snap": "ছবি তুলুন",
    "step.snap.desc": "আক্রান্ত গাছের অংশের পরিষ্কার ছবি তুলুন।",
    "step.scan": "স্ক্যান",
    "step.scan.desc": "এআই পোকা এবং রোগের জন্য ছবি বিশ্লেষণ করে।",
    "step.solve": "সমাধান",
    "step.solve.desc": "তাত্ক্ষণিক চিকিৎসা পরিকল্পনা পান।",

    // Detect
    "detect.title": "কৃষক সহকারী",
    "detect.subtitle": "ছবি আপলোড করুন বা তুলুন। আপনার ভাষায় পরামর্শ পান।",
    "detect.drop": "এখানে ছবি দিন",
    "detect.upload": "ফসলের ছবি আপলোড করুন",
    "detect.drag": "ড্র্যাগ করুন বা নিচে নির্বাচন করুন",
    "detect.btn.file": "ফাইল নির্বাচন",
    "detect.btn.camera": "ছবি তুলুন",
    "detect.btn.remove": "ছবি সরান",
    "detect.btn.analyze": "ফসল যাচাই করুন",
    "detect.btn.analyzing": "শনাক্ত করা হচ্ছে...",
    "detect.btn.consulting": "বিশেষজ্ঞ পরামর্শ নেওয়া হচ্ছে...",
    "detect.btn.again": "আবার যাচাই করুন",
    "detect.error.img": "অনুগ্রহ করে একটি সঠিক ছবি আপলোড করুন।",
    "detect.error.id": "ফসল শনাক্ত করা যায়নি। অনুগ্রহ করে নিশ্চিত করুন ছবিটি পরিষ্কার।",
    "detect.promo.save": "আপনার খামারের ইতিহাস সংরক্ষণ করুন",
    "detect.promo.desc": "সময়ের সাথে রোগ এবং চিকিৎসা ট্র্যাক করতে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।",
    "detect.promo.btn": "ফ্রি সাইন আপ",

    // Result Card
    "result.conf": "আত্মবিশ্বাস",
    "result.diag": "রোগ নির্ণয় ও পরামর্শ",
    "result.audio.gen": "অডিও পরামর্শ শুনুন",
    "result.audio.play": "অডিও চালান",
    "result.audio.pause": "থামুন",
    "result.sev": "তীব্রতা",
    "result.risk": "আবহাওয়া ঝুঁকি",
    "result.organic": "ঘরোয়া উপায় (জৈব)",
    "result.organic.rec": "প্রথম সুপারিশ",
    "result.cost.low": "কম খরচ / বিনামূল্যে",
    "result.chem": "রাসায়নিক চিকিৎসা",
    "result.chem.name": "রাসায়নিক নাম",
    "result.chem.brand": "সুপারিশকৃত ব্র্যান্ড",
    "result.chem.dosage": "মাত্রা",
    "result.chem.cost": "আনুমানিক খরচ",
    "result.shop.find": "কাছাকাছি দোকান খুঁজুন",
    "result.shop.locating": "দোকান খোঁজা হচ্ছে...",
    "result.shop.hide": "দোকান লুকান",
    "result.shop.show": "দোকান দেখুন",
    "result.safe": "সাবধানতা",
    "result.chat.title": "কৃষক সহায়ক",
    "result.chat.subtitle": "আরও প্রশ্ন করুন",
    "result.chat.placeholder": "দাম, ব্যবহার ইত্যাদি সম্পর্কে জিজ্ঞাসা করুন...",
    "result.chat.connected": "ইন্টারনেট সংযুক্ত",

    // Auth
    "auth.welcome": "স্বাগতম",
    "auth.login.subtitle": "আপনার খামার ড্যাশবোর্ড অ্যাক্সেস করতে লগ ইন করুন",
    "auth.join": "CropShield-এ যোগ দিন",
    "auth.join.subtitle": "আজই আপনার ফসল সুরক্ষা শুরু করুন",
    "auth.name": "পুরো নাম",
    "auth.email": "ইমেল ঠিকানা",
    "auth.pass": "পাসওয়ার্ড",
    "auth.loc": "খামারের অবস্থান",
    "auth.size": "আকার (একর)",
    "auth.crops": "প্রধান ফসল",
    "auth.btn.login": "লগ ইন",
    "auth.btn.signup": "অ্যাকাউন্ট তৈরি করুন",
    "auth.have_acct": "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
    "auth.no_acct": "কোন অ্যাকাউন্ট নেই?",
    "auth.link.login": "এখানে লগ ইন করুন",
    "auth.link.signup": "ফ্রি সাইন আপ",

    // Profile
    "profile.scans": "মোট স্ক্যান",
    "profile.issues": "শনাক্ত সমস্যা",
    "profile.healthy": "সুস্থ ফসল",
    "profile.history": "সাম্প্রতিক বিশ্লেষণের ইতিহাস",
    "profile.no_history": "এখনও কোন ইতিহাস নেই",
    "profile.start": "প্রথম স্ক্যান শুরু করুন",
    "profile.view": "রিপোর্ট দেখুন",

    // FAQ
    "faq.title": "সাধারণ প্রশ্ন",
    "faq.1.q": "এই অ্যাপটি কি সত্যিই বিনামূল্যে?",
    "faq.1.a": "হ্যাঁ, রোগ শনাক্তকরণ এবং প্রাথমিক চিকিৎসা পরামর্শ কৃষকদের জন্য ১০০% বিনামূল্যে।",
    "faq.2.q": "এটি কি ইন্টারনেট ছাড়া কাজ করে?",
    "faq.2.a": "ছবি বিশ্লেষণ করতে ইন্টারনেট প্রয়োজন, তবে আপনি সংরক্ষিত রিপোর্ট অফলাইনে দেখতে পারেন।",
    "faq.3.q": "এটি কোন ফসল সমর্থন করে?",
    "faq.3.a": "আমরা গম, ধান, ভুট্টা, আলু, টমেটো এবং তুলা সহ সমস্ত প্রধান ভারতীয় ফসল সমর্থন করি।"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('cropShield_lang') as Language;
    if (storedLang && ['en', 'hi', 'bn'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('cropShield_lang', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  const isIndic = language === 'hi' || language === 'bn';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isIndic }}>
      <div className={isIndic ? 'font-bengali' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
