import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAddClass, useAddGrade, useClasses, useDeleteClass, useDeleteGrade, useGrades, useTeachers, useUpdateClass, useUpdateGrade } from "@/hooks/useSupabase";
import { PlusCircle, School, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

export default function GradesClassesPage() {
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("grades");
  
  // Grade form state
  const [newGradeName, setNewGradeName] = useState("");
  const [editGradeId, setEditGradeId] = useState<string | null>(null);
  const [editGradeName, setEditGradeName] = useState("");
  
  // Class form state
  const [newClassName, setNewClassName] = useState("");
  const [newClassGradeId, setNewClassGradeId] = useState("");
  const [newClassTeacherId, setNewClassTeacherId] = useState("");
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editClassGradeId, setEditClassGradeId] = useState("");
  const [editClassTeacherId, setEditClassTeacherId] = useState("");
  
  // Dialog states
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false);
  const [isEditGradeDialogOpen, setIsEditGradeDialogOpen] = useState(false);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [isDeleteGradeDialogOpen, setIsDeleteGradeDialogOpen] = useState(false);
  const [isDeleteClassDialogOpen, setIsDeleteClassDialogOpen] = useState(false);
  
  // Queries
  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses();
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();
  
  // Mutations
  const addGradeMutation = useAddGrade();
  const updateGradeMutation = useUpdateGrade();
  const deleteGradeMutation = useDeleteGrade();
  const addClassMutation = useAddClass();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();
  
  if (!user) return null;
  
  // Only superadmins can access this page
  if (!isSuperAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  // Handle grade operations
  const handleAddGrade = () => {
    if (!newGradeName.trim()) return;
    
    addGradeMutation.mutate(newGradeName, {
      onSuccess: () => {
        setNewGradeName("");
        setIsAddGradeDialogOpen(false);
      }
    });
  };
  
  const handleUpdateGrade = () => {
    if (!editGradeId || !editGradeName.trim()) return;
    
    updateGradeMutation.mutate({ id: editGradeId, name: editGradeName }, {
      onSuccess: () => {
        setEditGradeId(null);
        setEditGradeName("");
        setIsEditGradeDialogOpen(false);
      }
    });
  };
  
  const handleDeleteGrade = () => {
    if (!editGradeId) return;
    
    deleteGradeMutation.mutate(editGradeId, {
      onSuccess: () => {
        setEditGradeId(null);
        setIsDeleteGradeDialogOpen(false);
      }
    });
  };
  
  const openEditGradeDialog = (grade: any) => {
    setEditGradeId(grade.id);
    setEditGradeName(grade.name);
    setIsEditGradeDialogOpen(true);
  };
  
  const openDeleteGradeDialog = (grade: any) => {
    setEditGradeId(grade.id);
    setIsDeleteGradeDialogOpen(true);
  };
  
  // Handle class operations
  const handleAddClass = () => {
    if (!newClassName.trim() || !newClassGradeId) return;
    
    addClassMutation.mutate({
      name: newClassName,
      gradeId: newClassGradeId,
      teacherId: newClassTeacherId || undefined
    }, {
      onSuccess: () => {
        setNewClassName("");
        setNewClassGradeId("");
        setNewClassTeacherId("");
        setIsAddClassDialogOpen(false);
      }
    });
  };
  
  const handleUpdateClass = () => {
    if (!editClassId || !editClassName.trim() || !editClassGradeId) return;
    
    updateClassMutation.mutate({
      id: editClassId,
      name: editClassName,
      gradeId: editClassGradeId,
      teacherId: editClassTeacherId || null
    }, {
      onSuccess: () => {
        setEditClassId(null);
        setEditClassName("");
        setEditClassGradeId("");
        setEditClassTeacherId("");
        setIsEditClassDialogOpen(false);
      }
    });
  };
  
  const handleDeleteClass = () => {
    if (!editClassId) return;
    
    deleteClassMutation.mutate(editClassId, {
      onSuccess: () => {
        setEditClassId(null);
        setIsDeleteClassDialogOpen(false);
      }
    });
  };
  
  const openEditClassDialog = (classItem: any) => {
    setEditClassId(classItem.id);
    setEditClassName(classItem.name);
    setEditClassGradeId(classItem.grade_id);
    setEditClassTeacherId(classItem.teacher_id || "");
    setIsEditClassDialogOpen(true);
  };
  
  const openDeleteClassDialog = (classItem: any) => {
    setEditClassId(classItem.id);
    setIsDeleteClassDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <DashboardShell title="Grades & Classes" description="Manage school grades and classes">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Grades
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classes
            </TabsTrigger>
          </TabsList>
          
          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Grades</h2>
              <Dialog open={isAddGradeDialogOpen} onOpenChange={setIsAddGradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Grade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Grade</DialogTitle>
                    <DialogDescription>
                      Enter the name for the new grade.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="grade-name">Grade Name</Label>
                      <Input
                        id="grade-name"
                        value={newGradeName}
                        onChange={(e) => setNewGradeName(e.target.value)}
                        placeholder="e.g. First Grade"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddGradeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGrade} disabled={addGradeMutation.isPending}>
                      {addGradeMutation.isPending ? "Adding..." : "Add Grade"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingGrades ? (
                <p>Loading grades...</p>
              ) : grades.length > 0 ? (
                grades.map((grade: any) => (
                  <Card key={grade.id} className="glass glass-hover">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <span>{grade.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditGradeDialog(grade)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => openDeleteGradeDialog(grade)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {classes.filter((c: any) => c.grade_id === grade.id).length} Classes
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No grades found. Add your first grade to get started.</p>
              )}
            </div>
            
            {/* Edit Grade Dialog */}
            <Dialog open={isEditGradeDialogOpen} onOpenChange={setIsEditGradeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Grade</DialogTitle>
                  <DialogDescription>
                    Update the grade name.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-grade-name">Grade Name</Label>
                    <Input
                      id="edit-grade-name"
                      value={editGradeName}
                      onChange={(e) => setEditGradeName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditGradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateGrade} disabled={updateGradeMutation.isPending}>
                    {updateGradeMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Delete Grade Dialog */}
            <Dialog open={isDeleteGradeDialogOpen} onOpenChange={setIsDeleteGradeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Grade</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this grade? This action cannot be undone.
                    All classes associated with this grade will also be deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteGradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteGrade}
                    disabled={deleteGradeMutation.isPending}
                  >
                    {deleteGradeMutation.isPending ? "Deleting..." : "Delete Grade"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Classes</h2>
              <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new class.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="class-name">Class Name</Label>
                      <Input
                        id="class-name"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="e.g. Class 1A"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="class-grade">Grade</Label>
                      <Select
                        value={newClassGradeId}
                        onValueChange={setNewClassGradeId}
                      >
                        <SelectTrigger id="class-grade">
                          <SelectValue placeholder="Select a grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade: any) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="class-teacher">Teacher (Optional)</Label>
                      <Select
                        value={newClassTeacherId}
                        onValueChange={setNewClassTeacherId}
                      >
                        <SelectTrigger id="class-teacher">
                          <SelectValue placeholder="Assign a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {teachers.map((teacher: any) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.first_name} {teacher.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddClassDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddClass} disabled={addClassMutation.isPending}>
                      {addClassMutation.isPending ? "Adding..." : "Add Class"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingClasses ? (
                <p>Loading classes...</p>
              ) : classes.length > 0 ? (
                classes.map((classItem: any) => {
                  const grade = grades.find((g: any) => g.id === classItem.grade_id);
                  const teacher = teachers.find((t: any) => t.id === classItem.teacher_id);
                  
                  return (
                    <Card key={classItem.id} className="glass glass-hover">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between items-center">
                          <Link to={`/dashboard/classes/${classItem.id}`} className="hover:underline">
                            {classItem.name}
                          </Link>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditClassDialog(classItem)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => openDeleteClassDialog(classItem)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Grade: {grade ? grade.name : "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Teacher: {teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unassigned"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p>No classes found. Add your first class to get started.</p>
              )}
            </div>
            
            {/* Edit Class Dialog */}
            <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Class</DialogTitle>
                  <DialogDescription>
                    Update the class details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-class-name">Class Name</Label>
                    <Input
                      id="edit-class-name"
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-class-grade">Grade</Label>
                    <Select
                      value={editClassGradeId}
                      onValueChange={setEditClassGradeId}
                    >
                      <SelectTrigger id="edit-class-grade">
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade: any) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-class-teacher">Teacher (Optional)</Label>
                    <Select
                      value={editClassTeacherId}
                      onValueChange={setEditClassTeacherId}
                    >
                      <SelectTrigger id="edit-class-teacher">
                        <SelectValue placeholder="Assign a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {teachers.map((teacher: any) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditClassDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateClass} disabled={updateClassMutation.isPending}>
                    {updateClassMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Delete Class Dialog */}
            <Dialog open={isDeleteClassDialogOpen} onOpenChange={setIsDeleteClassDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Class</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this class? This action cannot be undone.
                    All student enrollments for this class will also be deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteClassDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteClass}
                    disabled={deleteClassMutation.isPending}
                  >
                    {deleteClassMutation.isPending ? "Deleting..." : "Delete Class"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </DashboardLayout>
  );
}
