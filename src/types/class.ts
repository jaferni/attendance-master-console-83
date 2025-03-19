
import { Student } from "./user";

export interface Grade {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  grade: Grade;
  teacherId?: string;
  students: Student[];
}
