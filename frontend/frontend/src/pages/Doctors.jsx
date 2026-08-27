import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Stethoscope } from "lucide-react";
import { doctorApi, appointmentApi } from "../services/endpoints";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [booking, setBooking] = useState(null); // doctor being booked
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");

  const loadDoctors = async () => {
    const { data } = await doctorApi.list({ search });
    setDoctors(data.data.doctors);
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSlots = async (doctorId, selectedDate) => {
    if (!selectedDate) return;
    const { data } = await doctorApi.availability(doctorId, selectedDate);
    setSlots(data.data.slots);
  };

  const handleBook = async () => {
    if (!date || !selectedSlot || !reason) {
      toast.error("Please fill in date, time slot, and reason");
      return;
    }
    try {
      await appointmentApi.create({
        doctorId: booking._id,
        date,
        timeSlot: `${selectedSlot}-${selectedSlot}`,
        reason,
      });
      toast.success("Appointment requested!");
      setBooking(null);
      setDate("");
      setSelectedSlot("");
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadDoctors()}
            placeholder="Search by name or specialization..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button onClick={loadDoctors} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc) => (
          <div key={doc._id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Stethoscope className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{doc.user?.name}</p>
                <p className="text-xs text-gray-500">{doc.specialization}</p>
              </div>
            </div>
            <p className="mb-1 text-xs text-gray-500">{doc.experienceYears} yrs experience</p>
            <p className="mb-3 text-sm font-medium text-gray-700">${doc.consultationFee} consultation fee</p>
            <button
              onClick={() => {
                setBooking(doc);
                setSlots([]);
              }}
              className="w-full rounded-lg bg-primary-50 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Book with {booking.user?.name}</h3>

            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setDate(e.target.value);
                loadSlots(booking._id, e.target.value);
              }}
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />

            <label className="mb-1 block text-sm font-medium text-gray-700">Time Slot</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {slots.length === 0 ? (
                <p className="text-xs text-gray-400">Select a date to see available slots</p>
              ) : (
                slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-md border px-3 py-1.5 text-xs ${
                      selectedSlot === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-300 text-gray-600"
                    }`}
                  >
                    {s}
                  </button>
                ))
              )}
            </div>

            <label className="mb-1 block text-sm font-medium text-gray-700">Reason for visit</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
            />

            <div className="flex gap-2">
              <button onClick={() => setBooking(null)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm">
                Cancel
              </button>
              <button onClick={handleBook} className="flex-1 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
