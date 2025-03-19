
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { 
  useGrades, 
  useAddGrade, 
  useUpdateGrade, 
  useDeleteGrade, 
  useClasses,
  useAddClass,
  useUpdateClass,
  useDeleteClass,
  useTeachers,
  useStudentsInClass
} from "@/hooks/useSupabase";
import { GraduationCap, Loader2, Pencil, Plus, Trash, User, Users } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Form schemas
const gradeSchema = z.object({
  name: z.string().min(1, "Grade name is required")
});

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  gradeId: z.string().min(1, "Grade is required"),
  teacherId: z.string().optional()
});

export default function GradesClassesPage() {
  const { user } = useAuth();
  const { data: grades, isLoading: isLoadingGrades } = useGrades();
  const { data: teachers } = useTeachers();
  const addGrade = useAddGrade();
  const updateGrade = useUpdateGrade();
  const deleteGrade = useDeleteGrade();
  const addClassMutation = useAddClass();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();
  
  const [editingGrade, setEditingGrade] = useState<{id: string, name: string} | null>(null);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  
  // Form setup for grade
  const gradeForm = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: ""
    }
  });
  
  // Form setup for class
  const classForm = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      gradeId: "",
      teacherId: undefined
    }
  });
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }
  
  const handleAddGrade = (values: z.infer<typeof gradeSchema>) => {
    addGrade.mutate(values.name, {
      onSuccess: () => {
        gradeForm.reset();
      }
    });
  };
  
  const handleUpdateGrade = (values: z.infer<typeof gradeSchema>) => {
    if (!editingGrade) return;
    
    updateGrade.mutate({
      id: editingGrade.id,
      name: values.name
    }, {
      onSuccess: () => {
        setEditingGrade(null);
        gradeForm.reset();
      }
    });
  };
  
  const prepareEditGrade = (grade: {id: string, name: string}) => {
    setEditingGrade(grade);
    gradeForm.reset({
      name: grade.name
    });
  };
  
  const handleAddClass = (values: z.infer<typeof classSchema>) => {
    addClassMutation.mutate({
      name: values.name,
      gradeId: values.gradeId,
      teacherId: values.teacherId
    }, {
      onSuccess: () => {
        classForm.reset();
      }
    });
  };
  
  const handleUpdateClass = (values: z.infer<typeof classSchema>) => {
    if (!editingClass) return;
    
    updateClassMutation.mutate({
      id: editingClass.id,
      name: values.name,
      gradeId: values.gradeId,
      teacherId: values.teacherId === "" ? null : values.teacherId
    }, {
      onSuccess: () => {
        setEditingClass(null);
        classForm.reset();
      }
    });
  };
  
  const prepareEditClass = (classData: any) => {
    setEditingClass(classData);
    classForm.reset({
      name: classData.name,
      gradeId: classData.grade_id,
      teacherId: classData.teacher_id || undefined
    });
  };
  
  const handleDeleteGrade = (id: string) => {
    deleteGrade.mutate(id);
  };
  
  const handleDeleteClass = (id: string) => {
    deleteClassMutation.mutate(id);
  };
  
  const renderGradeClasses = (grade: any) => {
    const { data: classes, isLoading: isLoadingClasses } = useClasses(grade.id);
    
    return (
      <div key={grade.id} className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {grade.name} Grade
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
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
                          <Input placeholder="Enter class name" {...field} />
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
                          defaultValue={grade.id}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grades?.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.name} Grade
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
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign a teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {teachers?.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.first_name} {teacher.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={addClassMutation.isPending}>
                      {addClassMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add Class
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoadingClasses ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : classes && classes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <ClassCard 
                key={cls.id} 
                classData={cls} 
                onEdit={() => prepareEditClass(cls)} 
                onDelete={() => handleDeleteClass(cls.id)}
                teachers={teachers || []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No classes found for this grade</p>
          </div>
        )}
      </div>
    );
  };
  
  const ClassCard = ({ 
    classData, 
    onEdit, 
    onDelete,
    teachers
  }: { 
    classData: any, 
    onEdit: () => void, 
    onDelete: () => void,
    teachers: any[]
  }) => {
    const { data: students } = useStudentsInClass(classData.id);
    const teacher = teachers?.find(t => t.id === classData.teacher_id);
    
    return (
      <Card className="glass glass-hover overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>{classData.name}</span>
            <div className="flex items-center gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Class</DialogTitle>
                  </DialogHeader>
                  <Form {...classForm}>
                    <form onSubmit={classForm.handleSubmit(handleUpdateClass)} className="space-y-4">
                      <FormField
                        control={classForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter class name" {...field} />
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
                              defaultValue={classData.grade_id}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {grades?.map((g) => (
                                  <SelectItem key={g.id} value={g.id}>
                                    {g.name} Grade
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
                        name="teacherId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teacher (Optional)</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={classData.teacher_id || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Assign a teacher" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {teachers?.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={updateClassMutation.isPending}>
                          {updateClassMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Class
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Class</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this class? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {teacher
                  ? `${teacher.first_name} ${teacher.last_name}`
                  : "No Teacher Assigned"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{students?.length || 0} students</span>
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
            {isLoadingGrades ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : grades && grades.length > 0 ? (
              grades.map(renderGradeClasses)
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No Grades Found</h3>
                <p className="text-muted-foreground mb-4">
                  You need to create grades before you can add classes
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Grade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Grade</DialogTitle>
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
                                <Input placeholder="Enter grade name (e.g. First, Second, etc.)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={addGrade.isPending}>
                            {addGrade.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Grade
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>
          <TabsContent value="grades" className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">All Grades</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Grade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGrade ? "Edit Grade" : "Add New Grade"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...gradeForm}>
                    <form 
                      onSubmit={gradeForm.handleSubmit(
                        editingGrade ? handleUpdateGrade : handleAddGrade
                      )} 
                      className="space-y-4"
                    >
                      <FormField
                        control={gradeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter grade name (e.g. First, Second, etc.)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button 
                            variant="outline" 
                            type="button" 
                            onClick={() => {
                              if (editingGrade) setEditingGrade(null);
                              gradeForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button 
                          type="submit" 
                          disabled={addGrade.isPending || updateGrade.isPending}
                        >
                          {(addGrade.isPending || updateGrade.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingGrade ? "Update Grade" : "Add Grade"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {isLoadingGrades ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : grades && grades.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grades.map((grade) => (
                  <Card key={grade.id} className="glass glass-hover">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>{grade.name} Grade</span>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => prepareEditGrade(grade)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Grade</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this grade? All classes in this grade will also be deleted. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteGrade(grade.id)} 
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {/* Classes will be shown here */}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            prepareEditGrade(grade);
                            document.querySelector('[data-dialog-trigger="true"]')?.click();
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedGradeId(grade.id);
                            document.querySelector('[data-tabs-trigger="classes"]')?.click();
                          }}
                        >
                          View Classes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No grades found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </DashboardLayout>
  );
}
