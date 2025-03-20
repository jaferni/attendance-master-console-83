import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { Class, Grade } from "@/types/class";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Trash, User, Users, Pencil } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Form schemas
const gradeSchema = z.object({
  name: z.string().min(1, "Grade name is required"),
});

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  gradeId: z.string().min(1, "Grade is required"),
  subject: z.string().optional(),
  description: z.string().optional(),
});

type GradeFormValues = z.infer<typeof gradeSchema>;
type ClassFormValues = z.infer<typeof classSchema>;

export default function GradesClassesPage() {
  const { user } = useContext(AuthContext);
  const { 
    grades, 
    classes,
    getTeacherById,
    getStudentsInClass,
    addGrade,
    updateGrade,
    deleteGrade,
    addClass,
    updateClass,
    deleteClass,
  } = useContext(AppContext);
  
  // Dialog states
  const [showAddGradeDialog, setShowAddGradeDialog] = useState(false);
  const [showEditGradeDialog, setShowEditGradeDialog] = useState(false);
  const [showAddClassDialog, setShowAddClassDialog] = useState(false);
  const [showEditClassDialog, setShowEditClassDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Initialize forms
  const gradeForm = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: "",
    },
  });

  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      gradeId: "",
      subject: "",
      description: "",
    },
  });
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }

  // Form handlers
  const handleAddGrade = (data: GradeFormValues) => {
    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      name: data.name,
    };
    
    addGrade(newGrade);
    setShowAddGradeDialog(false);
    gradeForm.reset();
    
    toast({
      title: "Grade Added",
      description: `${data.name} grade has been added successfully.`,
    });
  };

  const handleEditGrade = (data: GradeFormValues) => {
    if (selectedGrade) {
      const updatedGrade: Grade = {
        ...selectedGrade,
        name: data.name,
      };
      
      updateGrade(updatedGrade);
      setShowEditGradeDialog(false);
      gradeForm.reset();
      
      toast({
        title: "Grade Updated",
        description: `${data.name} grade has been updated successfully.`,
      });
    }
  };

  const handleDeleteGrade = (gradeId: string) => {
    const gradeClasses = classes.filter(cls => cls.grade.id === gradeId);
    
    if (gradeClasses.length > 0) {
      toast({
        title: "Cannot Delete Grade",
        description: "This grade has associated classes. Please delete the classes first.",
        variant: "destructive",
      });
      return;
    }
    
    deleteGrade(gradeId);
    
    toast({
      title: "Grade Deleted",
      description: "The grade has been deleted successfully.",
    });
  };

  const handleAddClass = (data: ClassFormValues) => {
    const grade = grades.find(g => g.id === data.gradeId);
    
    if (!grade) {
      toast({
        title: "Error",
        description: "Selected grade not found.",
        variant: "destructive",
      });
      return;
    }
    
    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: data.name,
      grade,
      grade_id: data.gradeId,
      teacherId: undefined,
      students: [],
      subject: data.subject,
      description: data.description,
    };
    
    addClass(newClass);
    setShowAddClassDialog(false);
    classForm.reset();
    
    toast({
      title: "Class Added",
      description: `${data.name} class has been added successfully.`,
    });
  };

  const handleEditClass = (data: ClassFormValues) => {
    if (selectedClass) {
      const grade = grades.find(g => g.id === data.gradeId);
      
      if (!grade) {
        toast({
          title: "Error",
          description: "Selected grade not found.",
          variant: "destructive",
        });
        return;
      }
      
      const updatedClass: Class = {
        ...selectedClass,
        name: data.name,
        grade,
        grade_id: data.gradeId,
        subject: data.subject,
        description: data.description,
      };
      
      updateClass(updatedClass);
      setShowEditClassDialog(false);
      classForm.reset();
      
      toast({
        title: "Class Updated",
        description: `${data.name} class has been updated successfully.`,
      });
    }
  };

  const handleDeleteClass = (classId: string) => {
    const students = getStudentsInClass(classId);
    
    if (students.length > 0) {
      toast({
        title: "Cannot Delete Class",
        description: "This class has students assigned to it. Please reassign the students first.",
        variant: "destructive",
      });
      return;
    }
    
    deleteClass(classId);
    
    toast({
      title: "Class Deleted",
      description: "The class has been deleted successfully.",
    });
  };

  // Open edit dialogs and populate forms
  const openEditGradeDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    gradeForm.reset({
      name: grade.name,
    });
    setShowEditGradeDialog(true);
  };

  const openEditClassDialog = (classData: Class) => {
    setSelectedClass(classData);
    classForm.reset({
      name: classData.name,
      gradeId: classData.grade.id,
      subject: classData.subject || "",
      description: classData.description || "",
    });
    setShowEditClassDialog(true);
  };
  
  const renderGradeClasses = (grade: Grade) => {
    const gradeClasses = classes.filter((cls) => cls.grade.id === grade.id);
    
    return (
      <div key={grade.id} className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {grade.name} Grade
          </h3>
          <Button 
            size="sm" 
            onClick={() => {
              classForm.reset({ name: "", gradeId: grade.id, subject: "", description: "" });
              setShowAddClassDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Class
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gradeClasses.map((cls) => (
            <ClassCard 
              key={cls.id} 
              classData={cls} 
              onEdit={() => openEditClassDialog(cls)} 
              onDelete={() => handleDeleteClass(cls.id)} 
            />
          ))}
        </div>
      </div>
    );
  };
  
  const ClassCard = ({ 
    classData, 
    onEdit, 
    onDelete 
  }: { 
    classData: Class; 
    onEdit: () => void; 
    onDelete: () => void; 
  }) => {
    const teacher = classData.teacherId
      ? getTeacherById(classData.teacherId)
      : undefined;
    
    const students = getStudentsInClass(classData.id);
    
    return (
      <Card className="glass glass-hover overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>{classData.name}</span>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={onDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {classData.subject && (
            <p className="text-sm text-muted-foreground">Subject: {classData.subject}</p>
          )}
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
            <Button size="sm" className="flex-1" onClick={onEdit}>
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">All Grades</h3>
              <Button size="sm" onClick={() => setShowAddGradeDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Grade
              </Button>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade Name</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => {
                    const gradeClasses = classes.filter((cls) => cls.grade.id === grade.id);
                    const studentCount = gradeClasses.reduce(
                      (acc, cls) => acc + getStudentsInClass(cls.id).length, 
                      0
                    );
                    
                    return (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.name} Grade</TableCell>
                        <TableCell>{gradeClasses.length}</TableCell>
                        <TableCell>{studentCount}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mr-2"
                            onClick={() => openEditGradeDialog(grade)}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500"
                            onClick={() => handleDeleteGrade(grade.id)}
                          >
                            <Trash className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Grade Dialog */}
        <Dialog open={showAddGradeDialog} onOpenChange={setShowAddGradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Grade</DialogTitle>
              <DialogDescription>
                Create a new grade for your school.
              </DialogDescription>
            </DialogHeader>
            <Form {...gradeForm}>
              <form onSubmit={gradeForm.handleSubmit(handleAddGrade)} className="space-y-4">
                <FormField
                  control={gradeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. First, Second, Third..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Grade</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Grade Dialog */}
        <Dialog open={showEditGradeDialog} onOpenChange={setShowEditGradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Grade</DialogTitle>
              <DialogDescription>
                Update the grade information.
              </DialogDescription>
            </DialogHeader>
            <Form {...gradeForm}>
              <form onSubmit={gradeForm.handleSubmit(handleEditGrade)} className="space-y-4">
                <FormField
                  control={gradeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. First, Second, Third..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Update Grade</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Class Dialog */}
        <Dialog open={showAddClassDialog} onOpenChange={setShowAddClassDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Create a new class in your school.
              </DialogDescription>
            </DialogHeader>
            <Form {...classForm}>
              <form onSubmit={classForm.handleSubmit(handleAddClass)} className="space-y-4">
                <FormField
                  control={classForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Class A, Class B..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name} Grade
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics, Science..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the class..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Class</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={showEditClassDialog} onOpenChange={setShowEditClassDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update the class information.
              </DialogDescription>
            </DialogHeader>
            <Form {...classForm}>
              <form onSubmit={classForm.handleSubmit(handleEditClass)} className="space-y-4">
                <FormField
                  control={classForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Class A, Class B..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name} Grade
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics, Science..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={classForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the class..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Update Class</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </DashboardLayout>
  );
}
