
import { Student } from "@/types/user";
import { grades } from "./mockGrades";

// Create mock students
export const createMockStudents = (): Student[] => {
  const studentNames = [
    { first: "Alex", last: "Johnson" },
    { first: "Jamie", last: "Smith" },
    { first: "Taylor", last: "Williams" },
    { first: "Jordan", last: "Brown" },
    { first: "Casey", last: "Davis" },
    { first: "Riley", last: "Miller" },
    { first: "Avery", last: "Wilson" },
    { first: "Quinn", last: "Moore" },
    { first: "Peyton", last: "Taylor" },
    { first: "Morgan", last: "Anderson" },
    { first: "Cameron", last: "Thomas" },
    { first: "Reese", last: "Jackson" },
    { first: "Emery", last: "White" },
    { first: "Finley", last: "Harris" },
    { first: "Skyler", last: "Martin" },
    { first: "Blake", last: "Thompson" },
    { first: "Dakota", last: "Garcia" },
    { first: "Hayden", last: "Martinez" },
    { first: "Shawn", last: "Robinson" },
    { first: "Parker", last: "Clark" },
  ];

  return studentNames.map((name, index) => {
    const gradeIndex = Math.floor(index / 5);
    const grade = grades[gradeIndex % grades.length];
    const classIndex = index % 2;
    
    return {
      id: `student-${index + 1}`,
      firstName: name.first,
      lastName: name.last,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@school.edu`,
      role: "student" as const,
      gradeId: grade.id,
      classId: `class-${gradeIndex + 1}-${classIndex + 1}`,
      avatar: undefined,
    };
  });
};

// Generate mock students
export const students = createMockStudents();
