// Triggers Google Translate via cookie — most reliable method
// langCode: 'en' | 'am' | 'om'
export const changeLanguage = (langCode) => {
  localStorage.setItem('ss_lang', langCode);

  if (langCode === 'en') {
    // Remove the translate cookie to go back to English
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
  } else {
    const val = `/en/${langCode}`;
    document.cookie = `googtrans=${val}; path=/`;
    document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname}`;
  }

  // Reload so Google Translate picks up the cookie
  window.location.reload();
};

export const getSavedLang = () => localStorage.getItem('ss_lang') || 'en';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo' },
];
