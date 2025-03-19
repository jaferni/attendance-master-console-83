
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { Class, Grade } from "@/types/class";
import { GraduationCap, Plus, Trash, User, Users } from "lucide-react";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

export default function GradesClassesPage() {
  const { user } = useContext(AuthContext);
  const { 
    grades, 
    classes,
    getTeacherById,
    getStudentsInClass
  } = useContext(AppContext);
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }
  
  const renderGradeClasses = (grade: Grade) => {
    const gradeClasses = classes.filter((cls) => cls.grade.id === grade.id);
    
    return (
      <div key={grade.id} className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {grade.name} Grade
          </h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Class
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gradeClasses.map((cls) => (
            <ClassCard key={cls.id} classData={cls} />
          ))}
        </div>
      </div>
    );
  };
  
  const ClassCard = ({ classData }: { classData: Class }) => {
    const teacher = classData.teacherId
      ? getTeacherById(classData.teacherId)
      : undefined;
    
    const students = getStudentsInClass(classData.id);
    
    return (
      <Card className="glass glass-hover overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>{classData.name}</span>
            <Button variant="ghost" size="icon" className="text-red-500">
              <Trash className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {teacher
                  ? `${teacher.firstName} ${teacher.lastName}`
                  : "No Teacher Assigned"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{students.length} students</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">Edit</Button>
            <Button size="sm" variant="outline" className="flex-1">View</Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="Grades & Classes"
        description="Manage all grades and classes in your school"
      >
        <Tabs defaultValue="classes">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>
          <TabsContent value="classes" className="space-y-6 pt-6">
            {grades.map(renderGradeClasses)}
          </TabsContent>
          <TabsContent value="grades" className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">All Grades</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Grade
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grades.map((grade) => (
                <Card key={grade.id} className="glass glass-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{grade.name} Grade</span>
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {classes.filter((cls) => cls.grade.id === grade.id).length} classes
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1">View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </DashboardLayout>
  );
}
