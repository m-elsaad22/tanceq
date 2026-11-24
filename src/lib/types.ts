export type SiteStatus = "online" | "offline" | "unknown";

/** تثبيت ووردبريس لركن التطور في دولة واحدة */
export interface CountrySite {
  id: string;
  /** اسم الدولة بالعربية، مثل: السعودية */
  country: string;
  /** رمز الدولة ISO، مثل: SA */
  countryCode: string;
  /** علم الدولة كإيموجي */
  flag: string;
  /** رابط موقع ركن التطور في هذه الدولة */
  url: string;
  /** مسار لوحة تحكم ووردبريس */
  adminPath: string;
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
  lastStatus?: SiteStatus;
}

export interface CountrySiteInput {
  country: string;
  countryCode: string;
  flag?: string;
  url: string;
  adminPath?: string;
  notes?: string;
  color?: string;
}

export const SITE_COLORS = [
  "#0B6E4F",
  "#1B4F72",
  "#8B4513",
  "#6B2D5C",
  "#2C5F2D",
  "#B85C38",
  "#1A535C",
  "#4A3728",
] as const;

/** دول عربية شائعة لركن التطور — يمكن تعديلها أو إضافة المزيد */
export const COUNTRY_PRESETS: Array<{
  country: string;
  countryCode: string;
  flag: string;
  color: string;
}> = [
  { country: "السعودية", countryCode: "SA", flag: "🇸🇦", color: SITE_COLORS[0] },
  { country: "الإمارات", countryCode: "AE", flag: "🇦🇪", color: SITE_COLORS[1] },
  { country: "مصر", countryCode: "EG", flag: "🇪🇬", color: SITE_COLORS[2] },
  { country: "الكويت", countryCode: "KW", flag: "🇰🇼", color: SITE_COLORS[3] },
  { country: "قطر", countryCode: "QA", flag: "🇶🇦", color: SITE_COLORS[4] },
  { country: "البحرين", countryCode: "BH", flag: "🇧🇭", color: SITE_COLORS[5] },
  { country: "عُمان", countryCode: "OM", flag: "🇴🇲", color: SITE_COLORS[6] },
  { country: "الأردن", countryCode: "JO", flag: "🇯🇴", color: SITE_COLORS[7] },
  { country: "المغرب", countryCode: "MA", flag: "🇲🇦", color: SITE_COLORS[0] },
  { country: "العراق", countryCode: "IQ", flag: "🇮🇶", color: SITE_COLORS[1] },
];

export const ADMIN_SHORTCUTS = [
  { id: "dashboard", label: "لوحة التحكم", path: "" },
  { id: "posts", label: "المقالات", path: "edit.php" },
  { id: "pages", label: "الصفحات", path: "edit.php?post_type=page" },
  { id: "media", label: "الوسائط", path: "upload.php" },
  { id: "plugins", label: "الإضافات", path: "plugins.php" },
  { id: "themes", label: "القوالب", path: "themes.php" },
  { id: "users", label: "المستخدمون", path: "users.php" },
  { id: "settings", label: "الإعدادات", path: "options-general.php" },
  { id: "updates", label: "التحديثات", path: "update-core.php" },
] as const;

/** توافق أسماء قديمة إن وُجدت */
export type WordPressSite = CountrySite;
export type SiteInput = CountrySiteInput;
