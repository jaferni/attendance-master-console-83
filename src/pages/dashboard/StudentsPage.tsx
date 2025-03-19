
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

export default function StudentsPage() {
  const { user } = useContext(AuthContext);
  const { students, grades, classes, getAttendanceForStudent } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  
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
            <Button className="shrink-0">
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
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
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
      </DashboardShell>
    </DashboardLayout>
  );
}
