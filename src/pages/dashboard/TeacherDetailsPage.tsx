
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, GraduationCap, User, Mail, Phone, CalendarClock } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { teachers, classes } from "@/data";
import { Teacher } from "@/types/user";
import { Class } from "@/types/class";

export default function TeacherDetailsPage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("profile");

  // In a real application, you would fetch this data from your backend
  const getTeacher = (id: string): Teacher | undefined => {
    return teachers.find(t => t.id === id);
  };

  const getTeacherClasses = (teacherId: string): Class[] => {
    return classes.filter(c => c.teacherId === teacherId);
  };

  const teacher = getTeacher(teacherId || "");
  const teacherClasses = getTeacherClasses(teacherId || "");

  if (!teacher) {
    return (
      <DashboardShell title="Teacher not found" description="The teacher you are looking for does not exist.">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/dashboard/teachers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell 
      title={`${teacher.firstName} ${teacher.lastName}`} 
      description={`Teacher • ${teacherClasses.length} classes assigned`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/dashboard/teachers")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teachers
      </Button>

      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <UserAvatar user={teacher} size="lg" />
                <div>
                  <CardTitle>{teacher.firstName} {teacher.lastName}</CardTitle>
                  <CardDescription>Teacher Profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span>Science Department</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Joined March 2022</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Classes</CardTitle>
              <CardDescription>
                {teacherClasses.length > 0 
                  ? `${teacherClasses.length} classes assigned to ${teacher.firstName}`
                  : `No classes assigned to ${teacher.firstName} yet`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherClasses.length > 0 ? (
                <div className="space-y-4">
                  {teacherClasses.map(cls => (
                    <div key={cls.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <h4 className="font-medium">{cls.name}</h4>
                        <p className="text-sm text-muted-foreground">Grade {cls.grade.name} • {cls.students.length} students</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/classes/${cls.id}`)}
                      >
                        View Class
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No Classes Assigned</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This teacher doesn't have any classes assigned yet.
                  </p>
                  <Button className="mt-4" onClick={() => navigate("/dashboard/classes")}>
                    Assign Class
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>View and manage teacher's schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarClock className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Schedule Feature Coming Soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This feature is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
