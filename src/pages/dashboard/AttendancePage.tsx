
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttendanceCalendar } from "@/components/ui/attendance-calendar";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useContext, useState } from "react";

export default function AttendancePage() {
  const { user } = useContext(AuthContext);
  const {
    classes,
    getClassesForTeacher,
    getAttendanceForClass,
    getAttendanceForStudent,
    saveAttendance,
  } = useContext(AppContext);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  if (!user) return null;
  
  const isAdmin = user.role === "superadmin";
  const isTeacher = user.role === "teacher";
  const isStudent = user.role === "student";
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  const teacherClasses = isTeacher
    ? getClassesForTeacher(user.id)
    : [];
  
  const availableClasses = isAdmin
    ? classes
    : isTeacher
    ? teacherClasses
    : [];
  
  const selectedClass = selectedClassId
    ? classes.find((c) => c.id === selectedClassId)
    : undefined;
  
  const classAttendance = selectedClass
    ? getAttendanceForClass(selectedClass.id, formattedDate)
    : {};
  
  const studentAttendance = isStudent
    ? getAttendanceForStudent(user.id)
    : [];
  
  const handleSaveAttendance = (records: Record<string, string>) => {
    if (selectedClass && user) {
      saveAttendance(
        selectedClass.id,
        formattedDate,
        records,
        user.id
      );
    }
  };

  return (
    <DashboardLayout>
      <DashboardShell
        title="Attendance"
        description={
          isAdmin || isTeacher
            ? "Manage attendance for classes"
            : "View your attendance records"
        }
      >
        {(isAdmin || isTeacher) && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor="class-select">Select Class</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/3 space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedClass && (
              <AttendanceTable
                students={selectedClass.students}
                date={selectedDate}
                existingRecords={classAttendance}
                onSave={handleSaveAttendance}
              />
            )}
          </div>
        )}

        {isStudent && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border glass glass-hover p-6">
              <h2 className="text-lg font-medium mb-4">Attendance Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-500">
                    {
                      studentAttendance.filter(
                        (record) => record.status === "present"
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-500">
                    {
                      studentAttendance.filter(
                        (record) => record.status === "absent"
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {
                      studentAttendance.filter(
                        (record) => record.status === "late"
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Excused</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {
                      studentAttendance.filter(
                        (record) => record.status === "excused"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border glass glass-hover p-6">
              <h2 className="text-lg font-medium mb-4">Attendance Calendar</h2>
              <AttendanceCalendar attendanceRecords={studentAttendance} />
            </div>
          </div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
}
