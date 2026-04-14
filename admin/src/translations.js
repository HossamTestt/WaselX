/**
 * Admin Translations — UAE Arabic
 */
export const translations = {
  // Sidebar
  overview: "نظرة عامة",
  users: "المستخدمون",
  marketplace: "السوق",
  shipments: "الشحنات",
  bids: "العروض",
  analytics: "التحليلات",
  commission: "العمولة",
  logout: "تسجيل الخروج",
  adminDashboard: "لوحة التحكم للمسؤول",
  superAdmin: "المسؤول العام",
  
  // Overview
  platformSummary: "ملخص المنصة",
  totalShippers: "إجمالي الشاحنين",
  totalCarriers: "إجمالي الناقلين",
  pendingCarriers: "بانتظار الموافقة",
  totalShipments: "إجمالي الشحنات",
  activeShipments: "الشحنات النشطة",
  deliveredShipments: "تم التوصيل",
  totalRevenue: "إجمالي الإيرادات",
  liveActivity: "نشاط المنصة المباشر",
  noActivity: "لا يوجد نشاط مؤخراً.",
  by: "بواسطة",
  
  // Common Actions
  approve: "موافقة",
  reject: "رفض",
  edit: "تعديل",
  delete: "حذف",
  save: "حفظ",
  cancel: "إلغاء",
  
  // Statuses
  active: "نشط",
  pending: "معلق",
  rejected: "مرفوض",
  delivered: "تم التوصيل",
  inTransit: "في الطريق",
};

export const t = (key) => translations[key] || key;
