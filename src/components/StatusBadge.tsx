
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AttendanceStatus } from "@/types/attendance";

interface StatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap = {
    present: {
      label: "Present",
      className: "status-present",
    },
    absent: {
      label: "Absent",
      className: "status-absent",
    },
    late: {
      label: "Late",
      className: "status-late",
    },
    excused: {
      label: "Excused",
      className: "status-excused",
    },
  };

  const { label, className: statusClassName } = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-normal", statusClassName, className)}
    >
      {label}
    </Badge>
  );
}
