import { useEffect, useState } from "react";
import api from "../api/api";
import type { AuditLog } from "../types";

const DetailView = ({ data }: { data: Record<string, unknown> | null }) => {
  if (!data || typeof data !== "object") return <span className="text-gray-400 italic">—</span>;

  const entries = Object.entries(data).filter(([k]) => !k.endsWith("_at") && k !== "id");

  return (
    <div className="space-y-1">
      {entries.map(([key, val]) => (
        <div key={key} className="flex gap-2 text-xs">
          <span className="text-gray-400 min-w-[70px] shrink-0">{key.replace(/_/g, " ")}:</span>
          <span className="text-gray-700 break-all">{String(val ?? "—")}</span>
        </div>
      ))}
    </div>
  );
};

const selectClass =
  "border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white";

const ActionBadge = ({ action }: { action: string }) => {
  const styles: Record<string, string> = {
    CREATE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    UPDATE: "bg-sky-50 text-sky-700 ring-sky-600/20",
    DELETE: "bg-red-50 text-red-700 ring-red-600/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${styles[action] || "bg-gray-50 text-gray-700 ring-gray-600/20"}`}>
      {action}
    </span>
  );
};

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track all system changes and activity</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          <span className="text-sm font-medium text-gray-600">Filters:</span>
        </div>
        <select value={filterTable} onChange={(e) => setFilterTable(e.target.value)} className={selectClass}>
          <option value="">All Tables</option>
          <option value="items">Items</option>
          <option value="borrow_records">Borrow Records</option>
          <option value="cupboards">Cupboards</option>
          <option value="places">Places</option>
          <option value="users">Users</option>
        </select>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className={selectClass}>
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        {(filterTable || filterAction) && (
          <button
            onClick={() => { setFilterTable(""); setFilterAction(""); }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Record ID</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white">
                      {log.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm text-gray-700">{log.user?.name || "System"}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><ActionBadge action={log.action} /></td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {log.table_name}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 font-mono">#{log.record_id}</td>
                <td className="px-5 py-4 max-w-sm">
                  <DetailView data={(log.new_value || log.old_value) as Record<string, unknown> | null} />
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                No logs found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                  {log.user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.user?.name || "System"}</p>
                  <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
              <ActionBadge action={log.action} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Table:</span>{" "}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{log.table_name}</span>
              </div>
              <div><span className="text-gray-400">ID:</span> <span className="text-gray-700 font-mono">#{log.record_id}</span></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <DetailView data={(log.new_value || log.old_value) as Record<string, unknown> | null} />
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">No logs found</div>
        )}
      </div>
    </div>
  );
}
