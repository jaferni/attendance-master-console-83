
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { formatCurrentDate, formatPastDate } from "./utils/dateUtils";
import { students } from "./mockStudents";
import { teachers } from "./mockTeachers";
import { superAdmin } from "./mockAdmin";

// Generate mock attendance records
export const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceStatus[] = ["present", "absent", "late", "excused"];
  
  // Generate records for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = i === 0 ? formatCurrentDate() : formatPastDate(i);
    
    // Skip weekends
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    students.forEach((student) => {
      // 70% chance of being present
      const randomStatus = Math.random() < 0.7 ? "present" : statuses[Math.floor(Math.random() * statuses.length)];
      
      records.push({
        id: `attendance-${date}-${student.id}`,
        date,
        classId: student.classId,
        studentId: student.id,
        status: randomStatus,
        markedById: teachers.find(t => t.classes.includes(student.classId))?.id || superAdmin.id,
        markedAt: date + "T08:00:00Z",
      });
    });
  }
  
  return records;
};

export const attendanceRecords = generateAttendanceRecords();
