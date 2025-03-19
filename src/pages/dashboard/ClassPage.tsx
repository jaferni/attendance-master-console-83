
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { AttendanceStatus } from "@/types/attendance";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, GraduationCap, User, Users, XCircle } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useContext(AuthContext);
  const { 
    getClassById, 
    getAttendanceForClass, 
    getTeacherById,
    saveAttendance
  } = useContext(AppContext);
  
  const [selectedDate] = useState<Date>(new Date());
  
  if (!user) return null;
  
  const isAdmin = user.role === "superadmin";
  const isTeacher = user.role === "teacher";
  
  // Redirect if not admin or teacher
  if (!isAdmin && !isTeacher) {
    return <Navigate to="/dashboard" />;
  }
  
  if (!classId) {
    return <Navigate to="/dashboard" />;
  }
  
  const classData = getClassById(classId);
  
  if (!classData) {
    return <Navigate to="/dashboard" />;
  }
  
  // For teachers, check if they are assigned to this class
  if (isTeacher && classData.teacherId !== user.id) {
    return <Navigate to="/dashboard" />;
  }
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const classAttendance = getAttendanceForClass(classId, formattedDate);
  const teacher = classData.teacherId ? getTeacherById(classData.teacherId) : undefined;
  
  // Calculate statistics
  const presentCount = Object.values(classAttendance).filter(
    (status) => status === "present"
  ).length;
  
  const absentCount = Object.values(classAttendance).filter(
    (status) => status === "absent"
  ).length;
  
  const attendanceRate = classData.students.length
    ? Math.round((presentCount / classData.students.length) * 100)
    : 0;
  
  const handleSaveAttendance = (records: Record<string, AttendanceStatus>) => {
    if (user) {
      saveAttendance(
        classId,
        formattedDate,
        records,
        user.id
      );
    }
  };

  return (
    <DashboardLayout>
      <DashboardShell title={classData.name} description={`${classData.grade.name} Grade`}>
        <div className="space-y-6">
          {/* Class info cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass glass-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {classData.students.length}
                </span>
              </CardContent>
            </Card>
            <Card className="glass glass-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Teacher
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unassigned"}
                </span>
              </CardContent>
            </Card>
            <Card className="glass glass-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Attendance Today
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{attendanceRate}%</span>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs defaultValue="attendance">
            <TabsList>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attendance" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Attendance for {format(selectedDate, "MMMM dd, yyyy")}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{presentCount} Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{absentCount} Absent</span>
                  </div>
                </div>
              </div>
              <AttendanceTable
                students={classData.students}
                date={selectedDate}
                existingRecords={classAttendance}
                onSave={handleSaveAttendance}
              />
            </TabsContent>
            <TabsContent value="students" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Student List</h3>
                {isAdmin && (
                  <Button size="sm">Add Student</Button>
                )}
              </div>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Email</th>
                      {isAdmin && <th className="text-left p-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {classData.students.map((student) => (
                      <tr key={student.id} className="animate-slide-up">
                        <td className="p-3 font-medium">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {student.id.slice(0, 6)}
                        </td>
                        <td className="p-3">{student.email}</td>
                        {isAdmin && (
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              Remove
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardShell>
    </DashboardLayout>
  );
}
