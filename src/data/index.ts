
import { grades } from "./mockGrades";
import { teachers } from "./mockTeachers";
import { superAdmin } from "./mockAdmin";
import { students } from "./mockStudents";
import { classes } from "./mockClasses";
import { attendanceRecords } from "./mockAttendance";
import { weeklyHolidays, holidays } from "./mockHolidays";
import { User } from "@/types/user";

// All users
export const allUsers: User[] = [
  superAdmin,
  ...teachers,
  ...students,
];

// Export everything
export {
  grades,
  teachers,
  superAdmin,
  students,
  classes,
  attendanceRecords,
  weeklyHolidays,
  holidays
};
