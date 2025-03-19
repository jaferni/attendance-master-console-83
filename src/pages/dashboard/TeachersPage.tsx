
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

export default function TeachersPage() {
  const { user } = useContext(AuthContext);
  const { teachers, getClassesForTeacher } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState("");
  
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
            <Button className="shrink-0">
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
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
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
      </DashboardShell>
    </DashboardLayout>
  );
}
