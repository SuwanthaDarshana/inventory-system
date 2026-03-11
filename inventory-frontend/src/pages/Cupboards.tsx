import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Cupboard } from "../types";

export default function Cupboards() {
  const [cupboards, setCupboards] = useState<Cupboard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cupboard | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const fetchCupboards = () => {
    api.get("/cupboards").then((res) => setCupboards(res.data));
  };

  useEffect(() => { fetchCupboards(); }, []);

  const resetForm = () => { setName(""); setLocation(""); setEditing(null); setShowForm(false); };

  const openEdit = (c: Cupboard) => {
    setEditing(c); setName(c.name); setLocation(c.location); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/cupboards/${editing.id}`, { name, location });
        toast.success("Cupboard updated");
      } else {
        await api.post("/cupboards", { name, location });
        toast.success("Cupboard created");
      }
      fetchCupboards(); resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save cupboard");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this cupboard? All its places and items will be removed.")) return;
    try {
      await api.delete(`/cupboards/${id}`);
      toast.success("Cupboard deleted"); fetchCupboards();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cupboards</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">+ Add Cupboard</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit" : "Add"} Cupboard</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded p-2" />
              <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full border rounded p-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">{editing ? "Update" : "Create"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Location</th>
              <th className="p-3">Places</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cupboards.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.location}</td>
                <td className="p-3 text-sm text-gray-500">{c.places?.length || 0}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {cupboards.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No cupboards found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
