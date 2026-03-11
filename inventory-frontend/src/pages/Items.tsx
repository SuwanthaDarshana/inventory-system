
import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Item, Place } from "../types";

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [serialNumber, setSerialNumber] = useState("");
  const [description, setDescription] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const fetchItems = () => {
    api.get("/items").then((res) => setItems(res.data));
  };

  useEffect(() => {
    fetchItems();
    api.get("/places").then((res) => setPlaces(res.data));
  }, []);

  const resetForm = () => {
    setName("");
    setCode("");
    setQuantity(1);
    setSerialNumber("");
    setDescription("");
    setPlaceId("");
    setImage(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code);
    setQuantity(item.quantity);
    setSerialNumber(item.serial_number || "");
    setDescription(item.description || "");
    setPlaceId(String(item.place_id));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("code", code);
      formData.append("quantity", String(quantity));
      formData.append("serial_number", serialNumber);
      formData.append("description", description);
      formData.append("place_id", placeId);
      if (image) formData.append("image", image);

      if (editingItem) {
        formData.append("_method", "PUT"); // Laravel uses _method for PUT with FormData
        await api.post(`/items/${editingItem.id}`, formData);
        toast.success("Item updated");
      } else {
        await api.post("/items", formData);
        toast.success("Item created");
      }
      fetchItems();
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          + Add Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingItem ? "Edit Item" : "Add Item"}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border rounded p-2" />
              <input type="text" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required
                className="w-full border rounded p-2" />
              <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={0} required
                className="w-full border rounded p-2" />
              <input type="text" placeholder="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full border rounded p-2" />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded p-2" />
              <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} required className="w-full border rounded p-2">
                <option value="">Select Place</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.cupboard?.name})</option>
                ))}
              </select>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full border rounded p-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                {editingItem ? "Update" : "Create"}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Status</th>
              <th className="p-3">Place</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">{item.code}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-3 text-sm text-gray-500">{item.place?.name}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    IN_STORE: "bg-green-100 text-green-800",
    BORROWED: "bg-yellow-100 text-yellow-800",
    DAMAGED: "bg-red-100 text-red-800",
    MISSING: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}
