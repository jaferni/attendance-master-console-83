
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { format } from "date-fns";
import { Calendar as CalendarIcon, LoaderCircle } from "lucide-react";
import { useContext, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AppContext } from "@/context/AppContext";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { Navigate } from "react-router-dom";

export default function AttendancePage() {
  const { user } = useContext(AuthContext);
  const { 
    classes, 
    getClassesForTeacher, 
    getStudentsInClass, 
    getAttendanceForClass, 
    saveAttendance,
    isLoading 
  } = useContext(AppContext);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  // Format date for API calls
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Filter classes based on user role
  const availableClasses = user?.role === "teacher" 
    ? getClassesForTeacher(user.id)
    : classes;
  
  // Get students for selected class
  const studentsInClass = selectedClassId 
    ? getStudentsInClass(selectedClassId) 
    : [];
  
  // Get existing attendance records
  const existingAttendance = selectedClassId 
    ? getAttendanceForClass(selectedClassId, formattedDate) 
    : {};
  
  // Redirect non-authorized users
  if (user && user.role === "student") {
    return <Navigate to="/dashboard" />;
  }
  
  // Handle saving attendance
  const handleSaveAttendance = async (records: Record<string, string>) => {
    if (!user || !selectedClassId) return;
    
    await saveAttendance(
      selectedClassId,
      formattedDate,
      records,
      user.id
    );
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="Attendance"
        description="Record and track student attendance"
      >
        <div className="space-y-6">
          {/* Date & Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Take Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            <span>Loading classes...</span>
                          </div>
                        </SelectItem>
                      ) : availableClasses.length > 0 ? (
                        availableClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b py-4"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <Skeleton className="h-8 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : selectedClassId ? (
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceTable 
                  students={studentsInClass}
                  date={selectedDate}
                  classId={selectedClassId}
                  existingRecords={existingAttendance}
                  onSave={handleSaveAttendance}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-10 text-muted-foreground">
                Please select a class to view students and record attendance
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </DashboardLayout>
  );
}
