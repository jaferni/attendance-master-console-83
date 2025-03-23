import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AttendancePage from "./pages/dashboard/AttendancePage";
import HolidaysPage from "./pages/dashboard/HolidaysPage";
import ClassPage from "./pages/dashboard/ClassPage";
import ClassesPage from "./pages/dashboard/ClassesPage";
import GradesClassesPage from "./pages/dashboard/GradesClassesPage";
import StudentsPage from "./pages/dashboard/StudentsPage";
import TeachersPage from "./pages/dashboard/TeachersPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import TeacherDetailsPage from "./pages/dashboard/TeacherDetailsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/dashboard/attendance" element={<RequireAuth><AttendancePage /></RequireAuth>} />
                <Route path="/dashboard/classes" element={<RequireAuth><ClassesPage /></RequireAuth>} />
                <Route path="/dashboard/classes/:classId" element={<RequireAuth><ClassPage /></RequireAuth>} />
                <Route path="/dashboard/grades" element={<RequireAuth role="superadmin"><GradesClassesPage /></RequireAuth>} />
                <Route path="/dashboard/students" element={<RequireAuth><StudentsPage /></RequireAuth>} />
                <Route path="/dashboard/teachers" element={<RequireAuth role="superadmin"><TeachersPage /></RequireAuth>} />
                <Route path="/dashboard/teachers/:teacherId" element={<RequireAuth role="superadmin"><TeacherDetailsPage /></RequireAuth>} />
                <Route path="/dashboard/holidays" element={<RequireAuth role="superadmin"><HolidaysPage /></RequireAuth>} />
                <Route path="/dashboard/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
