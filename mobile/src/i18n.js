import { I18nManager } from 'react-native';

// Arabic Translations
export const translations = {
  // Auth
  welcome: "مرحباً بك في واصل إكس",
  tagline: "حلولك اللوجستية المتكاملة في الإمارات",
  getStarted: "ابدأ الآن",
  login: "تسجيل الدخول",
  register: "إنشاء حساب",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  
  // Roles
  shipper: "شاحن",
  carrier: "ناقل / سائق",
  
  // Tabs
  dashboard: "الرئيسية",
  shipments: "الشحنات",
  history: "السجل",
  profile: "الحساب",
  market: "السوق",
  
  // Actions
  createShipment: "إنشاء شحنة جديدة",
  makeOffer: "تقديم عرض",
  acceptBid: "قبول العرض",
  track: "تتبع",
  
  // Status
  available: "متوفر",
  busy: "مشغول",
  onTrip: "في رحلة",
  delivered: "تم التوصيل",
  inTransit: "في الطريق",
  assigned: "تم التعيين",
};

export const t = (key) => translations[key] || key;

/**
 * Initialize RTL support for Arabic
 */
export const initI18n = async () => {
  const isRTL = true; // Always Arabic for this version
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Restart might be needed on real devices, but on web/expo dev it usually adapts
    // Updates.reloadAsync();
  }
};
