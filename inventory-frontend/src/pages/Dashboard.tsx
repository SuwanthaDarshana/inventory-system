
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Items" value={totalItems} color="blue" />
        <Card title="In Store" value={inStore} color="green" />
        <Card title="Borrowed Items" value={borrowed} color="yellow" />
        <Card title="Active Borrows" value={activeBorrows} color="red" />
      </div>
    </div>
  );
}

function Card({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-500 text-blue-700",
    green: "bg-green-50 border-green-500 text-green-700",
    yellow: "bg-yellow-50 border-yellow-500 text-yellow-700",
    red: "bg-red-50 border-red-500 text-red-700",
  };
  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-sm ${colors[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
