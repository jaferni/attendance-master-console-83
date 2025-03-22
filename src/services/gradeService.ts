import { toast } from "@/hooks/use-toast";
import { Grade } from "@/types/class";
import { supabase } from "@/integrations/supabase/client";

export async function addGrade(
  grade: Grade,
  setGrades: (updater: (prev: Grade[]) => Grade[]) => void
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('grades')
      .insert({
        name: grade.name
      })
      .select()
      .single();
    
    if (error) throw error;
    
    setGrades((prev) => [...prev, data]);
    
    toast({
      title: "Grade added",
      description: `${data.name} grade has been added successfully.`,
    });
  } catch (error) {
    console.error('Error adding grade:', error);
    toast({
      title: "Error adding grade",
      description: "There was a problem adding the grade.",
      variant: "destructive"
    });
  }
}

export async function updateGrade(
  updatedGrade: Grade,
  setGrades: (updater: (prev: Grade[]) => Grade[]) => void,
  setClasses: (updater: (prev: any[]) => any[]) => void,
  fetchData: () => Promise<void>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('grades')
      .update({ name: updatedGrade.name })
      .eq('id', updatedGrade.id);
    
    if (error) throw error;
    
    setGrades((prev) => 
      prev.map((grade) => 
        grade.id === updatedGrade.id ? updatedGrade : grade
      )
    );
    
    setClasses((prev) =>
      prev.map((cls) =>
        cls.grade.id === updatedGrade.id
          ? { ...cls, grade: updatedGrade }
          : cls
      )
    );
    
    toast({
      title: "Grade updated",
      description: `${updatedGrade.name} grade has been updated successfully.`,
    });
    
    fetchData();
    
  } catch (error) {
    console.error('Error updating grade:', error);
    toast({
      title: "Error updating grade",
      description: "There was a problem updating the grade.",
      variant: "destructive"
    });
  }
}

export async function deleteGrade(
  gradeId: string,
  setGrades: (updater: (prev: Grade[]) => Grade[]) => void,
  fetchData: () => Promise<void>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);
    
    if (error) throw error;
    
    setGrades((prev) => prev.filter((grade) => grade.id !== gradeId));
    
    toast({
      title: "Grade deleted",
      description: "The grade has been deleted successfully.",
    });
    
    fetchData();
    
  } catch (error) {
    console.error('Error deleting grade:', error);
    toast({
      title: "Error deleting grade",
      description: "There was a problem deleting the grade.",
      variant: "destructive"
    });
  }
}
