
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { AttendanceStatus } from "@/types/attendance";
import { Student } from "@/types/user";
import { useState, useEffect, useContext } from "react";
import { StatusBadge } from "../StatusBadge";
import { Loader2 } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { students } from "@/data"; // Import students mock data

interface AttendanceTableProps {
  classId: string;
  date: Date;
  students?: Student[];
  existingRecords?: Record<string, AttendanceStatus>;
  onAttendanceChange?: (studentId: string, status: AttendanceStatus) => void;
  onSaveAttendance?: (records: Record<string, AttendanceStatus>) => void;
  readOnly?: boolean;
}

export function AttendanceTable({
  classId,
  date,
  students: providedStudents,
  existingRecords = {},
  onAttendanceChange,
  onSaveAttendance,
  readOnly = false,
}: AttendanceTableProps) {
  // Get students for this class if not provided
  const classStudents = providedStudents || students.filter(s => s.classId === classId);
  
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    existingRecords
  );
  const [selectAll, setSelectAll] = useState<boolean>(
    Object.values(existingRecords).every((status) => status === "present")
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);

  // Update attendance state when existingRecords changes
  useEffect(() => {
    setAttendance(existingRecords);
    setSelectAll(
      classStudents.length > 0 && 
      Object.values(existingRecords).length === classStudents.length && 
      Object.values(existingRecords).every((status) => status === "present")
    );
  }, [existingRecords, classStudents]);

  // Handle marking all students as present/absent
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    const newAttendance: Record<string, AttendanceStatus> = {};
    classStudents.forEach((student) => {
      newAttendance[student.id] = checked ? "present" : "absent";
    });
    
    setAttendance(newAttendance);
  };

  // Handle individual student attendance change
  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    
    // Update selectAll state based on current attendance
    const updatedAttendance = {
      ...attendance,
      [studentId]: status,
    };
    
    const allPresent = classStudents.every(
      (student) => updatedAttendance[student.id] === "present"
    );
    
    setSelectAll(allPresent);
    
    // Call the onAttendanceChange prop if provided
    if (onAttendanceChange) {
      onAttendanceChange(studentId, status);
    }
  };

  // Handle saving attendance
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save attendance records.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (onSaveAttendance) {
        await onSaveAttendance(attendance);
      } else {
        // Format date to YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        toast({
          title: "Attendance saved",
          description: `Attendance for ${formattedDate} has been successfully recorded.`,
        });
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error saving attendance",
        description: "An error occurred while saving attendance records.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {!readOnly && (
                <TableHead className="w-16 text-center">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead>Student</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classStudents.length > 0 ? (
              classStudents.map((student) => (
                <TableRow key={student.id} className="animate-slide-up">
                  {!readOnly && (
                    <TableCell className="text-center">
                      <Checkbox
                        checked={attendance[student.id] === "present"}
                        onCheckedChange={(checked) =>
                          handleAttendanceChange(
                            student.id,
                            checked ? "present" : "absent"
                          )
                        }
                        aria-label={`Mark ${student.firstName} ${student.lastName} as present`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.id.slice(0, 6)}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      <StatusBadge status={attendance[student.id] || "absent"} />
                    ) : (
                      <Select
                        value={attendance[student.id] || "absent"}
                        onValueChange={(value: AttendanceStatus) =>
                          handleAttendanceChange(student.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={readOnly ? 3 : 4} className="text-center py-4 text-muted-foreground">
                  No students found in this class
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {!readOnly && classStudents.length > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
          </Button>
        </div>
      )}
    </div>
  );
}
