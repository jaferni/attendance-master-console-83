import { toast } from "@/hooks/use-toast";
import { Class } from "@/types/class";
import { Student } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export function getClassById(classes: Class[], classId: string): Class | undefined {
  return classes.find((c) => c.id === classId);
}

export function getClassesForTeacher(classes: Class[], teacherId: string): Class[] {
  return classes.filter((c) => c.teacherId === teacherId);
}

export function getStudentsInClass(students: Student[], classId: string): Student[] {
  return students.filter((student) => student.classId === classId);
}

export async function addClass(
  classData: Class,
  setClasses: (updater: (prev: Class[]) => Class[]) => void
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: classData.name,
        grade_id: classData.grade.id,
        teacher_id: classData.teacherId,
        subject: classData.subject,
        description: classData.description
      })
      .select(`
        *,
        grade:grades(*)
      `)
      .single();
    
    if (error) throw error;
    
    const newClass: Class = {
      id: data.id,
      name: data.name,
      grade: data.grade,
      grade_id: data.grade_id,
      teacherId: data.teacher_id,
      subject: data.subject,
      description: data.description,
      students: [],
      created_at: data.created_at
    };
    
    setClasses((prev) => [...prev, newClass]);
    
    toast({
      title: "Class added",
      description: `${newClass.name} has been added successfully.`,
    });
    
  } catch (error) {
    console.error('Error adding class:', error);
    toast({
      title: "Error adding class",
      description: "There was a problem adding the class.",
      variant: "destructive"
    });
  }
}

export async function updateClass(
  updatedClass: Class,
  setClasses: (updater: (prev: Class[]) => Class[]) => void,
  fetchData: () => Promise<void>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('classes')
      .update({
        name: updatedClass.name,
        grade_id: updatedClass.grade.id,
        teacher_id: updatedClass.teacherId,
        subject: updatedClass.subject,
        description: updatedClass.description
      })
      .eq('id', updatedClass.id);
    
    if (error) throw error;
    
    setClasses((prev) => 
      prev.map((cls) => 
        cls.id === updatedClass.id ? updatedClass : cls
      )
    );
    
    toast({
      title: "Class updated",
      description: `${updatedClass.name} has been updated successfully.`,
    });
    
    fetchData();
    
  } catch (error) {
    console.error('Error updating class:', error);
    toast({
      title: "Error updating class",
      description: "There was a problem updating the class.",
      variant: "destructive"
    });
  }
}

export async function deleteClass(
  classId: string,
  setClasses: (updater: (prev: Class[]) => Class[]) => void,
  fetchData: () => Promise<void>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    
    if (error) throw error;
    
    setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    
    toast({
      title: "Class deleted",
      description: "The class has been deleted successfully.",
    });
    
    fetchData();
    
  } catch (error) {
    console.error('Error deleting class:', error);
    toast({
      title: "Error deleting class",
      description: "There was a problem deleting the class.",
      variant: "destructive"
    });
  }
}

export async function assignTeacherToClass(
  teacherId: string,
  classId: string,
  setClasses: (updater: (prev: Class[]) => Class[]) => void,
  setTeachers: (updater: (prev: any[]) => any[]) => void
): Promise<void> {
  try {
    const { error } = await supabase
      .from('classes')
      .update({ teacher_id: teacherId })
      .eq('id', classId);
    
    if (error) throw error;
    
    setClasses((prevClasses) =>
      prevClasses.map((c) =>
        c.id === classId ? { ...c, teacherId } : c
      )
    );
    
    setTeachers((prevTeachers) =>
      prevTeachers.map((t) =>
        t.id === teacherId
          ? { ...t, classes: [...t.classes, classId] }
          : t
      )
    );
    
    toast({
      title: "Teacher assigned",
      description: "Teacher has been assigned to the class successfully.",
    });
    
  } catch (error) {
    console.error('Error assigning teacher:', error);
    toast({
      title: "Error assigning teacher",
      description: "There was a problem assigning the teacher to the class.",
      variant: "destructive"
    });
  }
}

export function getTeacherById(teachers: any[], teacherId: string) {
  return teachers.find((t) => t.id === teacherId);
}
