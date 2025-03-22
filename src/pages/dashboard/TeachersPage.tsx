import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { Edit, GraduationCap, Mail, Phone, Plus, Search, Trash } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { AddTeacherForm } from "@/components/forms/AddTeacherForm";
import { Teacher } from "@/types/user";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TeachersPage() {
  const { user } = useContext(AuthContext);
  const { teachers, getClassesForTeacher, fetchData } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const { toast } = useToast();
  
  // Edit teacher states
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }
  
  // Filter teachers based on search
  const filteredTeachers = teachers.filter((teacher) => {
    return (
      searchQuery === "" ||
      `${teacher.firstName} ${teacher.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleTeacherAdded = () => {
    // Refresh data from the server
    fetchData();
  };
  
  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFirstName(teacher.firstName);
    setEditLastName(teacher.lastName);
    setEditEmail(teacher.email);
    setIsEditTeacherOpen(true);
  };
  
  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTeacher) return;
    
    setIsSubmitting(true);
    
    try {
      // Update teacher in the database - using profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFirstName,
          last_name: editLastName
        })
        .eq('id', editingTeacher.id)
        .eq('role', 'teacher'); // Make sure we only update teachers
      
      if (error) throw error;
      
      toast({
        title: "Teacher updated",
        description: `${editFirstName} ${editLastName} has been updated successfully.`
      });
      
      // Refresh data
      fetchData();
      
      // Close dialog
      setIsEditTeacherOpen(false);
      setEditingTeacher(null);
      
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error updating teacher",
        description: "There was a problem updating the teacher.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openDeleteDialog = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      // Delete teacher from the database - using profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', teacherToDelete.id)
        .eq('role', 'teacher'); // Make sure we only delete teachers
      
      if (error) throw error;
      
      toast({
        title: "Teacher deleted",
        description: `${teacherToDelete.firstName} ${teacherToDelete.lastName} has been deleted.`
      });
      
      // Refresh data
      fetchData();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setTeacherToDelete(null);
      
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error deleting teacher",
        description: "There was a problem deleting the teacher.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="Teachers"
        description="Manage all teachers in your school"
      >
        <div className="space-y-6">
          {/* Search and add */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              className="shrink-0"
              onClick={() => setIsAddTeacherOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Teacher
            </Button>
          </div>

          {/* Teachers cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => {
              const teacherClasses = getClassesForTeacher(teacher.id);
              
              return (
                <div
                  key={teacher.id}
                  className="group rounded-xl border glass glass-hover p-6 animate-slide-up"
                >
                  <div className="flex items-center justify-between mb-4">
                    <UserAvatar user={teacher} size="lg" />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => openDeleteDialog(teacher)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.email}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Assigned Classes</h4>
                    {teacherClasses.length > 0 ? (
                      <div className="space-y-2">
                        {teacherClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                          >
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <span>
                              {cls.name} ({cls.students.length} students)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No classes assigned yet
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found matching your search
            </div>
          )}
        </div>
        
        {/* Add Teacher Dialog */}
        <AddTeacherForm
          open={isAddTeacherOpen}
          onClose={() => setIsAddTeacherOpen(false)}
          onTeacherAdded={handleTeacherAdded}
        />
        
        {/* Edit Teacher Dialog */}
        <Dialog open={isEditTeacherOpen} onOpenChange={(isOpen) => !isOpen && setIsEditTeacherOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>
                Update teacher information.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditTeacher} className="space-y-4 py-4">
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
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditTeacherOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => !isOpen && setIsDeleteDialogOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Teacher</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this teacher? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {teacherToDelete && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
                  <UserAvatar user={teacherToDelete} size="sm" />
                  <div>
                    <div className="font-medium">
                      {teacherToDelete.firstName} {teacherToDelete.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {teacherToDelete.email}
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
                onClick={handleDeleteTeacher}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Teacher"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </DashboardLayout>
  );
}
