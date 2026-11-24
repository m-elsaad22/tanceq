export function formatRelativeArabic(iso?: string): string {
  if (!iso) return "لم يُفحص بعد";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "غير معروف";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.round(hours / 24);
  return `منذ ${days} يوم`;
}

export function statusLabel(status?: string): string {
  switch (status) {
    case "online":
      return "متصل";
    case "offline":
      return "غير متصل";
    default:
      return "غير معروف";
  }
}
