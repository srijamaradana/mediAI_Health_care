import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Check, X as XIcon, Trash2 } from "lucide-react";
import { medicationApi } from "../services/endpoints";

const emptyForm = { name: "", dosage: "", frequency: "", startDate: "", instructions: "" };

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await medicationApi.list();
    setMedications(data.data.medications);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicationApi.create(form);
      toast.success("Medication added");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add medication");
    }
  };

  const logDose = async (id, status) => {
    await medicationApi.logDose(id, status);
    toast.success(`Marked as ${status}`);
    load();
  };

  const remove = async (id) => {
    await medicationApi.remove(id);
    toast.success("Medication removed");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Your Medications</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add Medication
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <input required placeholder="Medication name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Dosage (e.g. 500mg)" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Frequency (e.g. Twice a day)" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input placeholder="Instructions (optional)" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="sm:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="sm:col-span-2 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white">
            Save Medication
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {medications.map((med) => (
          <div key={med._id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{med.name}</p>
                <p className="text-xs text-gray-500">{med.dosage} · {med.frequency}</p>
              </div>
              <button onClick={() => remove(med._id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {med.instructions && <p className="mb-3 text-xs text-gray-500">{med.instructions}</p>}
            <div className="flex gap-2">
              <button onClick={() => logDose(med._id, "taken")} className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700">
                <Check className="h-3 w-3" /> Taken
              </button>
              <button onClick={() => logDose(med._id, "missed")} className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700">
                <XIcon className="h-3 w-3" /> Missed
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">{med.logs?.length || 0} doses logged</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medications;
