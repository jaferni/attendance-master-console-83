
import { Bell, Search } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardHeader() {
  const { user } = useContext(AuthContext);
  const isMobile = useIsMobile();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur-md">
      {!isMobile && (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-9 rounded-full bg-muted/30"
          />
        </div>
      )}
      <div className="ml-auto flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {user.firstName} {user.lastName}
          </span>
          <UserAvatar user={user} size="sm" />
        </div>
      </div>
    </header>
  );
}
