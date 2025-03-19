
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { ClassCard } from "@/components/dashboard/ClassCard";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

export default function ClassesPage() {
  const { user } = useContext(AuthContext);
  const { getClassesForTeacher } = useContext(AppContext);
  
  if (!user) return null;
  
  // Only teachers should access this page
  if (user.role !== "teacher") {
    return <Navigate to="/dashboard" />;
  }
  
  const teacherClasses = getClassesForTeacher(user.id);
  
  return (
    <DashboardLayout>
      <DashboardShell
        title="My Classes"
        description="Manage and view your assigned classes"
      >
        {teacherClasses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teacherClasses.map((cls) => (
              <ClassCard key={cls.id} classData={cls} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No Classes Assigned</h3>
            <p className="text-muted-foreground">
              You haven't been assigned to any classes yet.
            </p>
          </div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
}
