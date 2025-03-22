
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { attendanceRecords as initialAttendanceRecords } from "@/data/mockAttendance";
import { weeklyHolidays as initialWeeklyHolidays, holidays as initialHolidays } from "@/data/mockHolidays";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Class, Grade } from "@/types/class";
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { Student, Teacher } from "@/types/user";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";

// Create simplified types for context to avoid deep recursion
type ClassWithoutStudents = Omit<Class, 'students'> & { students: string[] };

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
    setIsLoading(true);
    try {
      // Fetch grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .order('name');
      
      if (gradesError) throw gradesError;
      
      // Fetch classes with grade information
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          *,
          grade:grades(*)
        `)
        .order('name');
      
      if (classesError) throw classesError;
      
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('role', 'student')
        .order('last_name');
      
      if (studentsError) throw studentsError;
      
      // Fetch teachers - now fetching from students table with role='teacher'
      const { data: teachersData, error: teachersError } = await supabase
        .from('students')
        .select('*')
        .eq('role', 'teacher')
        .order('last_name');
      
      if (teachersError) throw teachersError;
      
      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*');
      
      if (attendanceError) throw attendanceError;
      
      // Transform the data to match our app's data structure
      const formattedClasses = classesData.map((cls) => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        grade_id: cls.grade_id,
        teacherId: cls.teacher_id,
        subject: cls.subject,
        description: cls.description,
        students: [],
        created_at: cls.created_at
      }));
      
      const formattedStudents = studentsData.map((student) => ({
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        role: 'student' as const,
        gradeId: student.grade_id,
        classId: student.class_id,
      }));
      
      const formattedTeachers = teachersData.map((teacher) => ({
        id: teacher.id,
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        email: teacher.email,
        role: 'teacher' as const,
        classes: [], // Will populate from classes
      }));
      
      const formattedAttendance = attendanceData.map((record) => ({
        id: record.id,
        date: record.date,
        classId: record.class_id,
        studentId: record.student_id,
        status: record.status as AttendanceStatus,
        markedById: record.marked_by_id,
        markedAt: record.marked_at,
      }));
      
      // Assign students to classes
      const classesWithStudents = formattedClasses.map(cls => ({
        ...cls,
        students: formattedStudents.filter(student => student.classId === cls.id)
      }));
      
      setGrades(gradesData);
      setClasses(classesWithStudents);
      setStudents(formattedStudents);
      setTeachers(formattedTeachers);
      setAttendanceRecords(formattedAttendance);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching data",
        description: "Could not retrieve data from the database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

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
    async (classId: string, date: string, statusRecords: Record<string, AttendanceStatus>, teacherId: string) => {
      try {
        // First, delete any existing records for this class and date
        await supabase
          .from('attendance_records')
          .delete()
          .eq('class_id', classId)
          .eq('date', date);
        
        // Prepare the new records
        const newRecords = Object.entries(statusRecords).map(([studentId, status]) => ({
          date,
          class_id: classId,
          student_id: studentId,
          status,
          marked_by_id: teacherId,
          marked_at: new Date().toISOString(),
        }));
        
        // Insert the new records
        const { error } = await supabase
          .from('attendance_records')
          .insert(newRecords);
        
        if (error) throw error;
        
        // Update the local state
        const updatedRecords = attendanceRecords.filter(
          (record) => !(record.classId === classId && record.date === date)
        );
        
        const formattedNewRecords = newRecords.map((record, index) => ({
          id: `temp-id-${index}`, // This will be replaced when we fetch data
          date: record.date,
          classId: record.class_id,
          studentId: record.student_id,
          status: record.status,
          markedById: record.marked_by_id,
          markedAt: record.marked_at,
        }));
        
        setAttendanceRecords([...updatedRecords, ...formattedNewRecords]);
        
        // Refetch to get the actual IDs
        fetchData();
        
        toast({
          title: "Attendance saved",
          description: `Attendance for ${date} has been saved successfully.`,
        });
      } catch (error) {
        console.error('Error saving attendance:', error);
        toast({
          title: "Error saving attendance",
          description: "There was a problem saving the attendance records.",
          variant: "destructive"
        });
      }
    },
    [attendanceRecords, fetchData]
  );

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

  const addGrade = useCallback(async (grade: Grade) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert({
          name: grade.name
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setGrades((prev) => [...prev, data]);
      
      toast({
        title: "Grade added",
        description: `${data.name} grade has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding grade:', error);
      toast({
        title: "Error adding grade",
        description: "There was a problem adding the grade.",
        variant: "destructive"
      });
    }
  }, []);
  
  const updateGrade = useCallback(async (updatedGrade: Grade) => {
    try {
      const { error } = await supabase
        .from('grades')
        .update({ name: updatedGrade.name })
        .eq('id', updatedGrade.id);
      
      if (error) throw error;
      
      // Update grades state
      setGrades((prev) => 
        prev.map((grade) => 
          grade.id === updatedGrade.id ? updatedGrade : grade
        )
      );
      
      // Update classes that use this grade
      setClasses((prev) =>
        prev.map((cls) =>
          cls.grade.id === updatedGrade.id
            ? { ...cls, grade: updatedGrade }
            : cls
        )
      );
      
      toast({
        title: "Grade updated",
        description: `${updatedGrade.name} grade has been updated successfully.`,
      });
      
      // Refresh data to ensure consistency
      fetchData();
      
    } catch (error) {
      console.error('Error updating grade:', error);
      toast({
        title: "Error updating grade",
        description: "There was a problem updating the grade.",
        variant: "destructive"
      });
    }
  }, [fetchData]);
  
  const deleteGrade = useCallback(async (gradeId: string) => {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);
      
      if (error) throw error;
      
      setGrades((prev) => prev.filter((grade) => grade.id !== gradeId));
      
      toast({
        title: "Grade deleted",
        description: "The grade has been deleted successfully.",
      });
      
      // Refresh data to ensure associated classes are updated
      fetchData();
      
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast({
        title: "Error deleting grade",
        description: "There was a problem deleting the grade.",
        variant: "destructive"
      });
    }
  }, [fetchData]);

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
  
  const addClass = useCallback(async (classData: Class) => {
    try {
      // Insert class into the database
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: classData.name,
          grade_id: classData.grade.id,
          teacher_id: classData.teacherId,
          subject: classData.subject,
          description: classData.description
        })
        .select(`
          *,
          grade:grades(*)
        `)
        .single();
      
      if (error) throw error;
      
      // Transform to match our app's data structure
      const newClass: Class = {
        id: data.id,
        name: data.name,
        grade: data.grade,
        grade_id: data.grade_id,
        teacherId: data.teacher_id,
        subject: data.subject,
        description: data.description,
        students: [],
        created_at: data.created_at
      };
      
      setClasses((prev) => [...prev, newClass]);
      
      toast({
        title: "Class added",
        description: `${newClass.name} has been added successfully.`,
      });
      
    } catch (error) {
      console.error('Error adding class:', error);
      toast({
        title: "Error adding class",
        description: "There was a problem adding the class.",
        variant: "destructive"
      });
    }
  }, []);
  
  const updateClass = useCallback(async (updatedClass: Class) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: updatedClass.name,
          grade_id: updatedClass.grade.id,
          teacher_id: updatedClass.teacherId,
          subject: updatedClass.subject,
          description: updatedClass.description
        })
        .eq('id', updatedClass.id);
      
      if (error) throw error;
      
      setClasses((prev) => 
        prev.map((cls) => 
          cls.id === updatedClass.id ? updatedClass : cls
        )
      );
      
      toast({
        title: "Class updated",
        description: `${updatedClass.name} has been updated successfully.`,
      });
      
      // Refresh data to ensure consistency
      fetchData();
      
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        title: "Error updating class",
        description: "There was a problem updating the class.",
        variant: "destructive"
      });
    }
  }, [fetchData]);
  
  const deleteClass = useCallback(async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);
      
      if (error) throw error;
      
      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
      
      toast({
        title: "Class deleted",
        description: "The class has been deleted successfully.",
      });
      
      // Refresh data to ensure associated students are updated
      fetchData();
      
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error deleting class",
        description: "There was a problem deleting the class.",
        variant: "destructive"
      });
    }
  }, [fetchData]);

  const assignTeacherToClass = useCallback(
    async (teacherId: string, classId: string) => {
      try {
        const { error } = await supabase
          .from('classes')
          .update({ teacher_id: teacherId })
          .eq('id', classId);
        
        if (error) throw error;
        
        setClasses((prevClasses) =>
          prevClasses.map((c) =>
            c.id === classId ? { ...c, teacherId } : c
          )
        );
        
        // Update teachers' classes array in memory
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
        
      } catch (error) {
        console.error('Error assigning teacher:', error);
        toast({
          title: "Error assigning teacher",
          description: "There was a problem assigning the teacher to the class.",
          variant: "destructive"
        });
      }
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
        
        addGrade,
        updateGrade,
        deleteGrade,
        
        getClassById,
        getClassesForTeacher,
        getStudentsInClass,
        addClass,
        updateClass,
        deleteClass,
        
        assignTeacherToClass,
        getTeacherById,
        
        isLoading,
        fetchData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
