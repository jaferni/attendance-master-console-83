
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Teacher } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onTeacherUpdated: () => void;
}

export function EditTeacherDialog({ open, onOpenChange, teacher, onTeacherUpdated }: EditTeacherDialogProps) {
  const [firstName, setFirstName] = useState(teacher?.firstName || "");
  const [lastName, setLastName] = useState(teacher?.lastName || "");
  const [email, setEmail] = useState(teacher?.email || "");
  const [password, setPassword] = useState("");
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update state when teacher changes
  if (teacher && (teacher.firstName !== firstName || teacher.lastName !== lastName || teacher.email !== email)) {
    setFirstName(teacher.firstName);
    setLastName(teacher.lastName);
    setEmail(teacher.email);
    setPassword("");
    setIsChangePassword(false);
  }

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacher) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare update data
      const updateData: Record<string, any> = {
        first_name: firstName,
        last_name: lastName,
        email: email
      };
      
      // Only include password in the update if the password change option is checked
      if (isChangePassword && password) {
        updateData.password = password;
      }
      
      // Update teacher in the teachers table
      const { error } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('id', teacher.id);
      
      if (error) throw error;
      
      toast({
        title: "Teacher updated",
        description: `${firstName} ${lastName} has been updated successfully.`
      });
      
      // Refresh data
      onTeacherUpdated();
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error updating teacher",
        description: "There was a problem updating the teacher.",
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
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Update teacher information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleEditTeacher} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">First Name</Label>
              <Input
                id="editFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editLastName">Last Name</Label>
              <Input
                id="editLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editEmail">Email</Label>
            <Input
              id="editEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input
              id="changePassword"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={isChangePassword}
              onChange={() => setIsChangePassword(!isChangePassword)}
            />
            <Label htmlFor="changePassword" className="text-sm font-medium cursor-pointer">
              Change password
            </Label>
          </div>
          
          {isChangePassword && (
            <div className="space-y-2">
              <Label htmlFor="editPassword">New Password</Label>
              <Input
                id="editPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required={isChangePassword}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
