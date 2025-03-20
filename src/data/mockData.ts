
import { addDays, format, subDays } from "date-fns";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Class, Grade } from "@/types/class";
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { Role, Student, SuperAdmin, Teacher, User } from "@/types/user";

// Create mock grades
export const grades: Grade[] = [
  { id: "grade-1", name: "First" },
  { id: "grade-2", name: "Second" },
  { id: "grade-3", name: "Third" },
  { id: "grade-4", name: "Fourth" },
  { id: "grade-5", name: "Fifth" },
];

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

// Create mock teachers
export const teachers: Teacher[] = [
  {
    id: "teacher-1",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.thompson@school.edu",
    role: "teacher",
    classes: ["class-1-1"],
    avatar: undefined,
  },
  {
    id: "teacher-2",
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "michael.rodriguez@school.edu",
    role: "teacher",
    classes: ["class-1-2"],
    avatar: undefined,
  },
  {
    id: "teacher-3",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@school.edu",
    role: "teacher",
    classes: ["class-2-1"],
    avatar: undefined,
  },
  {
    id: "teacher-4",
    firstName: "James",
    lastName: "Johnson",
    email: "james.johnson@school.edu",
    role: "teacher",
    classes: ["class-2-2"],
    avatar: undefined,
  },
  {
    id: "teacher-5",
    firstName: "Linda",
    lastName: "Martinez",
    email: "linda.martinez@school.edu",
    role: "teacher",
    classes: ["class-3-1"],
    avatar: undefined,
  },
];

// Create superadmin
export const superAdmin: SuperAdmin = {
  id: "admin-1",
  firstName: "David",
  lastName: "Anderson",
  email: "david.anderson@school.edu",
  role: "superadmin",
  avatar: undefined,
};

// Generate mock students
export const students = createMockStudents();

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

// Generate mock attendance records
export const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceStatus[] = ["present", "absent", "late", "excused"];
  
  // Generate records for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    
    // Skip weekends
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    students.forEach((student) => {
      // 70% chance of being present
      const randomStatus = Math.random() < 0.7 ? "present" : statuses[Math.floor(Math.random() * statuses.length)];
      
      records.push({
        id: `attendance-${date}-${student.id}`,
        date,
        classId: student.classId,
        studentId: student.id,
        status: randomStatus,
        markedById: teachers.find(t => t.classes.includes(student.classId))?.id || superAdmin.id,
        markedAt: date + "T08:00:00Z",
      });
    });
  }
  
  return records;
};

export const attendanceRecords = generateAttendanceRecords();

// Weekly holidays
export const weeklyHolidays: WeeklyHoliday[] = ["saturday", "sunday"];

// Custom holidays
export const holidays: Holiday[] = [
  {
    id: "holiday-1",
    name: "Independence Day",
    date: format(addDays(new Date(), 15), "yyyy-MM-dd"),
    description: "National holiday celebrating independence",
  },
  {
    id: "holiday-2",
    name: "Teachers' Day",
    date: format(addDays(new Date(), 25), "yyyy-MM-dd"),
    description: "Day to honor teachers and their contributions",
  },
  {
    id: "holiday-3",
    name: "Spring Break",
    date: format(addDays(new Date(), 35), "yyyy-MM-dd"),
    description: "One week holiday for spring",
  },
  {
    id: "holiday-4",
    name: "Foundation Day",
    date: format(subDays(new Date(), 15), "yyyy-MM-dd"),
    description: "School foundation day celebration",
  },
];

// All users
export const allUsers: User[] = [
  superAdmin,
  ...teachers,
  ...students,
];
