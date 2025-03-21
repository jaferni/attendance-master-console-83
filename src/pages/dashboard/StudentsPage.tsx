
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { Student } from "@/types/user";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function StudentsPage() {
  const { user } = useContext(AuthContext);
  const { students, grades, classes, getAttendanceForStudent, fetchData } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  
  // Edit student states
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editGradeId, setEditGradeId] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }
  
  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === "" ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade =
      selectedGrade === "all" || student.gradeId === selectedGrade;
    
    const matchesClass =
      selectedClass === "all" || student.classId === selectedClass;
    
    return matchesSearch && matchesGrade && matchesClass;
  });
  
  // Get the classes for the selected grade
  const gradeClasses = selectedGrade !== "all"
    ? classes.filter((cls) => cls.grade.id === selectedGrade)
    : [];

  const handleStudentAdded = (student: Student) => {
    // Refresh data from the server
    fetchData();
  };
  
  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setEditFirstName(student.firstName);
    setEditLastName(student.lastName);
    setEditEmail(student.email);
    setEditGradeId(student.gradeId);
    setEditClassId(student.classId);
    setIsEditStudentOpen(true);
  };
  
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStudent) return;
    
    setIsSubmitting(true);
    
    try {
      // Update student in the database
      const { error } = await supabase
        .from('students')
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          grade_id: editGradeId,
          class_id: editClassId
        })
        .eq('id', editingStudent.id);
      
      if (error) throw error;
      
      toast({
        title: "Student updated",
        description: `${editFirstName} ${editLastName} has been updated successfully.`
      });
      
      // Refresh data
      fetchData();
      
      // Close dialog
      setIsEditStudentOpen(false);
      setEditingStudent(null);
      
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error updating student",
        description: "There was a problem updating the student.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      // Delete student from the database
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Student deleted",
        description: `${studentToDelete.firstName} ${studentToDelete.lastName} has been deleted.`
      });
      
      // Refresh data
      fetchData();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
      
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error deleting student",
        description: "There was a problem deleting the student.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="Students"
        description="Manage all students in your school"
      >
        <div className="space-y-6">
          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name} Grade
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger
                className="w-full sm:w-[180px]"
                disabled={selectedGrade === "all"}
              >
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {gradeClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              className="shrink-0"
              onClick={() => setIsAddStudentOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Student
            </Button>
          </div>

          {/* Students table */}
          <div className="rounded-md border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Class</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Attendance</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => {
                  const studentClass = classes.find(
                    (c) => c.id === student.classId
                  );
                  
                  const attendance = getAttendanceForStudent(student.id);
                  const totalDays = attendance.length;
                  const presentDays = attendance.filter(
                    (record) => record.status === "present"
                  ).length;
                  
                  const attendanceRate = totalDays
                    ? Math.round((presentDays / totalDays) * 100)
                    : 0;
                  
                  let attendanceStatus: "present" | "absent" | "late" | "excused" = "present";
                  
                  if (attendanceRate < 60) {
                    attendanceStatus = "absent";
                  } else if (attendanceRate < 80) {
                    attendanceStatus = "late";
                  }
                  
                  return (
                    <tr key={student.id} className="animate-slide-up">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={student} size="sm" />
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {student.id.slice(0, 6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {studentClass?.name || "Unassigned"}
                      </td>
                      <td className="p-4">{student.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={attendanceStatus} />
                          <span>{attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => openDeleteDialog(student)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No students found matching your filters
              </div>
            )}
          </div>
        </div>
        
        {/* Add Student Dialog */}
        <AddStudentForm
          open={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          onStudentAdded={handleStudentAdded}
          grades={grades}
          classes={classes}
        />
        
        {/* Edit Student Dialog */}
        <Dialog open={isEditStudentOpen} onOpenChange={(isOpen) => !isOpen && setIsEditStudentOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleEditStudent} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editGrade">Grade</Label>
                <Select value={editGradeId} onValueChange={setEditGradeId}>
                  <SelectTrigger id="editGrade">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editClass">Class</Label>
                <Select 
                  value={editClassId} 
                  onValueChange={setEditClassId}
                  disabled={!editGradeId}
                >
                  <SelectTrigger id="editClass">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes
                      .filter((cls) => cls.grade.id === editGradeId)
                      .map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditStudentOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Student"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => !isOpen && setIsDeleteDialogOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Student</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
              
              {studentToDelete && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
                  <UserAvatar user={studentToDelete} size="sm" />
                  <div>
                    <div className="font-medium">
                      {studentToDelete.firstName} {studentToDelete.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {studentToDelete.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteStudent}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </DashboardLayout>
  );
}
