import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Medications from "./pages/Medications";
import HealthRecords from "./pages/HealthRecords";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Doctors />
            </ProtectedRoute>
          }
        />
        <Route path="/appointments" element={<Appointments />} />
        <Route
          path="/medications"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Medications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-records"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <HealthRecords />
            </ProtectedRoute>
          }
        />
        <Route path="/reports" element={<Reports />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
