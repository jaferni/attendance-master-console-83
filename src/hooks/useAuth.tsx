import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Role } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Check if user has a specific role
  const hasRole = (role: Role | Role[]) => {
    if (!context.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(context.user.role);
    }
    
    return context.user.role === role;
  };
  
  // Check if user is a superadmin
  const isSuperAdmin = () => {
    return context.user?.role === 'superadmin';
  };
  
  // Check if user is a teacher
  const isTeacher = () => {
    return context.user?.role === 'teacher';
  };
  
  // Check if user is a student
  const isStudent = () => {
    return context.user?.role === 'student';
  };
  
  // Check if user can access specific class (teacher assigned to class or superadmin)
  const canAccessClass = async (classId: string) => {
    if (!context.user) return false;
    
    if (context.user.role === 'superadmin') return true;
    
    if (context.user.role === 'teacher') {
      // Check if teacher is assigned to the class
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .eq('teacher_id', context.user.id)
        .single();
        
      return !!data;
    }
    
    if (context.user.role === 'student') {
      // Check if student is enrolled in the class
      const { data } = await supabase
        .from('student_classes')
        .select('*')
        .eq('class_id', classId)
        .eq('student_id', context.user.id)
        .single();
        
      return !!data;
    }
    
    return false;
  };
  
  return {
    ...context,
    hasRole,
    isSuperAdmin,
    isTeacher,
    isStudent,
    canAccessClass,
  };
}
