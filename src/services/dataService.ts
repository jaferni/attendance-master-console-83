
import { toast } from "@/components/ui/use-toast";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Class, Grade } from "@/types/class";
import { Student, Teacher } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export async function fetchAppData(
  setGrades: (grades: Grade[]) => void,
  setClasses: (classes: Class[]) => void,
  setStudents: (students: Student[]) => void,
  setTeachers: (teachers: Teacher[]) => void,
  setAttendanceRecords: (records: AttendanceRecord[]) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> {
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
      .order('last_name');
    
    if (studentsError) throw studentsError;
    
    // Fetch teachers from the teachers table
    const { data: teachersData, error: teachersError } = await supabase
      .from('teachers')
      .select('*')
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
    
    // Handle teacher data from the teachers table
    const formattedTeachers = teachersData.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.first_name || "",
      lastName: teacher.last_name || "",
      email: teacher.email || "",
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
      description: "Could not retrieve data from the database."
    });
  } finally {
    setIsLoading(false);
  }
}
