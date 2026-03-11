
import { useEffect, useState } from "react";

// Helper to format date strings
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
import api from "../api/api";
import toast from "react-hot-toast";
import type { BorrowRecord, Item } from "../types";
import Modal from "../components/Modal";

const inputClass =
  "w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

export default function Borrow() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");

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

  const resetForm = () => {
    setBorrowerName(""); setContact(""); setQuantity(1); setItemId(""); setExpectedReturnDate(""); setShowBorrowForm(false);
  };

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
      resetForm();
      fetchRecords();
      api.get("/items").then((res) => setItems(res.data));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to borrow");
    }
  };

  const handleReturn = async (recordId: number) => {
    try {
      await api.post("/return", { borrow_id: recordId });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrow & Return</h1>
          <p className="text-sm text-gray-500 mt-1">{activeRecords.length} active · {returnedRecords.length} returned</p>
        </div>
        <button
          onClick={() => setShowBorrowForm(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Borrow Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === "active" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Active ({activeRecords.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === "history" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          History ({returnedRecords.length})
        </button>
      </div>

      {/* Borrow Modal */}
      <Modal open={showBorrowForm} onClose={resetForm} title="Borrow Item">
        <form onSubmit={handleBorrow} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} required className={inputClass}>
              <option value="">Select Item</option>
              {items.filter((i) => i.quantity > 0).map((i) => (
                <option key={i.id} value={i.id}>{i.name} (Available: {i.quantity})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Name</label>
            <input type="text" placeholder="Full name" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input type="text" placeholder="Phone or email" value={contact} onChange={(e) => setContact(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return</label>
              <input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
              Confirm Borrow
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Active Borrows Tab */}
      {tab === "active" && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrow Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Return</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{r.item?.name}</td>
                    <td className="px-5 py-4 text-gray-700">{r.borrower_name}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm">{r.contact}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20">
                        {r.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(r.borrow_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(r.expected_return_date)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleReturn(r.id)}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium py-1.5 px-3.5 rounded-lg ring-1 ring-emerald-600/20 transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
                {activeRecords.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    No active borrows
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {activeRecords.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{r.item?.name}</p>
                    <p className="text-sm text-gray-500">{r.borrower_name}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
                    BORROWED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Contact:</span> <span className="text-gray-700">{r.contact}</span></div>
                  <div><span className="text-gray-400">Qty:</span> <span className="text-gray-700">{r.quantity}</span></div>
                  <div><span className="text-gray-400">Borrowed:</span> <span className="text-gray-700">{formatDate(r.borrow_date)}</span></div>
                  <div><span className="text-gray-400">Return by:</span> <span className="text-gray-700">{formatDate(r.expected_return_date)}</span></div>
                </div>
                <button
                  onClick={() => handleReturn(r.id)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-xl ring-1 ring-emerald-600/20 transition-all cursor-pointer text-sm"
                >
                  Mark as Returned
                </button>
              </div>
            ))}
            {activeRecords.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">No active borrows</div>
            )}
          </div>
        </>
      )}

      {/* Return History Tab */}
      {tab === "history" && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrow Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Returned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {returnedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{r.item?.name}</td>
                    <td className="px-5 py-4 text-gray-700">{r.borrower_name}</td>
                    <td className="px-5 py-4 text-gray-500">{r.quantity}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(r.borrow_date)}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                        {formatDate(r.return_date)}
                      </span>
                    </td>
                  </tr>
                ))}
                {returnedRecords.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No return history</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {returnedRecords.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{r.item?.name}</p>
                    <p className="text-sm text-gray-500">{r.borrower_name}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                    RETURNED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Qty:</span> <span className="text-gray-700">{r.quantity}</span></div>
                  <div><span className="text-gray-400">Borrowed:</span> <span className="text-gray-700">{r.borrow_date}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">Returned:</span> <span className="text-gray-700">{r.return_date}</span></div>
                </div>
              </div>
            ))}
            {returnedRecords.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">No return history</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
