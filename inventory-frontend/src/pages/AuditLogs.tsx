import { useEffect, useState } from "react";
import api from "../api/api";
import type { AuditLog } from "../types";

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterTable) params.table_name = filterTable;
    if (filterAction) params.action = filterAction;
    api.get("/audit-logs", { params }).then((res) => setLogs(res.data.data || res.data));
  }, [filterTable, filterAction]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="flex gap-4 mb-4">
        <select value={filterTable} onChange={(e) => setFilterTable(e.target.value)} className="border rounded p-2">
          <option value="">All Tables</option>
          <option value="items">Items</option>
          <option value="borrow_records">Borrow Records</option>
          <option value="cupboards">Cupboards</option>
          <option value="places">Places</option>
          <option value="users">Users</option>
        </select>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="border rounded p-2">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Table</th>
              <th className="p-3">Record ID</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 text-sm">{log.user?.name}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    log.action === "CREATE" ? "bg-green-100 text-green-800" :
                    log.action === "UPDATE" ? "bg-blue-100 text-blue-800" :
                    "bg-red-100 text-red-800"
                  }`}>{log.action}</span>
                </td>
                <td className="p-3 text-sm">{log.table_name}</td>
                <td className="p-3 text-sm">{log.record_id}</td>
                <td className="p-3 text-xs text-gray-500 max-w-xs truncate">
                  {log.new_value ? JSON.stringify(log.new_value) : JSON.stringify(log.old_value)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
