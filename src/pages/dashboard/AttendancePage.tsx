
import { useState, useEffect, useContext } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "@/services/classService";
import { fetchAttendance } from "@/services/attendanceService";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { AttendanceStatus } from "@/types/attendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Class } from "@/types/class";
import { AuthContext } from "@/context/AuthContext";

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const { data: attendanceData = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", format(date, "yyyy-MM-dd"), selectedClassId],
    queryFn: () => fetchAttendance(format(date, "yyyy-MM-dd"), selectedClassId),
    enabled: !!selectedClassId,
  });

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleSaveAttendance = (
    attendanceData: Record<string, AttendanceStatus>
  ) => {
    // Here we would implement the actual save operation
    console.log("Saving attendance data:", attendanceData);
  };

  const isLoading = isLoadingClasses || isLoadingAttendance;

  if (isLoading) {
    return (
      <DashboardShell title="Attendance" description="Loading attendance data...">
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Attendance" description="Manage daily student attendance">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Attendance for {format(date, "MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              {selectedClassId
                ? `Class: ${
                    (classes as Class[]).find((c) => c.id === selectedClassId)?.name || ""
                  }`
                : "Select a class"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={selectedClassId || ""}
              onValueChange={(value) => setSelectedClassId(value)}
            >
              <TabsList className="mb-4">
                {(classes as Class[]).map((cls) => (
                  <TabsTrigger key={cls.id} value={cls.id}>
                    {cls.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(classes as Class[]).map((cls) => (
                <TabsContent key={cls.id} value={cls.id}>
                  {selectedClassId && (
                    <AttendanceTable
                      classId={selectedClassId}
                      date={date}
                      onSaveAttendance={handleSaveAttendance}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>
              Choose a date to view or update attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
