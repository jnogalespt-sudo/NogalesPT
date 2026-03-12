import { useState, useEffect } from 'react';
import { GTM_ID } from '../constants';

export const useCookieManager = () => {
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const initGTM = () => {
    if (typeof window === 'undefined' || (window as any).gtmInitialized || cookieConsent !== true) return;
    
    (function(w: any, d: any, s: any, l: any, i: any){
      w[l] = w[l] || [];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l='+l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      if (f && f.parentNode) f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
    
    (window as any).gtmInitialized = true;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedConsent = localStorage.getItem('nogalespt_cookie_consent');
    if (savedConsent === 'accepted') {
      setCookieConsent(true);
    } else if (savedConsent === 'rejected') {
      setCookieConsent(false);
    } else {
      setShowCookieBanner(true);
    }

    const handleOpenBanner = () => setShowCookieBanner(true);
    window.addEventListener('open-cookie-banner', handleOpenBanner);
    return () => window.removeEventListener('open-cookie-banner', handleOpenBanner);
  }, []);

  useEffect(() => {
    if (cookieConsent === true) {
      initGTM();
    }
  }, [cookieConsent]);

  const handleAcceptCookies = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nogalespt_cookie_consent', 'accepted');
    setCookieConsent(true);
    setShowCookieBanner(false);
  };

  const handleRejectCookies = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nogalespt_cookie_consent', 'rejected');
    setCookieConsent(false);
    setShowCookieBanner(false);
  };

  return {
    cookieConsent,
    showCookieBanner,
    handleAcceptCookies,
    handleRejectCookies
  };
};
