
import { toast } from "@/hooks/use-toast";
import { Holiday, WeeklyHoliday } from "@/types/holiday";

export function addHoliday(
  holiday: Holiday,
  setHolidays: (updater: (prev: Holiday[]) => Holiday[]) => void
): void {
  setHolidays((prev) => [...prev, holiday]);
  
  toast({
    title: "Holiday added",
    description: `${holiday.name} has been added to the calendar.`,
  });
}

export function updateWeeklyHolidays(
  newWeeklyHolidays: WeeklyHoliday[],
  setWeeklyHolidays: (holidays: WeeklyHoliday[]) => void
): void {
  setWeeklyHolidays(newWeeklyHolidays);
  
  toast({
    title: "Weekly holidays updated",
    description: "The weekly holiday schedule has been updated.",
  });
}
