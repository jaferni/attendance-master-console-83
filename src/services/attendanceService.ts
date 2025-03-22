import { toast } from "@/hooks/use-toast";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { supabase } from "@/integrations/supabase/client";

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

export function getAttendanceForStudent(
  attendanceRecords: AttendanceRecord[],
  studentId: string
): AttendanceRecord[] {
  return attendanceRecords.filter((record) => record.studentId === studentId);
}

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
