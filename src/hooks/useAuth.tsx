
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Role } from '@/types/user';

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
  const canAccessClass = (classId: string) => {
    if (!context.user) return false;
    
    if (context.user.role === 'superadmin') return true;
    
    if (context.user.role === 'teacher') {
      return (context.user as any).classes?.includes(classId);
    }
    
    if (context.user.role === 'student') {
      return (context.user as any).classId === classId;
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
