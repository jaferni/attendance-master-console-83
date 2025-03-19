
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Class } from "@/types/class";
import { GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface ClassCardProps {
  classData: Class;
  className?: string;
}

export function ClassCard({ classData, className }: ClassCardProps) {
  return (
    <Link to={`/dashboard/classes/${classData.id}`}>
      <Card className={cn("glass glass-hover h-full transition-all", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between">
            <span>{classData.name}</span>
            <GraduationCap className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{classData.grade.name} Grade</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>{classData.students.length} students</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
