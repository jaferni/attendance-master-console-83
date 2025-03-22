
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Class, Grade } from "@/types/class";
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { Student, Teacher } from "@/types/user";

// Create simplified types to avoid deep recursion
export type ClassWithoutStudents = Omit<Class, 'students'> & { students: string[] };

export interface AppContextType {
  grades: Grade[];
  classes: Class[];
  teachers: Teacher[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  holidays: Holiday[];
  weeklyHolidays: WeeklyHoliday[];
  
  // Attendance methods
  getAttendanceForClass: (classId: string, date: string) => Record<string, AttendanceStatus>;
  getAttendanceForStudent: (studentId: string) => AttendanceRecord[];
  saveAttendance: (classId: string, date: string, records: Record<string, AttendanceStatus>, teacherId: string) => void;
  
  // Holiday methods
  addHoliday: (holiday: Holiday) => void;
  updateWeeklyHolidays: (weeklyHolidays: WeeklyHoliday[]) => void;
  
  // Grade methods
  addGrade: (grade: Grade) => void;
  updateGrade: (grade: Grade) => void;
  deleteGrade: (gradeId: string) => void;
  
  // Class methods
  getClassById: (classId: string) => Class | undefined;
  getClassesForTeacher: (teacherId: string) => Class[];
  getStudentsInClass: (classId: string) => Student[];
  addClass: (classData: Class) => void;
  updateClass: (classData: Class) => void;
  deleteClass: (classId: string) => void;
  
  // Teacher methods
  assignTeacherToClass: (teacherId: string, classId: string) => void;
  getTeacherById: (teacherId: string) => Teacher | undefined;
  
  isLoading: boolean;
  fetchData: () => Promise<void>;
}
