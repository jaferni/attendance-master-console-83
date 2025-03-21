
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { formatFutureDate, formatPastDate } from "./utils/dateUtils";

// Weekly holidays
export const weeklyHolidays: WeeklyHoliday[] = ["saturday", "sunday"];

// Custom holidays
export const holidays: Holiday[] = [
  {
    id: "holiday-1",
    name: "Independence Day",
    date: formatFutureDate(15),
    description: "National holiday celebrating independence",
  },
  {
    id: "holiday-2",
    name: "Teachers' Day",
    date: formatFutureDate(25),
    description: "Day to honor teachers and their contributions",
  },
  {
    id: "holiday-3",
    name: "Spring Break",
    date: formatFutureDate(35),
    description: "One week holiday for spring",
  },
  {
    id: "holiday-4",
    name: "Foundation Day",
    date: formatPastDate(15),
    description: "School foundation day celebration",
  },
];
