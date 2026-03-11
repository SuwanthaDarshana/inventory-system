
import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import type { Item, BorrowRecord } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);

  useEffect(() => {
    api.get("/items").then((res) => setItems(res.data));
    api.get("/borrow-records").then((res) => setBorrows(res.data));
  }, []);

  const totalItems = items.length;
  const inStore = items.filter((i) => i.status === "IN_STORE").length;
  const borrowed = items.filter((i) => i.status === "BORROWED").length;
  const activeBorrows = borrows.filter((b) => b.status === "BORROWED").length;
  const recentBorrows = borrows.filter((b) => b.status === "BORROWED").slice(0, 5);

  const cards = [
    { title: "Total Items", value: totalItems, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", gradient: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50" },
    { title: "In Store", value: inStore, icon: "M5 13l4 4L19 7", gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
    { title: "Borrowed", value: borrowed, icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
    { title: "Active Borrows", value: activeBorrows, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-rose-500 to-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 sm:mb-4`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Active Borrows */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Active Borrows</h2>
          <p className="text-sm text-gray-500 mt-0.5">Items currently borrowed</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3">Item</th>
                <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Borrower</th>
                <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 sm:px-6 py-3">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBorrows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{r.item?.name}</p>
                    <p className="text-xs text-gray-400 sm:hidden">{r.borrower_name}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell text-sm text-gray-600">{r.borrower_name}</td>
                  <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-sm text-gray-500">{r.borrow_date}</td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">{r.quantity}</span>
                  </td>
                </tr>
              ))}
              {recentBorrows.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No active borrows</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
