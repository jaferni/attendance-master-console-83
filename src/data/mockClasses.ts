
import { Class } from "@/types/class";
import { grades } from "./mockGrades";
import { students } from "./mockStudents";
import { teachers } from "./mockTeachers";

// Create mock classes
export const classes: Class[] = [];

// Populate classes with students
grades.forEach((grade, gradeIndex) => {
  for (let i = 1; i <= 2; i++) {
    const classId = `class-${gradeIndex + 1}-${i}`;
    const teacher = teachers.find((t) => t.classes.includes(classId));
    
    classes.push({
      id: classId,
      name: `${grade.name} Grade - ${i === 1 ? 'A' : 'B'}`,
      grade,
      grade_id: grade.id,
      teacherId: teacher?.id,
      students: students.filter((student) => student.classId === classId),
    });
  }
});
