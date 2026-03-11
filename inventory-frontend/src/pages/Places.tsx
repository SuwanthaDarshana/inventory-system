import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Place, Cupboard } from "../types";

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [cupboards, setCupboards] = useState<Cupboard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [name, setName] = useState("");
  const [cupboardId, setCupboardId] = useState("");

  const fetchPlaces = () => {
    api.get("/places").then((res) => setPlaces(res.data));
  };

  useEffect(() => {
    fetchPlaces();
    api.get("/cupboards").then((res) => setCupboards(res.data));
  }, []);

  const resetForm = () => { setName(""); setCupboardId(""); setEditing(null); setShowForm(false); };

  const openEdit = (p: Place) => {
    setEditing(p); setName(p.name); setCupboardId(String(p.cupboard_id)); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { name, cupboard_id: Number(cupboardId) };
      if (editing) {
        await api.put(`/places/${editing.id}`, data);
        toast.success("Place updated");
      } else {
        await api.post("/places", data);
        toast.success("Place created");
      }
      fetchPlaces(); resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save place");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this place?")) return;
    try {
      await api.delete(`/places/${id}`);
      toast.success("Place deleted"); fetchPlaces();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Places</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">+ Add Place</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit" : "Add"} Place</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded p-2" />
              <select value={cupboardId} onChange={(e) => setCupboardId(e.target.value)} required className="w-full border rounded p-2">
                <option value="">Select Cupboard</option>
                {cupboards.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.location}</option>
                ))}
              </select>
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
              <th className="p-3">Cupboard</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {places.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-sm text-gray-500">{p.cupboard?.name}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {places.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No places found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
