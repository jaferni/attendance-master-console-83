
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  markedById: string; // Teacher or admin who marked attendance
  markedAt: string;
}
