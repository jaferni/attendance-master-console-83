
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { supabase } from "@/integrations/supabase/client";
import { attendanceRecords } from "@/data/mockAttendance";

export async function fetchAttendance(
  date: string, 
  classId: string | null
): Promise<AttendanceRecord[]> {
  if (!classId) return [];
  
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('date', date)
      .eq('class_id', classId);
    
    if (error) {
      console.error("Error fetching attendance:", error);
      // Fall back to mock data if there's an error
      return attendanceRecords.filter(
        record => record.date === date && record.classId === classId
      );
    }
    
    if (data && data.length > 0) {
      return data.map(record => ({
        id: record.id,
        date: record.date,
        classId: record.class_id,
        studentId: record.student_id,
        status: record.status as AttendanceStatus,
        markedById: record.marked_by_id,
        markedAt: record.marked_at
      }));
    } else {
      // If no records found in database, return filtered mock data
      return attendanceRecords.filter(
        record => record.date === date && record.classId === classId
      );
    }
  } catch (error) {
    console.error("Error in fetchAttendance:", error);
    // Return mock data as fallback
    return attendanceRecords.filter(
      record => record.date === date && record.classId === classId
    );
  }
}

export async function saveAttendance(
  date: string,
  classId: string,
  records: Record<string, AttendanceStatus>,
  userId: string
): Promise<boolean> {
  try {
    const recordsToInsert = Object.entries(records).map(([studentId, status]) => ({
      date,
      class_id: classId,
      student_id: studentId,
      status,
      marked_by_id: userId,
      marked_at: new Date().toISOString()
    }));
    
    // First, delete any existing records for this date and class
    const { error: deleteError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('date', date)
      .eq('class_id', classId);
    
    if (deleteError) {
      console.error("Error deleting existing attendance records:", deleteError);
      return false;
    }
    
    // Then insert the new records
    const { error: insertError } = await supabase
      .from('attendance_records')
      .insert(recordsToInsert);
    
    if (insertError) {
      console.error("Error inserting attendance records:", insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving attendance:", error);
    return false;
  }
}
