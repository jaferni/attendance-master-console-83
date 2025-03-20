
import { Student } from "./user";

export interface Grade {
  id: string;
  name: string;
  created_at?: string;
}

export interface Class {
  id: string;
  name: string;
  grade: Grade;
  grade_id: string;
  teacherId?: string;
  students: Student[];
  subject?: string;
  description?: string;
  created_at?: string;
}
