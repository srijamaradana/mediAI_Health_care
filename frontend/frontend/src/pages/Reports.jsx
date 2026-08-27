import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { reportApi } from "../services/endpoints";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("lab_report");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await reportApi.list();
    setReports(data.data.reports);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please select a file and enter a title");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);

    setUploading(true);
    try {
      await reportApi.upload(formData);
      toast.success("Report uploaded");
      setFile(null);
      setTitle("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    await reportApi.remove(id);
    toast.success("Report deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Medical Reports</h2>

      <form onSubmit={handleUpload} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blood Test - Jan 2026" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="lab_report">Lab Report</option>
            <option value="scan">Scan</option>
            <option value="prescription">Prescription</option>
            <option value="discharge_summary">Discharge Summary</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">File</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        </div>
        <button type="submit" disabled={uploading} className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div key={r._id} className="flex items-start justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{r.title}</p>
                <p className="text-xs capitalize text-gray-400">{r.type.replace("_", " ")}</p>
                <p className="text-[11px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600">
                <Download className="h-4 w-4" />
              </a>
              <button onClick={() => remove(r._id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {reports.length === 0 && <p className="text-sm text-gray-400">No reports uploaded yet.</p>}
      </div>
    </div>
  );
};

export default Reports;
