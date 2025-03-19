
export type WeeklyHoliday = 
  | "monday" 
  | "tuesday" 
  | "wednesday" 
  | "thursday" 
  | "friday" 
  | "saturday" 
  | "sunday";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
}
