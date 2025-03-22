
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { attendanceRecords as initialAttendanceRecords } from "@/data/mockAttendance";
import { weeklyHolidays as initialWeeklyHolidays, holidays as initialHolidays } from "@/data/mockHolidays";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Class, Grade } from "@/types/class";
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { Student, Teacher } from "@/types/user";
import { AuthContext } from "./AuthContext";
import { AppContextType } from "./types";

// Import services
import { getAttendanceForClass, getAttendanceForStudent, saveAttendance } from "@/services/attendanceService";
import { addGrade, updateGrade, deleteGrade } from "@/services/gradeService";
import { getClassById, getClassesForTeacher, getStudentsInClass, addClass, updateClass, deleteClass, assignTeacherToClass, getTeacherById } from "@/services/classService";
import { addHoliday, updateWeeklyHolidays } from "@/services/holidayService";
import { fetchAppData } from "@/services/dataService";

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
  
  addGrade: () => {},
  updateGrade: () => {},
  deleteGrade: () => {},
  
  getClassById: () => undefined,
  getClassesForTeacher: () => [],
  getStudentsInClass: () => [],
  addClass: () => {},
  updateClass: () => {},
  deleteClass: () => {},
  
  assignTeacherToClass: () => {},
  getTeacherById: () => undefined,
  
  isLoading: false,
  fetchData: async () => {},
});

export function AppProvider({ children }: PropsWithChildren) {
  const { user } = useContext(AuthContext);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday[]>(initialWeeklyHolidays);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    fetchAppData(
      setGrades,
      setClasses,
      setStudents,
      setTeachers,
      setAttendanceRecords,
      setIsLoading
    );
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Wrap the service functions with the required state
  const getAttendanceForClassWrapper = useCallback(
    (classId: string, date: string) => getAttendanceForClass(attendanceRecords, classId, date),
    [attendanceRecords]
  );

  const getAttendanceForStudentWrapper = useCallback(
    (studentId: string) => getAttendanceForStudent(attendanceRecords, studentId),
    [attendanceRecords]
  );

  const saveAttendanceWrapper = useCallback(
    (classId: string, date: string, records: Record<string, AttendanceStatus>, teacherId: string) => {
      saveAttendance(attendanceRecords, classId, date, records, teacherId, setAttendanceRecords, fetchData);
    },
    [attendanceRecords, fetchData]
  );

  const addHolidayWrapper = useCallback(
    (holiday: Holiday) => addHoliday(holiday, setHolidays),
    []
  );

  const updateWeeklyHolidaysWrapper = useCallback(
    (newWeeklyHolidays: WeeklyHoliday[]) => updateWeeklyHolidays(newWeeklyHolidays, setWeeklyHolidays),
    []
  );

  const addGradeWrapper = useCallback(
    (grade: Grade) => addGrade(grade, setGrades),
    []
  );

  const updateGradeWrapper = useCallback(
    (grade: Grade) => updateGrade(grade, setGrades, setClasses, fetchData),
    [fetchData]
  );

  const deleteGradeWrapper = useCallback(
    (gradeId: string) => deleteGrade(gradeId, setGrades, fetchData),
    [fetchData]
  );

  const getClassByIdWrapper = useCallback(
    (classId: string) => getClassById(classes, classId),
    [classes]
  );

  const getClassesForTeacherWrapper = useCallback(
    (teacherId: string) => getClassesForTeacher(classes, teacherId),
    [classes]
  );

  const getStudentsInClassWrapper = useCallback(
    (classId: string) => getStudentsInClass(students, classId),
    [students]
  );

  const addClassWrapper = useCallback(
    (classData: Class) => addClass(classData, setClasses),
    []
  );

  const updateClassWrapper = useCallback(
    (classData: Class) => updateClass(classData, setClasses, fetchData),
    [fetchData]
  );

  const deleteClassWrapper = useCallback(
    (classId: string) => deleteClass(classId, setClasses, fetchData),
    [fetchData]
  );

  const assignTeacherToClassWrapper = useCallback(
    (teacherId: string, classId: string) => assignTeacherToClass(teacherId, classId, setClasses, setTeachers),
    []
  );

  const getTeacherByIdWrapper = useCallback(
    (teacherId: string) => getTeacherById(teachers, teacherId),
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
        
        getAttendanceForClass: getAttendanceForClassWrapper,
        getAttendanceForStudent: getAttendanceForStudentWrapper,
        saveAttendance: saveAttendanceWrapper,
        
        addHoliday: addHolidayWrapper,
        updateWeeklyHolidays: updateWeeklyHolidaysWrapper,
        
        addGrade: addGradeWrapper,
        updateGrade: updateGradeWrapper,
        deleteGrade: deleteGradeWrapper,
        
        getClassById: getClassByIdWrapper,
        getClassesForTeacher: getClassesForTeacherWrapper,
        getStudentsInClass: getStudentsInClassWrapper,
        addClass: addClassWrapper,
        updateClass: updateClassWrapper,
        deleteClass: deleteClassWrapper,
        
        assignTeacherToClass: assignTeacherToClassWrapper,
        getTeacherById: getTeacherByIdWrapper,
        
        isLoading,
        fetchData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
