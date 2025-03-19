
export type Role = "superadmin" | "teacher" | "student";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Teacher extends User {
  role: "teacher";
  classes: string[]; // IDs of assigned classes
}

export interface Student extends User {
  role: "student";
  gradeId: string;
  classId: string;
}

export interface SuperAdmin extends User {
  role: "superadmin";
}
