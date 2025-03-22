
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Teacher } from "@/types/user";
import { GraduationCap, Mail, Phone, Edit, Trash } from "lucide-react";
import { Class } from "@/types/class";

interface TeacherCardProps {
  teacher: Teacher;
  teacherClasses: Class[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export function TeacherCard({ teacher, teacherClasses, onEdit, onDelete }: TeacherCardProps) {
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
              onClick={() => onEdit(teacher)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500"
              onClick={() => onDelete(teacher)}
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
}
