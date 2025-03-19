
import { GraduationCap } from "lucide-react";

export function SchoolLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className="font-semibold text-lg">EduTrack</span>
    </div>
  );
}
