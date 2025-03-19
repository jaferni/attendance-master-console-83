
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AttendanceRecord } from "@/types/attendance";
import { format } from "date-fns";
import { useState } from "react";

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
  className?: string;
}

export function AttendanceCalendar({
  attendanceRecords,
  className,
}: AttendanceCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());

  // Map attendance records to the format needed for highlighting days
  const attendanceDates = attendanceRecords.reduce((acc, record) => {
    const dateStr = format(new Date(record.date), "yyyy-MM-dd");
    acc[dateStr] = record.status;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className={cn("space-y-4", className)}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={(date) => date && setDate(date)}
        className="rounded-md border p-3 pointer-events-auto"
        modifiers={{
          present: (date) => 
            attendanceDates[format(date, "yyyy-MM-dd")] === "present",
          absent: (date) => 
            attendanceDates[format(date, "yyyy-MM-dd")] === "absent",
          late: (date) => 
            attendanceDates[format(date, "yyyy-MM-dd")] === "late",
          excused: (date) => 
            attendanceDates[format(date, "yyyy-MM-dd")] === "excused",
        }}
        modifiersClassNames={{
          present: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
          absent: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
          late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
          excused: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        }}
      />
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="text-sm">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-sm">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-sm">Excused</span>
        </div>
      </div>
    </div>
  );
}
