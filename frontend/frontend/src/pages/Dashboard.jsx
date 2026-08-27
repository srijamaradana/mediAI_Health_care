import { useEffect, useState } from "react";
import { CalendarDays, Pill, HeartPulse, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { appointmentApi, medicationApi } from "../services/endpoints";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, medications: 0, upcoming: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, medRes] = await Promise.all([
          appointmentApi.list({ limit: 5 }),
          user.role === "patient" ? medicationApi.list({ active: "true" }) : Promise.resolve({ data: { data: { medications: [] } } }),
        ]);
        setStats({
          appointments: apptRes.data.data.total,
          medications: medRes.data.data.medications.length,
          upcoming: apptRes.data.data.appointments,
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Total Appointments" value={stats.appointments} color="bg-primary-500" />
        {user.role === "patient" && (
          <StatCard icon={Pill} label="Active Medications" value={stats.medications} color="bg-teal-500" />
        )}
        {user.role === "patient" && <StatCard icon={HeartPulse} label="Health Records" value="—" color="bg-rose-500" />}
        {user.role === "admin" && <StatCard icon={Users} label="Platform Users" value="—" color="bg-purple-500" />}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Recent Appointments</h2>
        {stats.upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No appointments yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.upcoming.map((a) => (
              <div key={a._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">
                    {user.role === "patient" ? a.doctor?.user?.name : a.patient?.name}
                  </p>
                  <p className="text-gray-400">
                    {new Date(a.date).toDateString()} · {a.timeSlot}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
