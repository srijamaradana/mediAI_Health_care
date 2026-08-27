import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Pill,
  HeartPulse,
  FileText,
  Users,
  Stethoscope,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linksByRole = {
  patient: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctors", label: "Find Doctors", icon: Stethoscope },
    { to: "/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/medications", label: "Medications", icon: Pill },
    { to: "/health-records", label: "Health Records", icon: HeartPulse },
    { to: "/reports", label: "Reports", icon: FileText },
  ],
  doctor: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/reports", label: "Patient Reports", icon: FileText },
  ],
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/users", label: "Manage Users", icon: Users },
    { to: "/appointments", label: "Appointments", icon: CalendarDays },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
        <Activity className="h-7 w-7 text-primary-600" />
        <span className="text-xl font-bold text-gray-900">MediAI</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
        MediTrack Pro v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
