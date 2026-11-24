import type { SiteStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function StatusDot({
  status,
  showLabel = false,
}: {
  status?: SiteStatus;
  showLabel?: boolean;
}) {
  const tone =
    status === "online"
      ? "online"
      : status === "offline"
        ? "offline"
        : "unknown";

  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-dot" aria-hidden />
      {showLabel ? statusLabel(status) : null}
    </span>
  );
}
