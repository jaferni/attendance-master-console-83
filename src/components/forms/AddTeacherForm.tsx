
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Teacher } from "@/types/user";
import { v4 as uuidv4 } from 'uuid';

interface AddTeacherFormProps {
  open: boolean;
  onClose: () => void;
  onTeacherAdded: (teacher: Teacher) => void;
}

export function AddTeacherForm({ open, onClose, onTeacherAdded }: AddTeacherFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate a UUID for the new teacher
      const teacherId = uuidv4();
      
      // Step 1: Insert into profiles table
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: teacherId,
          first_name: firstName,
          last_name: lastName,
          role: 'teacher'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Step 2: Create teacher object for the app context
      const newTeacher: Teacher = {
        id: teacherId,
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: email,
        role: "teacher",
        classes: []
      };
      
      // Notify parent component
      onTeacherAdded(newTeacher);
      
      // Show success message
      toast({
        title: "Teacher added",
        description: `${firstName} ${lastName} has been added successfully.`
      });
      
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      
      // Close dialog
      onClose();
      
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error adding teacher",
        description: "There was a problem adding the teacher.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
