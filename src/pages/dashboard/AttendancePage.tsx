
import { useState, useEffect } from "react";
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

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  const { data: attendanceData = [] } = useQuery({
    queryKey: ["attendance", format(date, "yyyy-MM-dd"), selectedClassId],
    queryFn: () => fetchAttendance(format(date, "yyyy-MM-dd"), selectedClassId),
  });

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const handleAttendanceChange = (
    studentId: string,
    status: AttendanceStatus
  ) => {
    // Here we would implement the actual attendance update
    console.log("Updating attendance:", studentId, status);
  };

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
                    classes.find((c) => c.id === selectedClassId)?.name || ""
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
                {classes.map((cls) => (
                  <TabsTrigger key={cls.id} value={cls.id}>
                    {cls.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {classes.map((cls) => (
                <TabsContent key={cls.id} value={cls.id}>
                  {selectedClassId && (
                    <AttendanceTable
                      classId={selectedClassId}
                      date={date}
                      onAttendanceChange={handleAttendanceChange}
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
