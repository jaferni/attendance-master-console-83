
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Teacher } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface DeleteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onTeacherDeleted: () => void;
}

export function DeleteTeacherDialog({ open, onOpenChange, teacher, onTeacherDeleted }: DeleteTeacherDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleDeleteTeacher = async () => {
    if (!teacher) return;
    
    setIsSubmitting(true);
    
    try {
      // Delete teacher from the database - using profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', teacher.id)
        .eq('role', 'teacher'); // Make sure we only delete teachers
      
      if (error) throw error;
      
      toast({
        title: "Teacher deleted",
        description: `${teacher.firstName} ${teacher.lastName} has been deleted.`
      });
      
      // Refresh data
      onTeacherDeleted();
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error deleting teacher",
        description: "There was a problem deleting the teacher.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this teacher? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {teacher && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
              <UserAvatar user={teacher} size="sm" />
              <div>
                <div className="font-medium">
                  {teacher.firstName} {teacher.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {teacher.email}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteTeacher}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
