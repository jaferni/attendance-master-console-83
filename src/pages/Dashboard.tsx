
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { AttendanceStatus } from "@/types/attendance";
import { format, isToday, parseISO, startOfMonth } from "date-fns";
import { Calendar, CheckSquare, UserCheck, Users, X } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AttendanceCalendar } from "@/components/ui/attendance-calendar";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { 
    classes, 
    teachers, 
    students, 
    attendanceRecords, 
    getClassesForTeacher,
    getAttendanceForStudent
  } = useContext(AppContext);
  
  if (!user) return null;
  
  const isAdmin = user.role === "superadmin";
  const isTeacher = user.role === "teacher";
  const isStudent = user.role === "student";
  
  // Get today's date
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Calculate statistics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  
  // Attendance stats
  const todayAttendance = attendanceRecords.filter(
    (record) => record.date === today
  );
  
  const presentToday = todayAttendance.filter(
    (record) => record.status === "present"
  ).length;
  
  const absentToday = todayAttendance.filter(
    (record) => record.status === "absent"
  ).length;
  
  // Calculate attendance percentage
  const attendancePercentage = todayAttendance.length
    ? Math.round((presentToday / todayAttendance.length) * 100)
    : 0;
  
  // Get teacher classes
  const teacherClasses = isTeacher
    ? getClassesForTeacher(user.id)
    : [];
  
  // Get student attendance
  const studentAttendance = isStudent
    ? getAttendanceForStudent(user.id)
    : [];
  
  // Sort by date descending
  const recentStudentAttendance = [...studentAttendance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  return (
    <DashboardLayout>
      <DashboardShell 
        title={`Welcome, ${user.firstName}`}
        description={`Here's what's happening in your ${isAdmin ? 'school' : isTeacher ? 'classes' : 'attendance'} today.`}
      >
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin && (
            <>
              <DashboardCard
                title="Total Students"
                value={totalStudents}
                icon={<Users className="h-4 w-4" />}
              />
              <DashboardCard
                title="Total Teachers"
                value={totalTeachers}
                icon={<UserCheck className="h-4 w-4" />}
              />
              <DashboardCard
                title="Total Classes"
                value={totalClasses}
                icon={<Calendar className="h-4 w-4" />}
              />
              <DashboardCard
                title="Attendance Today"
                value={`${attendancePercentage}%`}
                icon={<CheckSquare className="h-4 w-4" />}
                trend={{
                  value: 5,
                  isPositive: true,
                }}
              />
            </>
          )}
          
          {isTeacher && (
            <>
              <DashboardCard
                title="My Classes"
                value={teacherClasses.length}
                icon={<Calendar className="h-4 w-4" />}
              />
              <DashboardCard
                title="Total Students"
                value={teacherClasses.reduce(
                  (acc, cls) => acc + cls.students.length,
                  0
                )}
                icon={<Users className="h-4 w-4" />}
              />
              <DashboardCard
                title="Present Today"
                value={presentToday}
                icon={<CheckSquare className="h-4 w-4" />}
              />
              <DashboardCard
                title="Absent Today"
                value={absentToday}
                icon={<X className="h-4 w-4" />}
              />
            </>
          )}
          
          {isStudent && (
            <>
              <DashboardCard
                title="Attendance Rate"
                value={`${Math.round(
                  (studentAttendance.filter(
                    (record) => record.status === "present"
                  ).length /
                    (studentAttendance.length || 1)) *
                    100
                )}%`}
                icon={<CheckSquare className="h-4 w-4" />}
              />
              <DashboardCard
                title="Present Days"
                value={
                  studentAttendance.filter(
                    (record) => record.status === "present"
                  ).length
                }
                icon={<UserCheck className="h-4 w-4" />}
              />
              <DashboardCard
                title="Absent Days"
                value={
                  studentAttendance.filter(
                    (record) => record.status === "absent"
                  ).length
                }
                icon={<X className="h-4 w-4" />}
              />
              <DashboardCard
                title="Total School Days"
                value={studentAttendance.length}
                icon={<Calendar className="h-4 w-4" />}
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {isAdmin && (
              <div className="rounded-xl border glass glass-hover p-6">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <span className="bg-primary/10 text-primary p-2 rounded-full">
                      <UserCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        Teachers marked attendance
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {presentToday} students present, {absentToday} students absent
                      </p>
                    </div>
                    <p className="ml-auto text-xs text-muted-foreground">
                      Today
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <span className="bg-primary/10 text-primary p-2 rounded-full">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">New holiday added</p>
                      <p className="text-xs text-muted-foreground">
                        Teachers' Day holiday has been added
                      </p>
                    </div>
                    <p className="ml-auto text-xs text-muted-foreground">
                      Yesterday
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <span className="bg-primary/10 text-primary p-2 rounded-full">
                      <Users className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">New student enrolled</p>
                      <p className="text-xs text-muted-foreground">
                        A new student has been added to Class 3-A
                      </p>
                    </div>
                    <p className="ml-auto text-xs text-muted-foreground">
                      2 days ago
                    </p>
                  </div>
                </div>
                <Button variant="link" className="mt-4 px-0">
                  View all activity
                </Button>
              </div>
            )}

            {isTeacher && (
              <div className="rounded-xl border glass glass-hover p-6">
                <h2 className="text-lg font-medium mb-4">My Classes</h2>
                <div className="space-y-3">
                  {teacherClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      to={`/dashboard/classes/${cls.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary p-2 rounded-full">
                          <Users className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cls.students.length} students
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Take Attendance
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isStudent && (
              <div className="rounded-xl border glass glass-hover p-6">
                <h2 className="text-lg font-medium mb-4">Recent Attendance</h2>
                <div className="space-y-3">
                  {recentStudentAttendance.map((record) => (
                    <div
                      key={record.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        isToday(parseISO(record.date))
                          ? "bg-primary/10"
                          : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "p-2 rounded-full",
                            record.status === "present"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : record.status === "absent"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : record.status === "late"
                              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          )}
                        >
                          {record.status === "present" && (
                            <CheckSquare className="h-4 w-4" />
                          )}
                          {record.status === "absent" && (
                            <X className="h-4 w-4" />
                          )}
                          {record.status === "late" && (
                            <Calendar className="h-4 w-4" />
                          )}
                          {record.status === "excused" && (
                            <Calendar className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="font-medium">
                            {format(parseISO(record.date), "MMMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isToday(parseISO(record.date))
                              ? "Today"
                              : format(parseISO(record.date), "EEEE")}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {isAdmin && (
              <div className="rounded-xl border glass glass-hover p-6">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/dashboard/attendance">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2"
                    >
                      <CheckSquare className="h-6 w-6" />
                      <span>Take Attendance</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard/holidays">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2"
                    >
                      <Calendar className="h-6 w-6" />
                      <span>Manage Holidays</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard/teachers">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2"
                    >
                      <UserCheck className="h-6 w-6" />
                      <span>Manage Teachers</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard/grades">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2"
                    >
                      <Users className="h-6 w-6" />
                      <span>Manage Classes</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {isTeacher && (
              <div className="rounded-xl border glass glass-hover p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Today's Attendance</h2>
                  <Button size="sm" variant="outline">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {teacherClasses.length > 0 ? (
                    teacherClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-3 rounded-lg bg-muted/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{cls.name}</h3>
                          <StatusBadge
                            status="present"
                            className="px-2 py-0 text-xs"
                          />
                        </div>
                        <div className="flex -space-x-2">
                          {cls.students.slice(0, 5).map((student) => (
                            <UserAvatar
                              key={student.id}
                              user={student}
                              size="sm"
                              className="border-2 border-background"
                            />
                          ))}
                          {cls.students.length > 5 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
                              +{cls.students.length - 5}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {
                              attendanceRecords.filter(
                                (record) =>
                                  record.classId === cls.id &&
                                  record.date === today &&
                                  record.status === "present"
                              ).length
                            }{" "}
                            present
                          </span>
                          <span>
                            {
                              attendanceRecords.filter(
                                (record) =>
                                  record.classId === cls.id &&
                                  record.date === today &&
                                  record.status === "absent"
                              ).length
                            }{" "}
                            absent
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No classes assigned yet
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {isStudent && (
              <div className="rounded-xl border glass glass-hover p-6">
                <h2 className="text-lg font-medium mb-4">Attendance Overview</h2>
                <AttendanceCalendar
                  attendanceRecords={studentAttendance}
                  className="mx-auto max-w-[350px]"
                />
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </DashboardLayout>
  );
}
