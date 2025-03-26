
import { toast } from "@/hooks/use-toast";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { supabase } from "@/integrations/supabase/client";
import { students } from "@/data";
import { attendanceRecords } from "@/data/mockAttendance";

// Function to get attendance for a specific class on a specific date
export function getAttendanceForClass(
  attendanceRecords: AttendanceRecord[],
  classId: string,
  date: string
): Record<string, AttendanceStatus> {
  return attendanceRecords
    .filter((record) => record.classId === classId && record.date === date)
    .reduce((acc, record) => {
      acc[record.studentId] = record.status;
      return acc;
    }, {} as Record<string, AttendanceStatus>);
}

// Function to get attendance for a specific student
export function getAttendanceForStudent(
  attendanceRecords: AttendanceRecord[],
  studentId: string
): AttendanceRecord[] {
  return attendanceRecords.filter((record) => record.studentId === studentId);
}

// Added function to fetch attendance data for a specific date and class
export async function fetchAttendance(date: string, classId: string | null): Promise<any> {
  try {
    // Check if we should use Supabase or mock data
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('date', date)
      .eq(classId ? 'class_id' : 'date', classId || date);
    
    if (error) {
      console.error("Error fetching attendance from Supabase:", error);
      // Fallback to mock data
      const mockRecords = attendanceRecords.filter(record => 
        record.date === date && (classId ? record.classId === classId : true)
      );
      return mockRecords;
    }
    
    if (records && records.length > 0) {
      // Format Supabase records to match our AttendanceRecord type
      return records.map(record => ({
        id: record.id,
        date: record.date,
        classId: record.class_id,
        studentId: record.student_id,
        status: record.status,
        markedById: record.marked_by_id,
        markedAt: record.marked_at,
      }));
    } else {
      // Fallback to mock data if no records found
      const mockRecords = attendanceRecords.filter(record => 
        record.date === date && (classId ? record.classId === classId : true)
      );
      return mockRecords;
    }
  } catch (error) {
    console.error("Error in fetchAttendance:", error);
    // Fallback to mock data
    const mockRecords = attendanceRecords.filter(record => 
      record.date === date && (classId ? record.classId === classId : true)
    );
    return mockRecords;
  }
}

// Save attendance records to database
export async function saveAttendance(
  attendanceRecords: AttendanceRecord[],
  classId: string,
  date: string,
  statusRecords: Record<string, AttendanceStatus>,
  teacherId: string,
  setAttendanceRecords: (records: AttendanceRecord[]) => void,
  fetchData: () => Promise<void>
): Promise<void> {
  try {
    await supabase
      .from('attendance_records')
      .delete()
      .eq('class_id', classId)
      .eq('date', date);
    
    const newRecords = Object.entries(statusRecords).map(([studentId, status]) => ({
      date,
      class_id: classId,
      student_id: studentId,
      status,
      marked_by_id: teacherId,
      marked_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from('attendance_records')
      .insert(newRecords);
    
    if (error) throw error;
    
    const updatedRecords = attendanceRecords.filter(
      (record) => !(record.classId === classId && record.date === date)
    );
    
    const formattedNewRecords = newRecords.map((record, index) => ({
      id: `temp-id-${index}`,
      date: record.date,
      classId: record.class_id,
      studentId: record.student_id,
      status: record.status,
      markedById: record.marked_by_id,
      markedAt: record.marked_at,
    }));
    
    setAttendanceRecords([...updatedRecords, ...formattedNewRecords]);
    
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
}
