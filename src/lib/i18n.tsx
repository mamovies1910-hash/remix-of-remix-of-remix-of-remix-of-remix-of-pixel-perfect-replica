import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "te";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "te", label: "తెలుగు" },
];

const dict = {
  en: {
    tagline: "Grow Together. Complete Tasks. Earn Rewards.",
    intro: "Join Earn to Each Other, explore available tasks, learn new skills, and track your rewards from one simple dashboard.",
    signupGoogle: "Sign Up with Google", signupEmail: "Sign Up with Email", signupMobile: "Sign Up with Mobile Number",
    haveAccount: "Already have an account?", login: "Log In", logout: "Log Out", terms: "Terms of Service", privacy: "Privacy Policy",
    home: "Home", tasks: "Tasks", learn: "Earn / Learn", profile: "Profile", admin: "Admin",
    welcome: "Welcome back", available: "Available Balance", pending: "Pending Rewards", totalEarned: "Total Rewards Earned",
    pendingNote: "Awaiting verification — not withdrawable yet.", todayActivity: "Today's Activity",
    completedToday: "Completed today", availableToday: "Available tasks", awaiting: "Awaiting review",
    quickActions: "Quick Actions", exploreTasks: "Explore Tasks", watchGuide: "Watch Earning Guide",
    txHistory: "Transaction History", manageProfile: "Manage Profile", viewDetails: "View Details",
    withdraw: "Withdraw", startTask: "Start Task", submitTask: "Submit Task", noTasks: "No tasks available right now. Check back soon.",
    reward: "Reward", minutes: "min", instructions: "Instructions", eligibility: "Eligibility", deadline: "Deadline",
    proof: "Your proof / answer", submit: "Submit", save: "Save", cancel: "Cancel", continue: "Continue",
    notifications: "Notifications", help: "Help Center", language: "Language",
    setupTitle: "Complete your profile", photo: "Profile photo", personal: "Personal information", review: "Review & confirm",
    fullName: "Full name", email: "Email", mobile: "Mobile number", country: "Country", acceptTerms: "I accept the Terms of Service and Privacy Policy",
    toDashboard: "Continue to Dashboard", back: "Back", next: "Next",
    withdrawals: "Withdrawals", payoutMethods: "Payout methods", addMethod: "Add payout method", amount: "Amount",
    fees: "Fees", net: "You will receive", minWithdrawal: "Minimum withdrawal", processing: "Processing time",
    requestWithdrawal: "Request withdrawal", confirm: "Confirm", history: "History", status: "Status",
    howItWorks: "How it works", simNote: "Payouts are processed manually by our team after review.",
  },
  hi: {
    tagline: "साथ बढ़ें। टास्क पूरे करें। रिवॉर्ड कमाएँ।",
    intro: "Earn to Each Other से जुड़ें, उपलब्ध टास्क देखें, नई स्किल सीखें और एक आसान डैशबोर्ड से अपने रिवॉर्ड ट्रैक करें।",
    signupGoogle: "Google से साइन अप करें", signupEmail: "ईमेल से साइन अप करें", signupMobile: "मोबाइल नंबर से साइन अप करें",
    haveAccount: "पहले से अकाउंट है?", login: "लॉग इन", logout: "लॉग आउट", terms: "सेवा की शर्तें", privacy: "गोपनीयता नीति",
    home: "होम", tasks: "टास्क", learn: "कमाएँ / सीखें", profile: "प्रोफ़ाइल", admin: "एडमिन",
    welcome: "फिर से स्वागत है", available: "उपलब्ध बैलेंस", pending: "लंबित रिवॉर्ड", totalEarned: "कुल कमाए रिवॉर्ड",
    pendingNote: "जाँच बाकी है — अभी निकाल नहीं सकते।", todayActivity: "आज की गतिविधि",
    completedToday: "आज पूरे किए", availableToday: "उपलब्ध टास्क", awaiting: "जाँच में",
    quickActions: "त्वरित कार्य", exploreTasks: "टास्क देखें", watchGuide: "गाइड देखें",
    txHistory: "लेन-देन इतिहास", manageProfile: "प्रोफ़ाइल प्रबंधित करें", viewDetails: "विवरण देखें",
    withdraw: "निकासी", startTask: "टास्क शुरू करें", submitTask: "टास्क जमा करें", noTasks: "अभी कोई टास्क उपलब्ध नहीं है।",
    reward: "रिवॉर्ड", minutes: "मिनट", instructions: "निर्देश", eligibility: "पात्रता", deadline: "अंतिम तिथि",
    proof: "आपका प्रमाण / उत्तर", submit: "जमा करें", save: "सेव करें", cancel: "रद्द करें", continue: "आगे बढ़ें",
    notifications: "सूचनाएँ", help: "सहायता केंद्र", language: "भाषा",
    setupTitle: "अपनी प्रोफ़ाइल पूरी करें", photo: "प्रोफ़ाइल फ़ोटो", personal: "व्यक्तिगत जानकारी", review: "जाँचें और पुष्टि करें",
    fullName: "पूरा नाम", email: "ईमेल", mobile: "मोबाइल नंबर", country: "देश", acceptTerms: "मैं सेवा की शर्तें और गोपनीयता नीति स्वीकार करता/करती हूँ",
    toDashboard: "डैशबोर्ड पर जाएँ", back: "पीछे", next: "आगे",
    withdrawals: "निकासी", payoutMethods: "भुगतान तरीके", addMethod: "भुगतान तरीका जोड़ें", amount: "राशि",
    fees: "शुल्क", net: "आपको मिलेगा", minWithdrawal: "न्यूनतम निकासी", processing: "प्रोसेसिंग समय",
    requestWithdrawal: "निकासी का अनुरोध करें", confirm: "पुष्टि करें", history: "इतिहास", status: "स्थिति",
    howItWorks: "यह कैसे काम करता है", simNote: "जाँच के बाद हमारी टीम भुगतान करती है।",
  },
  te: {
    tagline: "కలిసి ఎదగండి. టాస్క్‌లు పూర్తి చేయండి. రివార్డులు పొందండి.",
    intro: "Earn to Each Other లో చేరండి, అందుబాటులో ఉన్న టాస్క్‌లు చూడండి, కొత్త నైపుణ్యాలు నేర్చుకోండి, మీ రివార్డులను ఒకే డాష్‌బోర్డ్‌లో ట్రాక్ చేయండి.",
    signupGoogle: "Google తో సైన్ అప్", signupEmail: "ఇమెయిల్‌తో సైన్ అప్", signupMobile: "మొబైల్ నంబర్‌తో సైన్ అప్",
    haveAccount: "ఇప్పటికే ఖాతా ఉందా?", login: "లాగిన్", logout: "లాగ్ అవుట్", terms: "సేవా నిబంధనలు", privacy: "గోప్యతా విధానం",
    home: "హోమ్", tasks: "టాస్క్‌లు", learn: "సంపాదించండి / నేర్చుకోండి", profile: "ప్రొఫైల్", admin: "అడ్మిన్",
    welcome: "మళ్ళీ స్వాగతం", available: "అందుబాటు బ్యాలెన్స్", pending: "పెండింగ్ రివార్డులు", totalEarned: "మొత్తం రివార్డులు",
    pendingNote: "ధృవీకరణ కోసం వేచి ఉంది — ఇంకా ఉపసంహరించలేరు.", todayActivity: "ఈరోజు కార్యకలాపం",
    completedToday: "ఈరోజు పూర్తి", availableToday: "అందుబాటు టాస్క్‌లు", awaiting: "సమీక్షలో",
    quickActions: "త్వరిత చర్యలు", exploreTasks: "టాస్క్‌లు చూడండి", watchGuide: "గైడ్ చూడండి",
    txHistory: "లావాదేవీల చరిత్ర", manageProfile: "ప్రొఫైల్ నిర్వహణ", viewDetails: "వివరాలు",
    withdraw: "ఉపసంహరణ", startTask: "టాస్క్ ప్రారంభించండి", submitTask: "టాస్క్ సమర్పించండి", noTasks: "ప్రస్తుతం టాస్క్‌లు లేవు.",
    reward: "రివార్డు", minutes: "నిమి", instructions: "సూచనలు", eligibility: "అర్హత", deadline: "గడువు",
    proof: "మీ రుజువు / సమాధానం", submit: "సమర్పించండి", save: "సేవ్", cancel: "రద్దు", continue: "కొనసాగించండి",
    notifications: "నోటిఫికేషన్లు", help: "సహాయ కేంద్రం", language: "భాష",
    setupTitle: "మీ ప్రొఫైల్ పూర్తి చేయండి", photo: "ప్రొఫైల్ ఫోటో", personal: "వ్యక్తిగత సమాచారం", review: "సమీక్షించి నిర్ధారించండి",
    fullName: "పూర్తి పేరు", email: "ఇమెయిల్", mobile: "మొబైల్ నంబర్", country: "దేశం", acceptTerms: "నేను సేవా నిబంధనలు మరియు గోప్యతా విధానాన్ని అంగీకరిస్తున్నాను",
    toDashboard: "డాష్‌బోర్డ్‌కు వెళ్ళండి", back: "వెనుకకు", next: "తదుపరి",
    withdrawals: "ఉపసంహరణలు", payoutMethods: "చెల్లింపు పద్ధతులు", addMethod: "చెల్లింపు పద్ధతి జోడించండి", amount: "మొత్తం",
    fees: "రుసుము", net: "మీకు లభించేది", minWithdrawal: "కనీస ఉపసంహరణ", processing: "ప్రాసెసింగ్ సమయం",
    requestWithdrawal: "ఉపసంహరణ అభ్యర్థన", confirm: "నిర్ధారించండి", history: "చరిత్ర", status: "స్థితి",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది", simNote: "సమీక్ష తర్వాత మా బృందం చెల్లింపులు చేస్తుంది.",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "en", setLang: () => {}, t: (k) => dict.en[k],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("ut-lang") as Lang | null;
    if (s && s in dict) setLangState(s);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("ut-lang", l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[lang][k] ?? dict.en[k] }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
