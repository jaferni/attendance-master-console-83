
import { addDays, format, subDays } from "date-fns";

/**
 * Utility functions for date operations used in mock data generation
 */

// Format for future dates
export const formatFutureDate = (daysFromNow: number): string => {
  return format(addDays(new Date(), daysFromNow), "yyyy-MM-dd");
};

// Format for past dates
export const formatPastDate = (daysAgo: number): string => {
  return format(subDays(new Date(), daysAgo), "yyyy-MM-dd");
};

// Format for current date
export const formatCurrentDate = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};
