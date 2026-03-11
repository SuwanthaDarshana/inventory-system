
import { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { BorrowRecord, Item } from "../types";

export default function Borrow() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showBorrowForm, setShowBorrowForm] = useState(false);

  // Borrow form state
  const [itemId, setItemId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  const fetchRecords = () => {
    api.get("/borrow-records").then((res) => setRecords(res.data));
  };

  useEffect(() => {
    fetchRecords();
    api.get("/items").then((res) => setItems(res.data));
  }, []);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/borrow", {
        item_id: Number(itemId),
        borrower_name: borrowerName,
        contact,
        quantity,
        expected_return_date: expectedReturnDate,
      });
      toast.success("Item borrowed successfully");
      setShowBorrowForm(false);
      setBorrowerName("");
      setContact("");
      setQuantity(1);
      setItemId("");
      setExpectedReturnDate("");
      fetchRecords();
      api.get("/items").then((res) => setItems(res.data));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to borrow");
    }
  };

  const handleReturn = async (recordId: number) => {
    try {
      await api.post("/return", { borrow_record_id: recordId });
      toast.success("Item returned");
      fetchRecords();
      api.get("/items").then((res) => setItems(res.data));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to return");
    }
  };

  const activeRecords = records.filter((r) => r.status === "BORROWED");
  const returnedRecords = records.filter((r) => r.status === "RETURNED");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Borrow & Return</h1>
        <button onClick={() => setShowBorrowForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          + Borrow Item
        </button>
      </div>

      {/* Borrow Form Modal */}
      {showBorrowForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleBorrow} className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Borrow Item</h2>
            <div className="space-y-3">
              <select value={itemId} onChange={(e) => setItemId(e.target.value)} required className="w-full border rounded p-2">
                <option value="">Select Item</option>
                {items.filter((i) => i.quantity > 0).map((i) => (
                  <option key={i.id} value={i.id}>{i.name} (Qty: {i.quantity})</option>
                ))}
              </select>
              <input type="text" placeholder="Borrower Name" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} required
                className="w-full border rounded p-2" />
              <input type="text" placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} required
                className="w-full border rounded p-2" />
              <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} required
                className="w-full border rounded p-2" />
              <input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} required
                className="w-full border rounded p-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Borrow</button>
              <button type="button" onClick={() => setShowBorrowForm(false)} className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Active Borrows */}
      <h2 className="text-lg font-semibold mb-3">Active Borrows</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto mb-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Borrower</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Borrow Date</th>
              <th className="p-3">Expected Return</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeRecords.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.item?.name}</td>
                <td className="p-3">{r.borrower_name}</td>
                <td className="p-3">{r.contact}</td>
                <td className="p-3">{r.quantity}</td>
                <td className="p-3 text-sm">{r.borrow_date}</td>
                <td className="p-3 text-sm">{r.expected_return_date}</td>
                <td className="p-3">
                  <button onClick={() => handleReturn(r.id)} className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded">
                    Return
                  </button>
                </td>
              </tr>
            ))}
            {activeRecords.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No active borrows</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Returned Records */}
      <h2 className="text-lg font-semibold mb-3">Return History</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Borrower</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Borrow Date</th>
              <th className="p-3">Returned</th>
            </tr>
          </thead>
          <tbody>
            {returnedRecords.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.item?.name}</td>
                <td className="p-3">{r.borrower_name}</td>
                <td className="p-3">{r.quantity}</td>
                <td className="p-3 text-sm">{r.borrow_date}</td>
                <td className="p-3 text-sm">{r.return_date}</td>
              </tr>
            ))}
            {returnedRecords.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No return history</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
