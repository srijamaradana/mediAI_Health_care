import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { appointmentApi } from "../services/endpoints";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-purple-100 text-purple-700",
};

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("");

  const load = async () => {
    const { data } = await appointmentApi.list(filter ? { status: filter } : {});
    setAppointments(data.data.appointments);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
              filter === s ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">{user.role === "patient" ? "Doctor" : "Patient"}</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.map((a) => (
              <tr key={a._id}>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {user.role === "patient" ? a.doctor?.user?.name : a.patient?.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{new Date(a.date).toDateString()}</td>
                <td className="px-4 py-3 text-gray-600">{a.timeSlot}</td>
                <td className="px-4 py-3 text-gray-600">{a.reason}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {user.role === "doctor" && a.status === "pending" && (
                      <button onClick={() => updateStatus(a._id, "confirmed")} className="text-xs font-medium text-primary-600">
                        Confirm
                      </button>
                    )}
                    {user.role === "doctor" && a.status === "confirmed" && (
                      <button onClick={() => updateStatus(a._id, "completed")} className="text-xs font-medium text-green-600">
                        Complete
                      </button>
                    )}
                    {["pending", "confirmed"].includes(a.status) && (
                      <button onClick={() => updateStatus(a._id, "cancelled")} className="text-xs font-medium text-red-600">
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
