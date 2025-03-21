
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/user";
import { Grade, Class } from "@/types/class";

interface AddStudentFormProps {
  open: boolean;
  onClose: () => void;
  onStudentAdded: (student: Student) => void;
  grades: Grade[];
  classes: Class[];
}

export function AddStudentForm({ open, onClose, onStudentAdded, grades, classes }: AddStudentFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [classId, setClassId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  
  const { toast } = useToast();

  // Update filtered classes when grade changes
  useEffect(() => {
    if (gradeId) {
      const classesInGrade = classes.filter(c => c.grade.id === gradeId);
      setFilteredClasses(classesInGrade);
      
      // Reset class selection if the current selection isn't in this grade
      if (classId && !classesInGrade.some(c => c.id === classId)) {
        setClassId("");
      }
    } else {
      setFilteredClasses([]);
      setClassId("");
    }
  }, [gradeId, classes, classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !gradeId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the student into the database
      const { data, error } = await supabase
        .from('students')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          grade_id: gradeId,
          class_id: classId || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create student object for the app context
      const newStudent: Student = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: "student",
        gradeId: data.grade_id,
        classId: data.class_id || ""
      };
      
      // Notify parent component
      onStudentAdded(newStudent);
      
      // Show success message
      toast({
        title: "Student added",
        description: `${firstName} ${lastName} has been added successfully.`
      });
      
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setGradeId("");
      setClassId("");
      
      // Close dialog
      onClose();
      
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error adding student",
        description: "There was a problem adding the student.",
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
          <DialogTitle>Add New Student</DialogTitle>
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
          
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={gradeId}
              onValueChange={setGradeId}
            >
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name} Grade
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="class">Class (Optional)</Label>
            <Select
              value={classId}
              onValueChange={setClassId}
              disabled={!gradeId || filteredClasses.length === 0}
            >
              <SelectTrigger id="class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {filteredClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {gradeId && filteredClasses.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No classes available for this grade
              </p>
            )}
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
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
