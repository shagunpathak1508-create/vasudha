// ─── Bilingual String Map ─────────────────────────────────────────────────────
// Minimal i18n for English & Hindi. No heavy libraries needed.
// Add new keys in both 'en' and 'hi' sections.

import { createContext, useContext, useState, createElement, type ReactNode } from "react";

export type Lang = "en" | "hi";

export const strings = {
  en: {
    // Navigation
    nav_features: "Features",
    nav_earth: "Your Earth",
    nav_dashboard: "Dashboard",
    nav_simulator: "Simulator",
    nav_coach: "Eco Coach",
    nav_challenges: "Challenges",
    nav_history: "History",
    nav_learn: "Learn",

    // Onboarding
    onboarding_title: "Your Earth Journey",
    onboarding_subtitle: "5 quick questions to build your personal Earth profile.",
    onboarding_step: "Step",
    onboarding_of: "of",
    onboarding_next: "Next",
    onboarding_back: "Back",
    onboarding_finish: "Generate My Earth",
    onboarding_q1: "How do you usually get around?",
    onboarding_q2: "What best describes your food habits?",
    onboarding_q3: "How would you describe your electricity usage?",
    onboarding_q4: "How often do you shop for new things?",
    onboarding_q5: "How do you handle waste and recycling?",

    // Options — Transport
    opt_walking: "Walking",
    opt_cycling: "Cycling",
    opt_public: "Public Transport",
    opt_two_wheeler: "Two Wheeler",
    opt_car: "Car",
    opt_flights: "Frequent Flights",

    // Options — Food
    opt_vegetarian: "Vegetarian",
    opt_eggetarian: "Eggetarian",
    opt_mixed: "Mixed Diet",
    opt_heavy_meat: "Frequent Meat",

    // Options — Electricity
    opt_low: "Low Usage",
    opt_average: "Average",
    opt_high: "High Usage",
    opt_heavy_ac: "Heavy AC Usage",

    // Options — Shopping
    opt_rare: "Rarely Buy",
    opt_monthly: "Monthly",
    opt_frequent: "Frequent Shopper",

    // Options — Waste
    opt_always_recycle: "Always Recycle",
    opt_sometimes: "Sometimes",
    opt_rarely_recycle: "Rarely Recycle",

    // Profile / Dashboard
    profile_title: "Your Personal Earth",
    health_index: "Vasudha Health Index",
    earth_thriving: "Thriving Earth",
    earth_balanced: "Balanced Earth",
    earth_struggling: "Struggling Earth",
    earth_critical: "Critical Earth",
    top_source: "Biggest Impact Source",
    potential_improvement: "Potential Improvement",
    go_to_dashboard: "See My Dashboard",

    // Dashboard
    dashboard_title: "Your Earth Dashboard",
    weekly_progress: "Weekly Progress",
    emissions_breakdown: "Emissions Breakdown",
    recommended_actions: "Recommended Actions",
    take_action: "Start Improving",

    // Simulator
    simulator_title: "Future Earth Simulator",
    simulator_subtitle: "Toggle lifestyle changes and watch your Earth transform.",
    current_earth: "Current Earth",
    future_earth: "Future Earth",
    toggle_public_transport: "Use public transport",
    toggle_reduce_ac: "Reduce AC usage",
    toggle_reduce_shopping: "Less online shopping",
    toggle_improve_recycling: "Better recycling",
    toggle_plant_based: "Plant-based meals",
    timeline_today: "Today",
    timeline_6m: "6 Months",
    timeline_1y: "1 Year",
    timeline_3y: "3 Years",
    carbon_reduction: "Carbon Reduction",
    trees_equivalent: "Trees Equivalent",
    co2_saved: "CO₂ Saved",

    // Coach
    coach_title: "Eco Coach",
    coach_subtitle: "Your personal sustainability guide",
    coach_placeholder: "Ask me about sustainable living…",
    coach_send: "Send",
    coach_clear: "Clear chat",
    coach_prompt_1: "How do I reduce transport emissions?",
    coach_prompt_2: "Simple plant-based meal ideas",
    coach_prompt_3: "Save electricity at home",
    coach_prompt_4: "Best recycling practices",

    // Challenges
    challenges_title: "Weekly Eco Challenges",
    challenge_join: "Join Challenge",
    challenge_active: "Active",
    challenge_completed: "Completed! 🎉",
    challenge_days: "days done",
    challenge_badge: "Badge Earned",

    // Learn
    learn_title: "What is a Carbon Footprint?",
    learn_subtitle: "Tap a category to explore",
    learn_transport: "Transportation",
    learn_energy: "Home Energy",
    learn_food: "Food",
    learn_shopping: "Shopping",
    learn_waste: "Waste",
    learn_impact: "Why it matters",
    learn_improve: "Easy wins",

    // History
    history_title: "Impact History",
    history_subtitle: "Your sustainability journey over time",
    history_no_data: "Complete onboarding to see your history",
  },
  hi: {
    // Navigation
    nav_features: "विशेषताएं",
    nav_earth: "आपकी पृथ्वी",
    nav_dashboard: "डैशबोर्ड",
    nav_simulator: "सिम्युलेटर",
    nav_coach: "इको कोच",
    nav_challenges: "चुनौतियां",
    nav_history: "इतिहास",
    nav_learn: "जानें",

    // Onboarding
    onboarding_title: "आपकी पृथ्वी यात्रा",
    onboarding_subtitle: "अपनी व्यक्तिगत पृथ्वी प्रोफ़ाइल बनाने के लिए 5 सवाल।",
    onboarding_step: "चरण",
    onboarding_of: "में से",
    onboarding_next: "आगे",
    onboarding_back: "वापस",
    onboarding_finish: "मेरी पृथ्वी बनाएं",
    onboarding_q1: "आप आमतौर पर कैसे यात्रा करते हैं?",
    onboarding_q2: "आपकी खान-पान की आदतें कैसी हैं?",
    onboarding_q3: "आपका बिजली उपयोग कैसा है?",
    onboarding_q4: "आप कितनी बार नई चीजें खरीदते हैं?",
    onboarding_q5: "आप कचरे और रीसाइक्लिंग को कैसे संभालते हैं?",

    // Options — Transport
    opt_walking: "पैदल",
    opt_cycling: "साइकिल",
    opt_public: "सार्वजनिक परिवहन",
    opt_two_wheeler: "दो पहिया वाहन",
    opt_car: "कार",
    opt_flights: "बार-बार उड़ान",

    // Options — Food
    opt_vegetarian: "शाकाहारी",
    opt_eggetarian: "अंडेहारी",
    opt_mixed: "मिश्रित आहार",
    opt_heavy_meat: "अधिक मांस",

    // Options — Electricity
    opt_low: "कम उपयोग",
    opt_average: "सामान्य",
    opt_high: "अधिक उपयोग",
    opt_heavy_ac: "भारी AC उपयोग",

    // Options — Shopping
    opt_rare: "कभी-कभी खरीदते हैं",
    opt_monthly: "मासिक",
    opt_frequent: "बार-बार खरीदना",

    // Options — Waste
    opt_always_recycle: "हमेशा रीसायकल करते हैं",
    opt_sometimes: "कभी-कभी",
    opt_rarely_recycle: "शायद ही कभी",

    // Profile / Dashboard
    profile_title: "आपकी व्यक्तिगत पृथ्वी",
    health_index: "वसुधा स्वास्थ्य सूचकांक",
    earth_thriving: "फलती-फूलती पृथ्वी",
    earth_balanced: "संतुलित पृथ्वी",
    earth_struggling: "संघर्षरत पृथ्वी",
    earth_critical: "गंभीर पृथ्वी",
    top_source: "सबसे बड़ा प्रभाव स्रोत",
    potential_improvement: "संभावित सुधार",
    go_to_dashboard: "मेरा डैशबोर्ड देखें",

    // Dashboard
    dashboard_title: "आपका पृथ्वी डैशबोर्ड",
    weekly_progress: "साप्ताहिक प्रगति",
    emissions_breakdown: "उत्सर्जन विवरण",
    recommended_actions: "अनुशंसित कार्य",
    take_action: "सुधार शुरू करें",

    // Simulator
    simulator_title: "भविष्य की पृथ्वी सिम्युलेटर",
    simulator_subtitle: "जीवनशैली बदलें और अपनी पृथ्वी को बदलते देखें।",
    current_earth: "वर्तमान पृथ्वी",
    future_earth: "भविष्य की पृथ्वी",
    toggle_public_transport: "सार्वजनिक परिवहन उपयोग करें",
    toggle_reduce_ac: "AC कम करें",
    toggle_reduce_shopping: "कम ऑनलाइन खरीदारी",
    toggle_improve_recycling: "बेहतर रीसाइक्लिंग",
    toggle_plant_based: "पौधे-आधारित भोजन",
    timeline_today: "आज",
    timeline_6m: "6 महीने",
    timeline_1y: "1 साल",
    timeline_3y: "3 साल",
    carbon_reduction: "कार्बन कमी",
    trees_equivalent: "समतुल्य पेड़",
    co2_saved: "CO₂ बचाया",

    // Coach
    coach_title: "इको कोच",
    coach_subtitle: "आपका व्यक्तिगत स्थिरता गाइड",
    coach_placeholder: "टिकाऊ जीवन के बारे में पूछें…",
    coach_send: "भेजें",
    coach_clear: "चैट साफ़ करें",
    coach_prompt_1: "परिवहन उत्सर्जन कैसे कम करें?",
    coach_prompt_2: "सरल पौधे-आधारित भोजन विचार",
    coach_prompt_3: "घर पर बिजली बचाएं",
    coach_prompt_4: "सर्वोत्तम रीसाइक्लिंग अभ्यास",

    // Challenges
    challenges_title: "साप्ताहिक इको चुनौतियां",
    challenge_join: "चुनौती लें",
    challenge_active: "सक्रिय",
    challenge_completed: "पूर्ण! 🎉",
    challenge_days: "दिन पूरे",
    challenge_badge: "बैज अर्जित",

    // Learn
    learn_title: "कार्बन फुटप्रिंट क्या है?",
    learn_subtitle: "जानने के लिए एक श्रेणी चुनें",
    learn_transport: "परिवहन",
    learn_energy: "घरेलू ऊर्जा",
    learn_food: "भोजन",
    learn_shopping: "खरीदारी",
    learn_waste: "कचरा",
    learn_impact: "यह क्यों मायने रखता है",
    learn_improve: "आसान सुधार",

    // History
    history_title: "प्रभाव इतिहास",
    history_subtitle: "समय के साथ आपकी स्थिरता यात्रा",
    history_no_data: "अपना इतिहास देखने के लिए ऑनबोर्डिंग पूरी करें",
  },
} as const;

export type StringKey = keyof typeof strings.en;

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => strings.en[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: StringKey): string => strings[lang][key] ?? strings.en[key];
  return createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useTranslation() {
  return useContext(I18nContext);
}
