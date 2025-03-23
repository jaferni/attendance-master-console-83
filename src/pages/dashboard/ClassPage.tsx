
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/AuthContext";
import { AppContext } from "@/context/AppContext";
import { Calendar as CalendarIcon, LoaderCircle } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { UserAvatar } from "@/components/UserAvatar";

export default function ClassPage() {
  const { user } = useContext(AuthContext);
  const { getClassById, getStudentsInClass, getAttendanceForClass, saveAttendance } = useContext(AppContext);
  const { classId } = useParams<{ classId: string }>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format date for API calls
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Get class and students
  const currentClass = classId ? getClassById(classId) : undefined;
  const students = classId ? getStudentsInClass(classId) : [];
  
  // Get existing attendance records
  const existingAttendance = classId 
    ? getAttendanceForClass(classId, formattedDate) 
    : {};
  
  // Permission check for non-superadmin
  const hasPermission = user?.role === "superadmin" || 
    (user?.role === "teacher" && currentClass?.teacherId === user.id);
  
  if (!classId || !currentClass) {
    return (
      <DashboardLayout>
        <DashboardShell
          title="Class Not Found"
          description="The class you're looking for doesn't exist."
          backHref="/dashboard/classes"
        >
          <div className="flex justify-center py-8">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </DashboardShell>
      </DashboardLayout>
    );
  }
  
  if (!hasPermission) {
    return <Navigate to="/dashboard" />;
  }
  
  // Handle saving attendance
  const handleSaveAttendance = async (records: Record<string, string>) => {
    if (!user || !classId) return;
    
    await saveAttendance(
      classId,
      formattedDate,
      records,
      user.id
    );
  };
  
  return (
    <DashboardLayout>
      <DashboardShell
        title={currentClass.name}
        description={`${currentClass.grade.name} - ${students.length} students`}
        backHref="/dashboard/classes"
      >
        <Tabs defaultValue="students">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <UserAvatar user={student} />
                          <div>
                            <h4 className="font-medium">
                              {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No students assigned to this class
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full md:w-auto justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <AttendanceTable 
                  students={students}
                  date={selectedDate}
                  classId={classId}
                  existingRecords={existingAttendance}
                  onSave={handleSaveAttendance}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Class Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Class details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Class Name</h3>
                      <p className="p-2 border rounded-md">{currentClass.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Grade</h3>
                      <p className="p-2 border rounded-md">{currentClass.grade.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Teacher</h3>
                      <p className="p-2 border rounded-md">
                        {currentClass.teacherId ? (
                          "Assigned Teacher" // You can replace this with actual teacher name
                        ) : (
                          "No teacher assigned"
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Students</h3>
                      <p className="p-2 border rounded-md">{students.length} students</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline">Edit Class</Button>
                    {user?.role === "superadmin" && (
                      <Button variant="destructive">Delete Class</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </DashboardLayout>
  );
}
