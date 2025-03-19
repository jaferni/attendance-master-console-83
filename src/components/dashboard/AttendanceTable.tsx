
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { AttendanceStatus } from "@/types/attendance";
import { Student } from "@/types/user";
import { useState } from "react";
import { StatusBadge } from "../StatusBadge";

interface AttendanceTableProps {
  students: Student[];
  date: Date;
  existingRecords?: Record<string, AttendanceStatus>;
  onSave?: (records: Record<string, AttendanceStatus>) => void;
  readOnly?: boolean;
}

export function AttendanceTable({
  students,
  date,
  existingRecords = {},
  onSave,
  readOnly = false,
}: AttendanceTableProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    existingRecords
  );
  const [selectAll, setSelectAll] = useState<boolean>(
    Object.values(existingRecords).every((status) => status === "present")
  );

  // Handle marking all students as present/absent
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    const newAttendance: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
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
    
    const allPresent = students.every(
      (student) => updatedAttendance[student.id] === "present"
    );
    
    setSelectAll(allPresent);
  };

  // Handle saving attendance
  const handleSave = () => {
    if (onSave) {
      onSave(attendance);
    }
    toast({
      title: "Attendance saved",
      description: "Attendance has been successfully recorded.",
    });
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
            {students.map((student) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
      
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Attendance</Button>
        </div>
      )}
    </div>
  );
}
