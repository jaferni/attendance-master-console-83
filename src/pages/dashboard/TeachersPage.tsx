
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { AddTeacherForm } from "@/components/forms/AddTeacherForm";
import { Teacher } from "@/types/user";
import { TeachersList } from "@/components/teachers/TeachersList";
import { EditTeacherDialog } from "@/components/teachers/EditTeacherDialog";
import { DeleteTeacherDialog } from "@/components/teachers/DeleteTeacherDialog";

export default function TeachersPage() {
  const { user } = useContext(AuthContext);
  const { teachers, getClassesForTeacher, fetchData } = useContext(AppContext);
  
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  
  // Edit teacher states
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  
  if (!user || user.role !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }

  const handleTeacherAdded = () => {
    // Refresh data from the server
    fetchData();
  };
  
  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsEditTeacherOpen(true);
  };
  
  const openDeleteDialog = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="Teachers"
        description="Manage all teachers in your school"
      >
        <TeachersList 
          teachers={teachers}
          getClassesForTeacher={getClassesForTeacher}
          onAddTeacher={() => setIsAddTeacherOpen(true)}
          onEditTeacher={openEditDialog}
          onDeleteTeacher={openDeleteDialog}
        />
        
        {/* Add Teacher Dialog */}
        <AddTeacherForm
          open={isAddTeacherOpen}
          onClose={() => setIsAddTeacherOpen(false)}
          onTeacherAdded={handleTeacherAdded}
        />
        
        {/* Edit Teacher Dialog */}
        <EditTeacherDialog
          open={isEditTeacherOpen}
          onOpenChange={setIsEditTeacherOpen}
          teacher={editingTeacher}
          onTeacherUpdated={handleTeacherAdded}
        />
        
        {/* Delete Confirmation Dialog */}
        <DeleteTeacherDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          teacher={teacherToDelete}
          onTeacherDeleted={handleTeacherAdded}
        />
      </DashboardShell>
    </DashboardLayout>
  );
}
