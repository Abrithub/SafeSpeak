import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'am', label: 'አማ', full: 'አማርኛ' },
  { code: 'om', label: 'OM', full: 'Afaan Oromoo' },
];

export const TRANSLATIONS = {
  en: {
    home: 'Home', faq: 'FAQ', report: 'Report', signIn: 'Sign In',
    howToReport: 'How to Report', myCases: 'My Cases', signUp: 'Sign Up',
    appTagline: 'Secure · Anonymous · Trusted',
    footerEncrypted: '🛡️ All reports are encrypted and secure',
  },
  am: {
    home: 'መነሻ', faq: 'ጥያቄዎች', report: 'ሪፖርት', signIn: 'ግባ',
    howToReport: 'እንዴት ሪፖርት ማድረግ', myCases: 'ጉዳዮቼ', signUp: 'ተመዝገብ',
    appTagline: 'ደህንነቱ የተጠበቀ · ስም-አልባ · ታማኝ',
    footerEncrypted: '🛡️ ሁሉም ሪፖርቶች ተመስጥረዋል',
  },
  om: {
    home: 'Mana', faq: 'Gaaffii', report: 'Gabaasa', signIn: 'Seeni',
    howToReport: 'Akkamitti Gabaasuu', myCases: 'Dhimmoota Koo', signUp: 'Galmaai',
    appTagline: 'Nagaa · Maqaa-Malee · Amanamaa',
    footerEncrypted: '🛡️ Gabaasni hundi nageenyaan eegama',
  },
};

export const getSavedLang = async () => {
  try { return (await AsyncStorage.getItem('ss_lang')) || 'en'; }
  catch { return 'en'; }
};

export const saveLang = async (code) => {
  try { await AsyncStorage.setItem('ss_lang', code); }
  catch {}
};
