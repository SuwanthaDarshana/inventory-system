import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../api/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import type { Item, Place } from "../types";

const inputClass = "w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";


export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [serialNumber, setSerialNumber] = useState("");
  const [description, setDescription] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // For delete confirmation popup
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchItems = () => {
    api.get("/items").then((res) => setItems(res.data));
  };

  useEffect(() => {
    fetchItems();
    api.get("/places").then((res) => setPlaces(res.data));
  }, []);

  const resetForm = () => {
    setName(""); setCode(""); setQuantity(1); setSerialNumber(""); setDescription(""); setPlaceId(""); setImage(null); setEditingItem(null); setShowForm(false);
  };

  const openEdit = (item: Item) => {
    setEditingItem(item); setName(item.name); setCode(item.code); setQuantity(item.quantity);
    setSerialNumber(item.serial_number || ""); setDescription(item.description || ""); setPlaceId(String(item.place_id)); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name); formData.append("code", code); formData.append("quantity", String(quantity));
      formData.append("serial_number", serialNumber); formData.append("description", description); formData.append("place_id", placeId);
      if (image) formData.append("image", image);

      if (editingItem) {
        formData.append("_method", "PUT");
        await api.post(`/items/${editingItem.id}`, formData);
        toast.success("Item updated");
      } else {
        formData.append("status", "IN_STORE");
        await api.post("/items", formData);
        toast.success("Item created");
      }
      fetchItems(); resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save item");
    }
  };


  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await api.delete(`/items/${deleteId}`);
      toast.success("Item deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} total items</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text" placeholder="Search items by name or code..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal open={showForm} onClose={resetForm} title={editingItem ? "Edit Item" : "Add New Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Item name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className={inputClass} placeholder="ITM-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={0} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Serial Number</label>
            <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Place</label>
            <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} required className={inputClass}>
              <option value="">Select a place</option>
              {places.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.cupboard?.name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer">
              {editingItem ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-3.5">Image</th>
              <th className="px-6 py-3.5">Code</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Qty</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Place</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  {item.image ? (
                    <img
                      src={`${BACKEND_URL}/storage/${item.image}`}
                      alt={item.name}
                      className="w-14 h-14 shrink-0 object-contain p-1 rounded-lg border border-gray-200 bg-gray-50"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-lg bg-gray-100 text-gray-300 border border-gray-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7M3 7a4 4 0 014-4h10a4 4 0 014 4M3 7h18" /></svg>
                    </div>
                  )}
                </td>
                <td className="px-6 py-3.5 font-mono text-sm text-indigo-600">{item.code}</td>
                <td className="px-6 py-3.5 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">{item.quantity}</span>
                </td>
                <td className="px-6 py-3.5"><StatusBadge status={item.status} /></td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{item.place?.name}</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Item?">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete this item? This action cannot be undone.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer">Delete</button>
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl transition-all cursor-pointer">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-2">
              {item.image ? (
                <img
                  src={`${BACKEND_URL}/storage/${item.image}`}
                  alt={item.name}
                  className="w-16 h-16 shrink-0 object-contain p-1 rounded-lg border border-gray-200 bg-gray-50"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 shrink-0 flex items-center justify-center rounded-lg bg-gray-100 text-gray-300 border border-gray-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7M3 7a4 4 0 014-4h10a4 4 0 014 4M3 7h18" /></svg>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm font-mono text-indigo-600">{item.code}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <span>Qty: <span className="font-medium text-gray-700">{item.quantity}</span></span>
                  <span>{item.place?.name}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 justify-between">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No items found</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IN_STORE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    BORROWED: "bg-amber-50 text-amber-700 ring-amber-600/20",
    DAMAGED: "bg-red-50 text-red-700 ring-red-600/20",
    MISSING: "bg-gray-50 text-gray-600 ring-gray-500/20",
  };
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ring-1 ring-inset ${styles[status] || "bg-gray-50 ring-gray-500/20"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
