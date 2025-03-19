
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { HolidayCalendar } from "@/components/dashboard/HolidayCalendar";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { useContext } from "react";

export default function HolidaysPage() {
  const { user } = useContext(AuthContext);
  const { holidays, weeklyHolidays, addHoliday, updateWeeklyHolidays } = useContext(AppContext);
  
  if (!user || user.role !== "superadmin") return null;
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="Holidays"
        description="Manage school holidays and weekly off days"
      >
        <div className="space-y-6">
          <HolidayCalendar
            holidays={holidays}
            weeklyHolidays={weeklyHolidays}
            onAddHoliday={addHoliday}
            onUpdateWeeklyHolidays={updateWeeklyHolidays}
          />
        </div>
      </DashboardShell>
    </DashboardLayout>
  );
}
