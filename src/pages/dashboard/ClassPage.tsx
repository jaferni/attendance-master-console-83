import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAttendanceForClass, useSaveAttendance, useStudentsInClass } from "@/hooks/useSupabase";
import { AttendanceStatus } from "@/types/attendance";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, User, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/user";

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [selectedDate] = useState<Date>(new Date());
  
  // Fetch class details
  const { data: classData, isLoading: isLoadingClass } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;
      
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          grade:grades(*)
        `)
        .eq('id', classId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!classId
  });
  
  // Fetch teacher
  const { data: teacher } = useQuery({
    queryKey: ['teacher', classData?.teacher_id],
    queryFn: async () => {
      if (!classData?.teacher_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', classData.teacher_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!classData?.teacher_id
  });
  
  // Fetch students in class
  const { data: students = [], isLoading: isLoadingStudents } = useStudentsInClass(classId || '');
  
  // Fetch attendance records
  const { data: attendanceData = [], isLoading: isLoadingAttendance } = useAttendanceForClass(
    classId || '', 
    selectedDate
  );
  
  // Transform attendance data into the format expected by AttendanceTable
  const attendanceRecords = attendanceData.reduce<Record<string, AttendanceStatus>>((acc, record) => {
    acc[record.student_id] = record.status as AttendanceStatus;
    return acc;
  }, {});
  
  const saveAttendanceMutation = useSaveAttendance();
  
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
  
  if (isLoadingClass) {
    return (
      <DashboardLayout>
        <DashboardShell title="Loading class..." description="Please wait...">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardShell>
      </DashboardLayout>
    );
  }
  
  if (!classData) {
    return <Navigate to="/dashboard" />;
  }
  
  // For teachers, check if they are assigned to this class
  if (isTeacher && classData.teacher_id !== user.id) {
    return <Navigate to="/dashboard" />;
  }
  
  // Map database students to our app's Student type
  const mappedStudents: Student[] = students.map(student => ({
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email || '',
    role: 'student' as const,
    gradeId: classData.grade?.id || '',
    classId: classId
  }));
  
  // Calculate statistics
  const presentCount = Object.values(attendanceRecords).filter(
    (status) => status === "present"
  ).length;
  
  const absentCount = Object.values(attendanceRecords).filter(
    (status) => status === "absent"
  ).length;
  
  const attendanceRate = mappedStudents.length
    ? Math.round((presentCount / mappedStudents.length) * 100)
    : 0;
  
  const handleSaveAttendance = async (records: Record<string, AttendanceStatus>) => {
    if (!user || !classId) return;
    
    saveAttendanceMutation.mutate({
      classId,
      records,
      date: selectedDate,
      recordedBy: user.id
    });
  };

  return (
    <DashboardLayout>
      <DashboardShell 
        title={classData.name} 
        description={classData.grade ? `${classData.grade.name} Grade` : ""}
      >
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
                  {isLoadingStudents ? "..." : mappedStudents.length}
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
                  {teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unassigned"}
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
                <span className="text-2xl font-bold">
                  {isLoadingAttendance ? "..." : `${attendanceRate}%`}
                </span>
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
                students={mappedStudents}
                date={selectedDate}
                existingRecords={attendanceRecords}
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
                      {isAdmin && <th className="text-left p-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoadingStudents ? (
                      <tr>
                        <td colSpan={isAdmin ? 3 : 2} className="p-3 text-center">
                          Loading students...
                        </td>
                      </tr>
                    ) : mappedStudents.length > 0 ? (
                      mappedStudents.map((student) => (
                        <tr key={student.id} className="animate-slide-up">
                          <td className="p-3 font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {student.id.slice(0, 6)}
                          </td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 3 : 2} className="p-3 text-center">
                          No students in this class
                        </td>
                      </tr>
                    )}
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
