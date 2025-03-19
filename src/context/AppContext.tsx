
import { createContext, PropsWithChildren, useCallback, useState } from "react";
import { attendanceRecords as initialAttendanceRecords, classes as initialClasses, grades as initialGrades, holidays as initialHolidays, students as initialStudents, teachers as initialTeachers, weeklyHolidays as initialWeeklyHolidays } from "@/data/mockData";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Class, Grade } from "@/types/class";
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { Student, Teacher } from "@/types/user";
import { toast } from "@/components/ui/use-toast";

interface AppContextType {
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
  
  // Class methods
  getClassById: (classId: string) => Class | undefined;
  getClassesForTeacher: (teacherId: string) => Class[];
  getStudentsInClass: (classId: string) => Student[];
  
  // Teacher methods
  assignTeacherToClass: (teacherId: string, classId: string) => void;
  getTeacherById: (teacherId: string) => Teacher | undefined;
}

export const AppContext = createContext<AppContextType>({
  grades: [],
  classes: [],
  teachers: [],
  students: [],
  attendanceRecords: [],
  holidays: [],
  weeklyHolidays: [],
  
  getAttendanceForClass: () => ({}),
  getAttendanceForStudent: () => [],
  saveAttendance: () => {},
  
  addHoliday: () => {},
  updateWeeklyHolidays: () => {},
  
  getClassById: () => undefined,
  getClassesForTeacher: () => [],
  getStudentsInClass: () => [],
  
  assignTeacherToClass: () => {},
  getTeacherById: () => undefined,
});

export function AppProvider({ children }: PropsWithChildren) {
  const [grades] = useState<Grade[]>(initialGrades);
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [students] = useState<Student[]>(initialStudents);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday[]>(initialWeeklyHolidays);

  // Attendance methods
  const getAttendanceForClass = useCallback((classId: string, date: string): Record<string, AttendanceStatus> => {
    return attendanceRecords
      .filter((record) => record.classId === classId && record.date === date)
      .reduce((acc, record) => {
        acc[record.studentId] = record.status;
        return acc;
      }, {} as Record<string, AttendanceStatus>);
  }, [attendanceRecords]);

  const getAttendanceForStudent = useCallback((studentId: string): AttendanceRecord[] => {
    return attendanceRecords.filter((record) => record.studentId === studentId);
  }, [attendanceRecords]);

  const saveAttendance = useCallback(
    (classId: string, date: string, statusRecords: Record<string, AttendanceStatus>, teacherId: string) => {
      // Remove existing records for this class and date
      const updatedRecords = attendanceRecords.filter(
        (record) => !(record.classId === classId && record.date === date)
      );
      
      // Add new attendance records
      const newRecords = Object.entries(statusRecords).map(([studentId, status]) => ({
        id: `attendance-${date}-${studentId}`,
        date,
        classId,
        studentId,
        status,
        markedById: teacherId,
        markedAt: new Date().toISOString(),
      }));
      
      setAttendanceRecords([...updatedRecords, ...newRecords]);
      
      toast({
        title: "Attendance saved",
        description: `Attendance for ${date} has been saved successfully.`,
      });
    },
    [attendanceRecords]
  );

  // Holiday methods
  const addHoliday = useCallback((holiday: Holiday) => {
    setHolidays((prev) => [...prev, holiday]);
    
    toast({
      title: "Holiday added",
      description: `${holiday.name} has been added to the calendar.`,
    });
  }, []);

  const updateWeeklyHolidays = useCallback((newWeeklyHolidays: WeeklyHoliday[]) => {
    setWeeklyHolidays(newWeeklyHolidays);
    
    toast({
      title: "Weekly holidays updated",
      description: "The weekly holiday schedule has been updated.",
    });
  }, []);

  // Class methods
  const getClassById = useCallback(
    (classId: string) => {
      return classes.find((c) => c.id === classId);
    },
    [classes]
  );

  const getClassesForTeacher = useCallback(
    (teacherId: string) => {
      return classes.filter((c) => c.teacherId === teacherId);
    },
    [classes]
  );

  const getStudentsInClass = useCallback(
    (classId: string) => {
      return students.filter((student) => student.classId === classId);
    },
    [students]
  );

  // Teacher methods
  const assignTeacherToClass = useCallback(
    (teacherId: string, classId: string) => {
      // Update the class
      setClasses((prevClasses) =>
        prevClasses.map((c) =>
          c.id === classId ? { ...c, teacherId } : c
        )
      );
      
      // Update the teacher
      setTeachers((prevTeachers) =>
        prevTeachers.map((t) =>
          t.id === teacherId
            ? { ...t, classes: [...t.classes, classId] }
            : t
        )
      );
      
      toast({
        title: "Teacher assigned",
        description: "Teacher has been assigned to the class successfully.",
      });
    },
    []
  );

  const getTeacherById = useCallback(
    (teacherId: string) => {
      return teachers.find((t) => t.id === teacherId);
    },
    [teachers]
  );

  return (
    <AppContext.Provider
      value={{
        grades,
        classes,
        teachers,
        students,
        attendanceRecords,
        holidays,
        weeklyHolidays,
        
        getAttendanceForClass,
        getAttendanceForStudent,
        saveAttendance,
        
        addHoliday,
        updateWeeklyHolidays,
        
        getClassById,
        getClassesForTeacher,
        getStudentsInClass,
        
        assignTeacherToClass,
        getTeacherById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
