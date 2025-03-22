
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { Teacher } from "@/types/user";
import { Class } from "@/types/class";
import { TeacherCard } from "./TeacherCard";

interface TeachersListProps {
  teachers: Teacher[];
  getClassesForTeacher: (teacherId: string) => Class[];
  onAddTeacher: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacher: Teacher) => void;
}

export function TeachersList({ 
  teachers, 
  getClassesForTeacher, 
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher
}: TeachersListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
          onClick={onAddTeacher}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Teacher
        </Button>
      </div>

      {/* Teachers cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => {
          const teacherClasses = getClassesForTeacher(teacher.id);
          
          return (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              teacherClasses={teacherClasses}
              onEdit={onEditTeacher}
              onDelete={onDeleteTeacher}
            />
          );
        })}
      </div>
      {filteredTeachers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No teachers found matching your search
        </div>
      )}
    </div>
  );
}
