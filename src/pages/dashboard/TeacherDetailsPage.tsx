
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/UserAvatar";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { GraduationCap, Mail, Phone, Users } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

export default function TeacherDetailsPage() {
  const { user } = useContext(AuthContext);
  const { teachers, classes, getClassesForTeacher, assignTeacherToClass, fetchData } = useContext(AppContext);
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Find the teacher
  const teacher = teachers.find((t) => t.id === teacherId);
  
  // Get teacher's classes
  const teacherClasses = teacher ? getClassesForTeacher(teacher.id) : [];
  
  // Get unassigned classes (classes without a teacher or with a different teacher)
  const availableClasses = classes.filter(
    (cls) => !cls.teacherId || (teacherClasses.length > 0 && !teacherClasses.some(tc => tc.id === cls.id))
  );
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }
  
  if (!teacher) {
    return (
      <DashboardLayout>
        <DashboardShell
          title="Teacher Not Found"
          description="The teacher you are looking for does not exist."
        >
          <Button onClick={() => navigate("/dashboard/teachers")}>
            Back to Teachers
          </Button>
        </DashboardShell>
      </DashboardLayout>
    );
  }
  
  const handleAssignClass = async () => {
    if (!selectedClassId) {
      toast({
        title: "No class selected",
        description: "Please select a class to assign to this teacher",
        variant: "destructive",
      });
      return;
    }
    
    setIsAssigning(true);
    
    try {
      await assignTeacherToClass(teacher.id, selectedClassId);
      
      // Refresh data to update UI
      await fetchData();
      
      // Reset selection
      setSelectedClassId("");
      
      toast({
        title: "Class assigned",
        description: `Class has been successfully assigned to ${teacher.firstName} ${teacher.lastName}`,
      });
    } catch (error) {
      console.error("Error assigning class:", error);
      toast({
        title: "Error assigning class",
        description: "An error occurred while trying to assign the class",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title={`${teacher.firstName} ${teacher.lastName}`}
        description="Teacher details and assigned classes"
        backHref="/dashboard/teachers"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Teacher Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <UserAvatar user={teacher} size="xl" />
                <div className="space-y-3">
                  <h3 className="text-2xl font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      <span>{teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Assign Class */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-4">
                    <Select
                      value={selectedClassId}
                      onValueChange={setSelectedClassId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClasses.length > 0 ? (
                          availableClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-classes" disabled>
                            No available classes
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAssignClass}
                    disabled={!selectedClassId || isAssigning}
                    className="col-span-1"
                  >
                    Assign
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Assigning a class will make this teacher responsible for taking attendance and managing the students in that class.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Assigned Classes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Assigned Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacherClasses.length > 0 ? (
              <div className="space-y-4">
                {teacherClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{cls.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cls.students.length} students
                        </p>
                      </div>
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
              <div className="text-center py-8 text-muted-foreground">
                No classes assigned to this teacher yet
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </DashboardLayout>
  );
}
