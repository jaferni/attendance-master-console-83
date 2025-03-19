import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { AttendanceStatus } from "@/types/attendance";
import { format } from "date-fns";

// Grades
export const useGrades = () => {
  return useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useAddGrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('grades')
        .insert([{ name }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({
        title: "Grade Added",
        description: "The grade has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Grade",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      const { data, error } = await supabase
        .from('grades')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({
        title: "Grade Updated",
        description: "The grade has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Grade",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({
        title: "Grade Deleted",
        description: "The grade has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Grade",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};

// Classes
export const useClasses = (gradeId?: string) => {
  return useQuery({
    queryKey: ['classes', gradeId],
    queryFn: async () => {
      let query = supabase
        .from('classes')
        .select(`
          *,
          grade:grades(*)
        `)
        .order('name');
        
      if (gradeId) {
        query = query.eq('grade_id', gradeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !gradeId || !!gradeId
  });
};

export const useClassesForTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: ['classes', 'teacher', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          grade:grades(*)
        `)
        .eq('teacher_id', teacherId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId
  });
};

export const useAddClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ name, gradeId, teacherId }: { name: string, gradeId: string, teacherId?: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{ 
          name, 
          grade_id: gradeId,
          teacher_id: teacherId || null
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Class Added",
        description: "The class has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Class",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      gradeId, 
      teacherId 
    }: { 
      id: string, 
      name?: string, 
      gradeId?: string, 
      teacherId?: string | null
    }) => {
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (gradeId !== undefined) updates.grade_id = gradeId;
      if (teacherId !== undefined) updates.teacher_id = teacherId;
      
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Class Updated",
        description: "The class has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Class",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Class Deleted",
        description: "The class has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Class",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};

// Teachers
export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('last_name');
      
      if (error) throw error;
      return data;
    }
  });
};

// Students
export const useStudentsInClass = (classId: string) => {
  return useQuery({
    queryKey: ['students', 'class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          student_id,
          profiles:student_id(*)
        `)
        .eq('class_id', classId);
      
      if (error) throw error;
      
      // Extract the profiles from the joined data
      return data.map(item => item.profiles);
    },
    enabled: !!classId
  });
};

// Attendance
export const useAttendanceForClass = (classId: string, date: Date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['attendance', classId, formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_attendance_for_class', {
        p_class_id: classId,
        p_date: formattedDate
      });
      
      if (error) {
        // Fallback to direct query if RPC is not available
        const { data: directData, error: directError } = await supabase
          .from('attendance')
          .select('*')
          .eq('class_id', classId)
          .eq('date', formattedDate);
          
        if (directError) throw directError;
        return directData;
      }
      
      return data;
    },
    enabled: !!classId && !!date
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      classId, 
      records, 
      date, 
      recordedBy 
    }: { 
      classId: string, 
      records: Record<string, AttendanceStatus>, 
      date: Date,
      recordedBy: string
    }) => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // First delete existing records
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .eq('class_id', classId)
        .eq('date', formattedDate);
        
      if (deleteError) throw deleteError;
      
      // Then insert new records
      const recordsToInsert = Object.entries(records).map(([studentId, status]) => ({
        class_id: classId,
        student_id: studentId,
        date: formattedDate,
        status,
        recorded_by: recordedBy
      }));
      
      if (recordsToInsert.length === 0) return { success: true };
      
      const { error: insertError } = await supabase
        .from('attendance')
        .insert(recordsToInsert);
        
      if (insertError) throw insertError;
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      const formattedDate = format(variables.date, 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.classId, formattedDate] });
      toast({
        title: "Attendance Saved",
        description: "The attendance records have been successfully saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save Attendance",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
};
