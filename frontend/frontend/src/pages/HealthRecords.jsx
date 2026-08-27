import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus } from "lucide-react";
import { healthRecordApi } from "../services/endpoints";

const recordTypes = ["blood_pressure", "blood_sugar", "weight", "heart_rate", "temperature", "oxygen_level", "other"];

const HealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "weight", value: "", unit: "", notes: "" });
  const [activeType, setActiveType] = useState("weight");

  const load = async () => {
    const { data } = await healthRecordApi.list();
    setRecords(data.data.records);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await healthRecordApi.create(form);
      toast.success("Record added");
      setForm({ type: "weight", value: "", unit: "", notes: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add record");
    }
  };

  const chartData = records
    .filter((r) => r.type === activeType)
    .slice()
    .reverse()
    .map((r) => ({ date: new Date(r.recordedAt).toLocaleDateString(), value: parseFloat(r.value) || 0 }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Health Records</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add Record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize">
            {recordTypes.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
          <input required placeholder="Value (e.g. 120/80 or 70)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input placeholder="Unit (e.g. mmHg, kg)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="sm:col-span-2 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white">
            Save Record
          </button>
        </form>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {recordTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                activeType === t ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-3 capitalize text-gray-700">{r.type.replace("_", " ")}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{r.value} {r.unit}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(r.recordedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{r.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HealthRecords;
