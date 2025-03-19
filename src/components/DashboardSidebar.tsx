
import { Calendar, CheckSquare, ClipboardList, Cog, GraduationCap, Home, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SchoolLogo } from "./SchoolLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function SidebarLink({ href, icon: Icon, label, isActive }: SidebarLinkProps) {
  return (
    <Link to={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
}

export function DashboardSidebar() {
  const location = useLocation();
  const { user, logout, isSuperAdmin, isTeacher, isStudent } = useAuth();
  
  const superadminLinks = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/grades", icon: GraduationCap, label: "Grades & Classes" },
    { href: "/dashboard/teachers", icon: Users, label: "Teachers" },
    { href: "/dashboard/students", icon: Users, label: "Students" },
    { href: "/dashboard/attendance", icon: CheckSquare, label: "Attendance" },
    { href: "/dashboard/holidays", icon: Calendar, label: "Holidays" },
    { href: "/dashboard/settings", icon: Cog, label: "Settings" },
  ];

  const teacherLinks = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/classes", icon: GraduationCap, label: "My Classes" },
    { href: "/dashboard/attendance", icon: CheckSquare, label: "Attendance" },
    { href: "/dashboard/settings", icon: Cog, label: "Settings" },
  ];

  const studentLinks = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/attendance", icon: ClipboardList, label: "My Attendance" },
    { href: "/dashboard/settings", icon: Cog, label: "Settings" },
  ];

  const links = isSuperAdmin() ? superadminLinks : (isTeacher() ? teacherLinks : studentLinks);

  return (
    <div className="flex h-screen flex-col border-r bg-card shadow-subtle">
      <div className="flex h-14 items-center px-4 border-b">
        <SchoolLogo />
      </div>
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="grid gap-1">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isActive={location.pathname === link.href}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
