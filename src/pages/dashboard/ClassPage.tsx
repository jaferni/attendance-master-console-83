
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DashboardShell } from "@/components/DashboardShell";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { fetchClassById } from "@/services/classService";
import { fetchAttendance } from "@/services/attendanceService";
import { AttendanceStatus } from "@/types/attendance";

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>("students");

  const { data: classData, isLoading: isLoadingClass } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => fetchClassById(classId || ""),
    enabled: !!classId,
  });

  const { data: attendanceData = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", format(date, "yyyy-MM-dd"), classId],
    queryFn: () => fetchAttendance(format(date, "yyyy-MM-dd"), classId || null),
    enabled: !!classId,
  });

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleSaveAttendance = (
    attendanceData: Record<string, AttendanceStatus>
  ) => {
    console.log("Saving attendance data:", attendanceData);
  };

  const isLoading = isLoadingClass || isLoadingAttendance;

  if (isLoading) {
    return (
      <DashboardShell title="Loading..." description="Loading class details">
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!classData) {
    return (
      <DashboardShell title="Class Not Found" description="The requested class could not be found">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell 
      title={classData.name} 
      description={`Grade ${classData.grade} • ${classData.students.length} students`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Classes
      </Button>

      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                {classData.students.length} students enrolled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Student list would go here */}
              <div className="divide-y">
                {classData.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{student.firstName} {student.lastName}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Attendance for {format(date, "MMMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  Record and manage attendance for {classData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classId && (
                  <AttendanceTable
                    classId={classId}
                    date={date}
                    students={classData.students}
                    onSaveAttendance={handleSaveAttendance}
                  />
                )}
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
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Grades</CardTitle>
              <CardDescription>
                View and manage grades for {classData.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Grades functionality coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
